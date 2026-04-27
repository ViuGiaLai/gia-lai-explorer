import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mountain } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-elegant">
        <Link to="/" className="flex items-center justify-center gap-2 font-display text-2xl font-bold text-primary">
          <Mountain className="h-7 w-7" /> Du Lịch Gia Lai
        </Link>
        <h1 className="mt-6 text-center font-display text-2xl font-bold text-foreground">
          {mode === "signin" ? "Đăng nhập admin" : "Tạo tài khoản"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Truy cập quản trị nội dung" : "Đăng ký tài khoản mới (cần được cấp quyền admin)"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Đang xử lý..." : mode === "signin" ? "Đăng nhập" : "Đăng ký"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "signin" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
        </button>

        {session && !isAdmin && (
          <div className="mt-4 rounded-lg border border-sun/30 bg-sun/10 p-3 text-xs text-foreground/85">
            Bạn đã đăng nhập nhưng chưa có quyền admin. Hãy liên hệ quản trị để được cấp quyền.
            <br />User ID: <code className="font-mono">{session.user.id}</code>
          </div>
        )}
      </div>
    </div>
  );
}
