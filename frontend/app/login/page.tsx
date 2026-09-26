"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, USERS_DB } from "@/lib/auth";
import {
  Lock,
  User as UserIcon,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Silakan masukkan username dan password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await login(username, password);
      if (res.success) {
        router.push("/");
      } else {
        setError(res.error || "Login gagal. Periksa kredensial Anda.");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan pada sistem autentikasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleKey: "operator" | "supervisor" | "admin") => {
    const preset = USERS_DB[roleKey];
    if (!preset) return;
    setUsername(preset.user.username);
    setPassword(preset.password);
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await login(preset.user.username, preset.password);
      if (res.success) {
        router.push("/");
      } else {
        setError(res.error || "Gagal masuk menggunakan preset.");
      }
    } catch {
      setError("Gagal melakukan autentikasi otomatis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl mb-3 shadow-inner">
              <img src="/logo.svg" alt="NusaQC Logo" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">NusaQC AI Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Industrial Fish Quality Control & Storage Allocation System
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-red-300 text-xs animate-shake">
              <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="size-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: operator / supervisor / admin"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  autoComplete="username"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="size-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              <span>{isSubmitting ? "Mengautentikasi..." : "Masuk ke Sistem"}</span>
            </button>
          </form>

          {/* Quick Jury / Demo Presets */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="size-3.5 text-amber-400" />
                Demo 1-Click Role Presets
              </span>
              <span className="text-[10px] text-slate-500">Pass: nusaqc2026</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("operator")}
                disabled={isSubmitting}
                className="p-2.5 rounded-lg bg-slate-950/90 border border-amber-500/30 hover:border-amber-500/70 hover:bg-amber-500/10 transition-all text-left flex flex-col cursor-pointer disabled:opacity-50"
              >
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Operator
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                  Budi S.
                </span>
                <span className="text-[9px] text-slate-500 mt-1">QC Line 1</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("supervisor")}
                disabled={isSubmitting}
                className="p-2.5 rounded-lg bg-slate-950/90 border border-sky-500/30 hover:border-sky-500/70 hover:bg-sky-500/10 transition-all text-left flex flex-col cursor-pointer disabled:opacity-50"
              >
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                  Supervisor
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                  Dewi L.
                </span>
                <span className="text-[9px] text-slate-500 mt-1">Full QC Flow</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                disabled={isSubmitting}
                className="p-2.5 rounded-lg bg-slate-950/90 border border-emerald-500/30 hover:border-emerald-500/70 hover:bg-emerald-500/10 transition-all text-left flex flex-col cursor-pointer disabled:opacity-50"
              >
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Admin
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                  Admin QC
                </span>
                <span className="text-[9px] text-slate-500 mt-1">Full Control</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-400/80" />
            NusaQC Secure Enterprise Session • Role-Based Access Control
          </p>
        </div>
      </div>
    </div>
  );
}
