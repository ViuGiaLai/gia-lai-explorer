import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { buildCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/am-thuc")({
  head: () => ({
    meta: [
      { title: "Ẩm thực Gia Lai — Đặc sản phố núi Pleiku" },
      { name: "description", content: "Khám phá ẩm thực Gia Lai: phở khô hai tô, bún mắm cua, bò một nắng chấm muối kiến vàng, cơm lam gà nướng và nhiều món đặc sản khác." },
      { property: "og:title", content: "Ẩm thực Gia Lai — Đặc sản phố núi Pleiku" },
      { property: "og:description", content: "Cẩm nang đặc sản và quán ăn nổi tiếng tại Gia Lai." },
      { property: "og:url", content: buildCanonicalUrl("/am-thuc") },
    ],
    links: [{ rel: "canonical", href: buildCanonicalUrl("/am-thuc") }],
  }),
  component: FoodPage,
});

function FoodPage() {
  const { data } = useQuery({
    queryKey: ["foods", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Ẩm thực</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground md:text-5xl">
          Đặc sản Gia Lai
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Hương vị phố núi đa dạng từ những quán bình dân lâu năm đến các nhà hàng nổi tiếng.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((f) => (
            <article key={f.id} className="overflow-hidden rounded-2xl bg-card shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
              {f.image && (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={f.image} alt={f.name} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-110" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-display text-xl font-bold text-foreground">{f.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                {(f.where_to_eat || f.address) && (
                  <div className="mt-4 rounded-lg bg-muted/60 p-3 text-sm">
                    {f.where_to_eat && <p className="font-semibold text-foreground">{f.where_to_eat}</p>}
                    {f.address && (
                      <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                        {f.address}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
