"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { USERS_DB } from "@/lib/auth";

interface AuthSignInProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
  onCancel: () => void;
  onSubmitSignIn: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
}

export const AuthSignIn: React.FC<AuthSignInProps> = ({
  onForgotPassword,
  onSignUp,
  onCancel,
  onSubmitSignIn,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your credentials to proceed.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await onSubmitSignIn(username, password);
      if (!res.success) {
        setError(res.error || "Invalid username or password.");
      }
    } catch (err: any) {
      setError("Authentication error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (presetUser: string, presetPass: string) => {
    setUsername(presetUser);
    setPassword(presetPass);
    setError(null);
    setIsLoading(true);

    try {
      const res = await onSubmitSignIn(presetUser, presetPass);
      if (!res.success) {
        setError(res.error || "Preset login failed.");
      }
    } catch (err: any) {
      setError("Preset authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="p-8 sm:p-10"
    >
      {/* Title & Subtitle matching reference */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Login</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter your credentials to access your account.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/80 flex items-start gap-2 text-red-300 text-xs">
          <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email or Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your email or username"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#007BC0] focus:ring-1 focus:ring-[#007BC0] transition-all"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-[#75BEDE] hover:text-white transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#007BC0] focus:ring-1 focus:ring-[#007BC0] transition-all"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Buttons Row matching reference image */}
        <div className="flex items-center justify-between gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#007BC0] to-[#013880] hover:from-[#007BC0]/90 hover:to-[#013880]/90 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-[#007BC0]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            <span>Login</span>
          </button>
        </div>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSignUp}
          className="font-medium text-[#75BEDE] hover:text-white transition-colors cursor-pointer ml-1"
        >
          Create account
        </button>
      </div>

      {/* Discreet 1-Click Demo Presets */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Demo Access
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Pass: nusaqc2026</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectPreset(USERS_DB.operator.user.username, USERS_DB.operator.password)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-amber-500/50 bg-slate-950/70 hover:bg-amber-500/10 text-slate-300 text-xs font-medium text-left truncate transition-colors cursor-pointer"
          >
            <div className="text-[10px] text-amber-400 font-semibold">Operator</div>
            <div className="text-xs truncate text-slate-200">Budi S.</div>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectPreset(USERS_DB.supervisor.user.username, USERS_DB.supervisor.password)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-sky-500/50 bg-slate-950/70 hover:bg-sky-500/10 text-slate-300 text-xs font-medium text-left truncate transition-colors cursor-pointer"
          >
            <div className="text-[10px] text-sky-400 font-semibold">Supervisor</div>
            <div className="text-xs truncate text-slate-200">Dewi L.</div>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectPreset(USERS_DB.admin.user.username, USERS_DB.admin.password)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 bg-slate-950/70 hover:bg-emerald-500/10 text-slate-300 text-xs font-medium text-left truncate transition-colors cursor-pointer"
          >
            <div className="text-[10px] text-emerald-400 font-semibold">Admin</div>
            <div className="text-xs truncate text-slate-200">Admin QC</div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
