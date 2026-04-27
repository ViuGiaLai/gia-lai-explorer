import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Heart, Share2, Navigation, MapPin, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocationCard } from "@/components/LocationCard";
import { Button } from "@/components/ui/button";
import { haversine, youtubeEmbedFromUrl } from "@/lib/geo";
import { isSaved, toggleSaved } from "@/lib/saved-locations";

export const Route = createFileRoute("/dia-diem/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { location: data };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { location } = loaderData;
    const cover = location.images?.[0];
    return {
      meta: [
        { title: `${location.name} — Du Lịch Gia Lai` },
        { name: "description", content: location.short_description },
        { property: "og:title", content: `${location.name} — Du Lịch Gia Lai` },
        { property: "og:description", content: location.short_description },
        ...(cover ? [{ property: "og:image", content: cover }] : []),
        { property: "og:type", content: "article" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            name: location.name,
            description: location.short_description,
            image: cover,
            ...(location.latitude && location.longitude ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: location.latitude,
                longitude: location.longitude,
              },
            } : {}),
          }),
        },
      ],
    };
  },
  component: LocationDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-bold">Không tìm thấy địa điểm</h1>
        <Link to="/dia-diem" className="mt-4 inline-block text-primary hover:underline">← Về danh sách địa điểm</Link>
      </div>
    </div>
  ),
});

function LocationDetailPage() {
  const { location } = Route.useLoaderData();
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSaved(location.slug));
  }, [location.slug]);

  const { data: nearby } = useQuery({
    queryKey: ["nearby", location.id],
    enabled: location.latitude != null && location.longitude != null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("slug,name,short_description,images,latitude,longitude")
        .neq("id", location.id);
      if (error) throw error;
      const lat = Number(location.latitude);
      const lng = Number(location.longitude);
      return data
        .filter((d) => d.latitude != null && d.longitude != null)
        .map((d) => ({ ...d, dist: haversine(lat, lng, Number(d.latitude), Number(d.longitude)) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3);
    },
  });

  const ytEmbed = youtubeEmbedFromUrl(location.video_url);

  function handleSave() {
    const newState = toggleSaved(location.slug);
    setSaved(newState);
    toast.success(newState ? "Đã lưu địa điểm" : "Đã bỏ lưu");
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: location.name, text: location.short_description, url });
        return;
      } catch { /* user cancelled */ }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép link");
    }
  }

  function handleDirections() {
    const dest = location.latitude && location.longitude
      ? `${location.latitude},${location.longitude}`
      : encodeURIComponent(location.name + " Gia Lai");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Gallery hero */}
      <section className="relative">
        <div className="aspect-[16/9] max-h-[70vh] w-full overflow-hidden bg-muted">
          {location.images?.[activeImg] && (
            <img
              src={location.images[activeImg]}
              alt={location.name}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
        <div className="container mx-auto -mt-24 px-4 md:-mt-32">
          <div className="rounded-3xl bg-card p-6 shadow-elegant md:p-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> Gia Lai
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">
              {location.name}
            </h1>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">{location.short_description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleDirections} className="gap-2">
                <Navigation className="h-4 w-4" /> Xem đường đi
              </Button>
              <Button variant="outline" onClick={handleSave} className="gap-2">
                <Heart className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : ""}`} />
                {saved ? "Đã lưu" : "Lưu địa điểm"}
              </Button>
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" /> Chia sẻ
              </Button>
            </div>

            {location.images && location.images.length > 1 && (
              <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                {location.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${idx === activeImg ? "border-primary" : "border-transparent opacity-70"}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="prose prose-lg max-w-none text-foreground">
            <h2 className="font-display text-2xl font-bold">Giới thiệu</h2>
            <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
              {location.description}
            </div>
          </div>

          {ytEmbed && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Video</h2>
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl shadow-card">
                <iframe
                  src={ytEmbed}
                  title={location.name}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          )}

          {location.map_embed && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Bản đồ</h2>
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl shadow-card">
                <iframe
                  src={location.map_embed}
                  title={`Bản đồ ${location.name}`}
                  loading="lazy"
                  className="h-full w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar tips */}
        <aside className="space-y-6">
          {location.tips && (
            <div className="rounded-2xl border border-sun/30 bg-sun/10 p-6">
              <div className="flex items-center gap-2 text-sun-foreground">
                <Lightbulb className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold">Mẹo du lịch</h3>
              </div>
              <div className="mt-3 whitespace-pre-line text-sm text-foreground/85">
                {location.tips}
              </div>
            </div>
          )}

          {location.latitude && location.longitude && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground">Tọa độ</h3>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                {Number(location.latitude).toFixed(4)}, {Number(location.longitude).toFixed(4)}
              </p>
            </div>
          )}
        </aside>
      </section>

      {/* Nearby */}
      {nearby && nearby.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Địa điểm gần đó</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((n) => (
              <div key={n.slug} className="relative">
                <LocationCard location={n} />
                <span className="absolute right-3 top-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                  {n.dist.toFixed(1)} km
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
