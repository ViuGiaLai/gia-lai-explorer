// Khoảng cách haversine giữa 2 điểm (km)
export function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function youtubeEmbedFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const cleanUrl = url.trim();

  // Nếu đã là link embed, chuẩn hóa lại để loại bỏ params thừa
  if (cleanUrl.includes("/embed/")) {
    const parts = cleanUrl.split("/embed/");
    if (parts.length > 1) {
      const rawId = parts[1].split("?")[0].split("&")[0].split("#")[0].trim();
      // Accept IDs with valid YouTube format (11 chars: alphanumeric, -, _)
      if (rawId && rawId.match(/^[\w-]+$/)) {
        return `https://www.youtube.com/embed/${rawId}`;
      }
    }
    return null;
  }

  // Xử lý các dạng link YouTube khác (youtu.be, watch, shorts)
  let videoId = null;

  // youtu.be/VIDEO_ID
  const youtubeShortMatch = cleanUrl.match(/youtu\.be\/([\w-]+)/);
  if (youtubeShortMatch) {
    videoId = youtubeShortMatch[1];
  }

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = cleanUrl.match(/youtube\.com\/watch\?.*v=([\w-]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([\w-]+)/);
  if (shortsMatch) {
    videoId = shortsMatch[1];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
