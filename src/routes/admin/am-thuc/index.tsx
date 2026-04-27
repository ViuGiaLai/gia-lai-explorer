import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Utensils, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/am-thuc/")({
  component: FoodList,
});

interface Food {
  id: string;
  name: string;
  description: string;
  image?: string | null;
  address?: string | null;
  where_to_eat?: string | null;
  created_at: string;
}

function FoodList() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: foods, isLoading } = useQuery({
    queryKey: ["admin", "foods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as Food[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("foods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "foods"] });
      toast.success("Đã xóa món ăn");
    },
    onError: () => toast.error("Không thể xóa"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Quản lý Món ăn</h1>
          <p className="mt-1 text-sm text-muted-foreground">Thêm và chỉnh sửa đặc sản ẩm thực</p>
        </div>
        <Button asChild>
          <Link to="/admin/am-thuc/moi">
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : foods?.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-bold">Chưa có món ăn nào</h3>
          <p className="mt-2 text-sm text-muted-foreground">Thêm món ăn đầu tiên để bắt đầu</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {foods?.map((food) => (
            <div key={food.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {food.image && (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={food.image} alt={food.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-foreground">{food.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{food.description}</p>
                {food.address && (
                  <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{food.address}</span>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingId(food.id)}>
                    <Pencil className="mr-1 h-3 w-3" /> Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(food.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
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
  const { data: food } = useQuery({
    queryKey: ["admin", "food", id],
    queryFn: async () => {
      const { data } = await supabase.from("foods").select("*").eq("id", id).single();
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Food>) => {
      const { error } = await supabase.from("foods").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "foods"] });
      toast.success("Đã cập nhật");
      onClose();
    },
    onError: () => toast.error("Cập nhật thất bại"),
  });

  if (!food) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-card p-6">
        <h2 className="font-display text-2xl font-bold">Chỉnh sửa món ăn</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Tên món</label>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              defaultValue={food.name}
              onChange={(e) => updateMutation.mutate({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              defaultValue={food.description}
              onChange={(e) => updateMutation.mutate({ description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Địa chỉ</label>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              defaultValue={food.address || ""}
              onChange={(e) => updateMutation.mutate({ address: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Gợi ý quán</label>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              defaultValue={food.where_to_eat || ""}
              onChange={(e) => updateMutation.mutate({ where_to_eat: e.target.value })}
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
