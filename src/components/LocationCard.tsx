import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

interface LocationCardData {
  slug: string;
  name: string;
  short_description: string;
  images: string[];
}

export function LocationCard({ location }: { location: LocationCardData }) {
  const cover = location.images?.[0] ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80";

  return (
    <Link
      to="/dia-diem/$slug"
      params={{ slug: location.slug }}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={location.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
          <MapPin className="h-3 w-3" />
          Gia Lai
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">
          {location.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {location.short_description}
        </p>
      </div>
    </Link>
  );
}
