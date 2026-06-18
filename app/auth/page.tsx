"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    supabaseRef.current = createClient();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = supabaseRef.current;
    if (!supabase) return;

    setLoading(true);
    setError("");

    const fn = isLogin
      ? supabase.auth.signInWithPassword
      : supabase.auth.signUp;

    const { error } = await fn({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (!isLogin) {
      setCheckEmail(true);
      setLoading(false);
    } else {
      router.push("/app");
    }
  }

  async function handleGoogle() {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {checkEmail ? (
          <>
            <h1 className="text-3xl font-bold mb-1">Cek Email</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Kami sudah kirim link konfirmasi ke <strong>{email}</strong>.
              Klik link di email untuk aktivasi akun.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setCheckEmail(false); setIsLogin(true); }}
            >
              Kembali ke Masuk
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-1">
              {isLogin ? "Masuk" : "Daftar"}
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              {isLogin ? "Akses Quantum Leaps" : "Buat akun baru"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <p className="text-sm text-sell">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gold text-background hover:bg-gold-light"
                disabled={loading}
              >
                {loading ? "Loading..." : isLogin ? "Masuk" : "Daftar"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">atau</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
            >
              Masuk dengan Google
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gold hover:underline"
              >
                {isLogin ? "Daftar" : "Masuk"}
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
