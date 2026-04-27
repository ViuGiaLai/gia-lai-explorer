// LocalStorage helpers cho tính năng "lưu địa điểm"
const KEY = "gialai:saved-locations";

export function getSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isSaved(slug: string): boolean {
  return getSaved().includes(slug);
}

export function toggleSaved(slug: string): boolean {
  const list = getSaved();
  const idx = list.indexOf(slug);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(slug);
  }
  localStorage.setItem(KEY, JSON.stringify(list));
  return idx < 0; // true if newly saved
}
