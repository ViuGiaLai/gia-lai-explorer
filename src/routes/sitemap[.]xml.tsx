import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        const base = "https://du-lich-gia-lai.lovable.app";
        let urls = ["/", "/dia-diem", "/lich-trinh", "/am-thuc"];
        if (url && key) {
          const sb = createClient(url, key);
          const { data } = await sb.from("locations").select("slug,updated_at");
          if (data) urls = urls.concat(data.map((d) => `/dia-diem/${d.slug}`));
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
