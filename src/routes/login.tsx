import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Đăng nhập admin — Du Lịch Gia Lai" }] }),
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, session, isAdmin, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    setCreatedUserId(null);

    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/admin` : undefined,
          },
        });

    setSubmitting(false);

    if (result.error) {
      setNotice({ type: "error", text: result.error.message });
      return;
    }

    if (mode === "signup") {
      setCreatedUserId(result.data.user?.id ?? null);
      setNotice({ type: "success", text: "Đã tạo tài khoản. Hãy gửi User ID bên dưới để cấp quyền admin." });
    } else {
      setNotice({ type: "success", text: "Đăng nhập thành công. Đang chuyển tới CMS..." });
      window.setTimeout(() => navigate({ to: "/admin" }), 250);
    }
  }

  async function copyUserId() {
    const id = createdUserId ?? session?.user.id;
    if (!id) return;
    await navigator.clipboard.writeText(id);
    setNotice({ type: "success", text: "Đã copy User ID." });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center">
        <Link to="/" className="mb-6 text-sm font-semibold text-primary hover:underline">
          ← Về trang chủ
        </Link>

        <section className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-7">
          <div className="mb-6">
            <p className="text-sm font-semibold text-primary">Gia Lai CMS</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
              {mode === "signin" ? "Đăng nhập admin" : "Tạo tài khoản admin"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Dùng email và mật khẩu đã đăng ký để vào trang quản trị."
                : "Sau khi tạo tài khoản, copy User ID gửi lại để được cấp quyền admin."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-foreground" htmlFor="email">
              Email
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block text-sm font-medium text-foreground" htmlFor="password">
              Mật khẩu
              <input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Tối thiểu 6 ký tự"
              />
            </label>

            <button
              type="submit"
              disabled={submitting || loading}
              className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang xử lý..." : mode === "signin" ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setNotice(null);
              setCreatedUserId(null);
            }}
            className="mt-4 w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            {mode === "signin" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </button>

          {notice && (
            <p className={`mt-4 rounded-md border p-3 text-sm ${notice.type === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/25 bg-primary/10 text-foreground"}`}>
              {notice.text}
            </p>
          )}

          {(createdUserId || (session && !isAdmin)) && (
            <div className="mt-4 rounded-md border border-sun/30 bg-sun/10 p-3 text-sm text-foreground">
              <p className="font-medium">User ID</p>
              <code className="mt-2 block select-all break-all rounded-md border border-border bg-background p-2 font-mono text-xs">
                {createdUserId ?? session?.user.id}
              </code>
              <button
                type="button"
                onClick={copyUserId}
                className="mt-3 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-muted"
              >
                Copy User ID
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
