import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mountain, ShieldCheck, Eye, EyeOff, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Đăng nhập admin — Du Lịch Gia Lai" }] }),
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp, session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, session, isAdmin, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (mode === "signup") {
      toast.success("Đã tạo tài khoản. Liên hệ quản trị để được cấp quyền admin.");
    } else {
      toast.success("Đăng nhập thành công. Đang chuyển hướng...");
      // Wait a tick for isAdmin to be updated by auth state change listener
      setTimeout(() => {
        navigate({ to: "/admin" });
      }, 100);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-earth/10" />
      <div className="absolute -left-32 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-24 h-96 w-96 rounded-full bg-sun/25 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:px-8">
        <section className="hidden md:block">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm backdrop-blur">
            <Mountain className="h-4 w-4 text-primary" />
            Du Lịch Gia Lai
          </Link>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight text-foreground">
            Quản trị nội dung <span className="text-primary">nhanh, gọn, an toàn</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Đăng nhập để quản lý địa điểm, lịch trình và ẩm thực Gia Lai. Giao diện mới tối ưu thao tác, dễ nhìn và mượt hơn.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-2 text-foreground/90">
              <ShieldCheck className="h-4 w-4 text-primary" /> Bảo mật bằng Supabase Auth
            </li>
            <li className="flex items-center gap-2 text-foreground/90">
              <ShieldCheck className="h-4 w-4 text-primary" /> Kiểm tra quyền admin tự động
            </li>
            <li className="flex items-center gap-2 text-foreground/90">
              <ShieldCheck className="h-4 w-4 text-primary" /> Truy cập CMS trực tiếp sau khi đăng nhập
            </li>
          </ul>
        </section>

        <section className="w-full">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-border/60 bg-card/90 p-6 shadow-elegant backdrop-blur md:p-8">
            <Link to="/" className="mb-4 inline-flex items-center gap-2 font-display text-xl font-bold text-primary md:hidden">
              <Mountain className="h-6 w-6" /> Du Lịch Gia Lai
            </Link>
            <h2 className="font-display text-3xl font-bold text-foreground">
              {mode === "signin" ? "Đăng nhập Admin" : "Tạo tài khoản"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Nhập email và mật khẩu để vào trang quản trị."
                : "Tạo tài khoản mới, sau đó cần được cấp quyền admin."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-11"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  {loading && <span className="text-xs text-muted-foreground">Đang kiểm tra phiên...</span>}
                </div>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="h-11 w-full" disabled={submitting || loading}>
                {submitting ? "Đang xử lý..." : mode === "signin" ? "Đăng nhập" : "Đăng ký"}
                {!submitting && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-4 w-full rounded-lg border border-transparent py-2 text-center text-sm text-muted-foreground transition hover:border-border hover:text-primary"
            >
              {mode === "signin" ? "Chưa có tài khoản? Tạo tài khoản" : "Đã có tài khoản? Đăng nhập"}
            </button>

            {session && !isAdmin && (
              <div className="mt-4 rounded-xl border border-sun/30 bg-sun/10 p-3 text-xs text-foreground/85">
                Bạn đã đăng nhập nhưng chưa có quyền admin. Hãy liên hệ quản trị để được cấp quyền.
                <br />User ID: <code className="font-mono">{session.user.id}</code>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
