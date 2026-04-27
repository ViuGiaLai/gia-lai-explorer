import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/dia-diem/$id")({
  component: LocationForm,
});

const schema = z.object({
  name: z.string().trim().min(1, "Bắt buộc").max(200),
  slug: z.string().trim().min(1, "Bắt buộc").max(150).regex(/^[a-z0-9-]+$/, "Chỉ chữ thường, số và dấu -"),
  short_description: z.string().trim().max(500).default(""),
  description: z.string().trim().max(10000).default(""),
  video_url: z.string().trim().max(500).optional().or(z.literal("")),
  map_embed: z.string().trim().max(2000).optional().or(z.literal("")),
  latitude: z.string().optional().or(z.literal("")),
  longitude: z.string().optional().or(z.literal("")),
  tips: z.string().trim().max(2000).optional().or(z.literal("")),
  featured: z.boolean().default(false),
});

function slugify(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function LocationForm() {
  const { id } = Route.useParams();
  const isNew = id === "moi";
  const navigate = useNavigate();

  const { data: existing, isLoading } = useQuery({
    enabled: !isNew,
    queryKey: ["admin", "location", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const [form, setForm] = useState({
    name: "", slug: "", short_description: "", description: "",
    video_url: "", map_embed: "", latitude: "", longitude: "", tips: "", featured: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        slug: existing.slug,
        short_description: existing.short_description ?? "",
        description: existing.description ?? "",
        video_url: existing.video_url ?? "",
        map_embed: existing.map_embed ?? "",
        latitude: existing.latitude?.toString() ?? "",
        longitude: existing.longitude?.toString() ?? "",
        tips: existing.tips ?? "",
        featured: existing.featured,
      });
      setImages(existing.images ?? []);
    }
  }, [existing]);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name" && isNew) {
      setForm((f) => ({ ...f, slug: slugify(value as string) }));
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("location-images").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("location-images").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...newUrls]);
      toast.success(`Đã tải lên ${newUrls.length} ảnh`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const payload = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      short_description: parsed.data.short_description,
      description: parsed.data.description,
      images,
      video_url: parsed.data.video_url || null,
      map_embed: parsed.data.map_embed || null,
      latitude: parsed.data.latitude ? Number(parsed.data.latitude) : null,
      longitude: parsed.data.longitude ? Number(parsed.data.longitude) : null,
      tips: parsed.data.tips || null,
      featured: parsed.data.featured,
    };
    const { error } = isNew
      ? await supabase.from("locations").insert(payload)
      : await supabase.from("locations").update(payload).eq("id", id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isNew ? "Đã tạo địa điểm" : "Đã cập nhật");
    navigate({ to: "/admin/dia-diem" });
  }

  if (!isNew && isLoading) return <p className="text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/dia-diem"><ArrowLeft className="mr-1 h-4 w-4" /> Quay lại</Link>
        </Button>
        <h1 className="font-display text-3xl font-bold text-foreground">
          {isNew ? "Thêm địa điểm" : "Chỉnh sửa địa điểm"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <div>
              <Label htmlFor="name">Tên địa điểm *</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required maxLength={200} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input id="slug" value={form.slug} onChange={(e) => update("slug", e.target.value)} required maxLength={150} className="mt-1 font-mono" />
            </div>
            <div>
              <Label htmlFor="short">Mô tả ngắn</Label>
              <Textarea id="short" value={form.short_description} onChange={(e) => update("short_description", e.target.value)} maxLength={500} rows={2} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="desc">Mô tả đầy đủ</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={10000} rows={8} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="tips">Mẹo du lịch</Label>
              <Textarea id="tips" value={form.tips} onChange={(e) => update("tips", e.target.value)} maxLength={2000} rows={4} className="mt-1" placeholder="Mỗi mẹo trên 1 dòng..." />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <h3 className="font-display font-bold text-foreground">Media & vị trí</h3>
            <div>
              <Label htmlFor="video">Link YouTube (URL hoặc embed)</Label>
              <Input id="video" value={form.video_url} onChange={(e) => update("video_url", e.target.value)} className="mt-1" placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div>
              <Label htmlFor="map">Google Maps embed src</Label>
              <Textarea id="map" value={form.map_embed} onChange={(e) => update("map_embed", e.target.value)} rows={2} className="mt-1 font-mono text-xs" placeholder="https://www.google.com/maps/embed?pb=..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input id="lng" type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <Label htmlFor="featured" className="font-display text-base font-bold">Hiện ở trang chủ</Label>
              <Switch id="featured" checked={form.featured} onCheckedChange={(v) => update("featured", v)} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display font-bold text-foreground">Ảnh</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary hover:text-primary">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Đang tải..." : "Tải ảnh lên"}
              <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Đang lưu..." : isNew ? "Tạo địa điểm" : "Cập nhật"}
          </Button>
        </div>
      </form>
    </div>
  );
}
