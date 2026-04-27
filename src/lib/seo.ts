const FALLBACK_SITE_URL = "https://gialaiexplorer.vercel.app/";

export function getSiteUrl() {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env.PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.VITE_PUBLIC_SITE_URL ||
      FALLBACK_SITE_URL
    ).replace(/\/+$/, "");
  }
  
  // Client-side fallback
  return (
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    FALLBACK_SITE_URL
  ).replace(/\/+$/, "");
}

export function buildCanonicalUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
