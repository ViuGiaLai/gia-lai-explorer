import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, MapPin, LogOut, Mountain } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Du Lịch Gia Lai" }] }),
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      navigate({ to: "/login" });
    }
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/dia-diem", label: "Địa điểm", icon: MapPin },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <Link to="/" className="flex items-center gap-2 px-6 py-5 font-display text-lg font-bold">
          <Mountain className="h-6 w-6 text-sidebar-primary" />
          Gia Lai CMS
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-3 text-xs text-sidebar-foreground/60 truncate">{session.user.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4 md:hidden">
          <span className="font-display font-bold text-primary">Gia Lai CMS</span>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
        </header>
        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
