//  Khoảng cách haversine giữa 2 điểm (km)
export function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// Convert link YouTube → embed
export function youtubeEmbedFromUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;

  const cleanUrl = url.trim();

  //  Nếu đã là link embed
  if (cleanUrl.includes("/embed/")) {
    const match = cleanUrl.match(/embed\/([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  }

  let videoId: string | null = null;

  //  youtu.be/VIDEO_ID
  const shortMatch = cleanUrl.match(/youtu\.be\/([\w-]{11})/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }

  //  youtube.com/watch?v=VIDEO_ID
  // fix: không dùng .* nữa
  const watchMatch = cleanUrl.match(/[?&]v=([\w-]{11})/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(/shorts\/([\w-]{11})/);
  if (shortsMatch) {
    videoId = shortsMatch[1];
  }

  return videoId
    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1`
    : null;
}