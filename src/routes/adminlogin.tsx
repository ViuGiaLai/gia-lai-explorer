import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/adminlogin")({
  head: () => ({ meta: [{ title: "Admin Login — Du Lịch Gia Lai" }] }),
  ssr: false,
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, session, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    setNewUserId(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg({ type: "ok", text: "Đăng nhập thành công." });
        setTimeout(() => navigate({ to: "/admin" }), 300);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== "undefined" ? `${window.location.origin}/admin` : undefined,
          },
        });
        if (error) throw error;
        setNewUserId(data.user?.id ?? null);
        setMsg({ type: "ok", text: "Đã tạo tài khoản. Copy User ID gửi để cấp quyền admin." });
      }
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message ?? "Có lỗi xảy ra." });
    } finally {
      setSubmitting(false);
    }
  }

  async function copyId() {
    const id = newUserId ?? session?.user.id;
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = id;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const displayId = newUserId ?? (session && !isAdmin ? session.user.id : null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#0f172a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#1e293b",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        <a
          href="/"
          style={{ color: "#60a5fa", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 16 }}
        >
          ← Trang chủ
        </a>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px 0" }}>
          {mode === "signin" ? "Đăng nhập Admin" : "Đăng ký Admin"}
        </h1>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px 0" }}>
          {mode === "signin" ? "Nhập email và mật khẩu của bạn." : "Tạo tài khoản mới để được cấp quyền."}
        </p>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: "#cbd5e1" }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={{
                width: "100%",
                height: 42,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: 15,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: "#cbd5e1" }}>Mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              style={{
                width: "100%",
                height: 42,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: 15,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              height: 44,
              border: "none",
              borderRadius: 8,
              background: submitting ? "#475569" : "#3b82f6",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Đang xử lý..." : mode === "signin" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMsg(null);
            setNewUserId(null);
          }}
          style={{
            width: "100%",
            marginTop: 12,
            height: 40,
            background: "transparent",
            border: "1px solid #334155",
            borderRadius: 8,
            color: "#cbd5e1",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {mode === "signin" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
        </button>

        {msg && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              background: msg.type === "err" ? "#7f1d1d" : "#064e3b",
              color: "#fff",
            }}
          >
            {msg.text}
          </div>
        )}

        {displayId && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 8,
              background: "#0f172a",
              border: "1px solid #334155",
            }}
          >
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>User ID của bạn:</div>
            <code
              style={{
                display: "block",
                padding: 10,
                background: "#020617",
                borderRadius: 6,
                fontSize: 12,
                wordBreak: "break-all",
                color: "#fbbf24",
                userSelect: "all",
              }}
            >
              {displayId}
            </code>
            <button
              type="button"
              onClick={copyId}
              style={{
                marginTop: 10,
                padding: "8px 14px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {copied ? "✓ Đã copy" : "Copy User ID"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
