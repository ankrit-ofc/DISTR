"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockMinutes, setLockMinutes] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLockMinutes(null);

    try {
      const res = await api.post("/auth/login", { email: identifier, password });
      const user = res.data.user ?? res.data.profile;
      setAuth(res.data.token, user);
      toast.success("Welcome back!");

      const redirect = searchParams.get("redirect");
      if (user.role === "ADMIN") {
        router.push(redirect || "/admin");
      } else {
        router.push(redirect || "/");
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; minutesLeft?: number; code?: string } } })
        ?.response?.data;

      const isNetworkError = !(err as { response?: unknown })?.response;
      if (isNetworkError) {
        setError("Cannot reach the server. Make sure the API is running.");
      } else if (data?.code === "ACCOUNT_SUSPENDED") {
        setError("Your account has been suspended. Contact support on WhatsApp.");
      } else if (data?.code === "ACCOUNT_LOCKED" || data?.minutesLeft) {
        setLockMinutes(data?.minutesLeft ?? 5);
        setError(null);
      } else {
        setError(data?.message || "Incorrect phone number or password.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-grotesk font-bold text-3xl text-blue">
            DISTRO
          </Link>
          <p className="text-gray-400 text-sm mt-2">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl shadow-xl shadow-gray-200/50 rounded-3xl border border-white/50 p-8 space-y-5"
        >
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">
              Email or Phone
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="yourshop@gmail.com or 98XXXXXXXX"
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error states */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {lockMinutes !== null && (
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 rounded-xl p-3 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              Account temporarily locked. Try again in{" "}
              <span className="font-semibold">{lockMinutes} minute{lockMinutes !== 1 ? "s" : ""}</span>.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue hover:bg-blue-dark hover:shadow-lg hover:shadow-blue/30 disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-2xl transition-all duration-200"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          New to DISTRO?{" "}
          <Link href="/register" className="text-blue font-medium hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
