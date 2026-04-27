import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        const base = getSiteUrl();
        const pages: Array<{ loc: string; lastmod?: string }> = [
          { loc: "/" },
          { loc: "/dia-diem" },
          { loc: "/lich-trinh" },
          { loc: "/am-thuc" },
        ];
        if (url && key) {
          const sb = createClient(url, key);
          const { data } = await sb.from("locations").select("slug,updated_at");
          if (data) {
            pages.push(
              ...data.map((d) => ({
                loc: `/dia-diem/${d.slug}`,
                lastmod: d.updated_at || undefined,
              })),
            );
          }
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((page) =>
    `  <url><loc>${base}${page.loc}</loc>${
      page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ""
    }</url>`,
  )
  .join("\n")}
</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
