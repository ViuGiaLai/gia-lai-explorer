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
      const rawId = parts[1].split("?")[0].split("&")[0].split("#")[0];
      if (rawId.length === 11) {
        return `https://www.youtube.com/embed/${rawId}`;
      }
    }
    // Fallback: trả về null nếu không tìm thấy ID hợp lệ
    return null;
  }
  
  // Xử lý các dạng link YouTube khác (youtu.be, watch, shorts)
  const m = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
