import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/lich-trinh/")({
  component: ItineraryList,
});

interface Stop {
  day?: number;
  time: string;
  title: string;
  description: string;
  location_slug?: string | null;
}

interface Itinerary {
  id: string;
  title: string;
  summary: string;
  duration_days: number;
  content: Stop[];
  created_at: string;
}

function ItineraryList() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: itineraries, isLoading } = useQuery({
    queryKey: ["admin", "itineraries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .order("duration_days");
      if (error) throw error;
      return data as unknown as Itinerary[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("itineraries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "itineraries"] });
      toast.success("Đã xóa lịch trình");
    },
    onError: () => toast.error("Không thể xóa"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Quản lý Lịch trình</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tạo và chỉnh sửa các lịch trình du lịch</p>
        </div>
        <Button asChild>
          <a href="/admin/lich-trinh/moi">
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </a>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : itineraries?.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-bold">Chưa có lịch trình nào</h3>
          <p className="mt-2 text-sm text-muted-foreground">Tạo lịch trình đầu tiên để bắt đầu</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {itineraries?.map((it) => (
            <div key={it.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {it.duration_days} ngày
                    </span>
                    <h3 className="font-display text-xl font-bold text-foreground">{it.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{it.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {(it.content as Stop[])?.length || 0} điểm dừng
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(it.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(it.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId && (
        <EditDialog id={editingId} onClose={() => setEditingId(null)} />
      )}
    </div>
  );
}

function EditDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: itinerary } = useQuery({
    queryKey: ["admin", "itinerary", id],
    queryFn: async () => {
      const { data } = await supabase.from("itineraries").select("*").eq("id", id).single();
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Itinerary>) => {
      const { error } = await supabase.from("itineraries").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "itineraries"] });
      toast.success("Đã cập nhật");
      onClose();
    },
    onError: () => toast.error("Cập nhật thất bại"),
  });

  if (!itinerary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-card p-6">
        <h2 className="font-display text-2xl font-bold">Chỉnh sửa lịch trình</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Tiêu đề</label>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              defaultValue={itinerary.title}
              onChange={(e) => updateMutation.mutate({ title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tóm tắt</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              defaultValue={itinerary.summary}
              onChange={(e) => updateMutation.mutate({ summary: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
