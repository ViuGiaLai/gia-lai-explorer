import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/dia-diem/")({
  component: AdminLocationsList,
});

function AdminLocationsList() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id,name,slug,featured,images,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Đã xóa địa điểm");
      qc.invalidateQueries({ queryKey: ["admin", "locations"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Địa điểm</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý tất cả địa điểm du lịch</p>
        </div>
        <Button asChild>
          <Link to="/admin/dia-diem/$id" params={{ id: "moi" }}><Plus className="mr-2 h-4 w-4" /> Thêm địa điểm</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Ảnh</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3 hidden md:table-cell">Slug</th>
              <th className="px-4 py-3">Nổi bật</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Đang tải...</td></tr>}
            {data?.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chưa có địa điểm nào</td></tr>}
            {data?.map((loc) => (
              <tr key={loc.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  {loc.images?.[0] ? (
                    <img src={loc.images[0]} alt="" className="h-12 w-16 rounded-md object-cover" />
                  ) : <div className="h-12 w-16 rounded-md bg-muted" />}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{loc.name}</td>
                <td className="px-4 py-3 hidden font-mono text-xs text-muted-foreground md:table-cell">{loc.slug}</td>
                <td className="px-4 py-3">
                  {loc.featured && <span className="rounded-full bg-sun/20 px-2 py-0.5 text-xs font-medium text-sun-foreground">Có</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/admin/dia-diem/$id" params={{ id: loc.id }}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Xóa "${loc.name}"?`)) del.mutate(loc.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
