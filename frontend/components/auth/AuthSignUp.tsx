"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Role } from "@/lib/auth";

interface AuthSignUpProps {
  onSignIn: () => void;
  onSubmitSignUp: (data: { name: string; usernameOrEmail: string; password: string; role: Role }) => Promise<{ success: boolean; error?: string }>;
}

export const AuthSignUp: React.FC<AuthSignUpProps> = ({ onSignIn, onSubmitSignUp }) => {
  const [fullName, setFullName] = useState("");
  const [emailOrUser, setEmailOrUser] = useState("");
  const [role, setRole] = useState<Role>("operator");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!emailOrUser.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await onSubmitSignUp({
        name: fullName.trim(),
        usernameOrEmail: emailOrUser.trim(),
        password,
        role,
      });

      if (!res.success) {
        setError(res.error || "Registration failed.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter your details to register a terminal account.
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
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#007BC0] focus:ring-1 focus:ring-[#007BC0] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email or Username
          </label>
          <input
            type="text"
            value={emailOrUser}
            onChange={(e) => setEmailOrUser(e.target.value)}
            placeholder="Enter your email or username"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#007BC0] focus:ring-1 focus:ring-[#007BC0] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "operator", label: "Operator" },
              { key: "supervisor", label: "Supervisor" },
              { key: "admin", label: "Admin" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setRole(item.key as Role)}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  role === item.key
                    ? "bg-[#007BC0] border-[#007BC0] text-white shadow-sm shadow-[#007BC0]/25"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min. 6 characters)"
              disabled={isLoading}
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#007BC0] focus:ring-1 focus:ring-[#007BC0] transition-all"
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

        <div className="flex items-center justify-between gap-3 pt-3">
          <button
            type="button"
            onClick={onSignIn}
            disabled={isLoading}
            className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#007BC0] to-[#013880] hover:from-[#007BC0]/90 hover:to-[#013880]/90 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-[#007BC0]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            <span>Register</span>
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignIn}
          className="font-medium text-[#75BEDE] hover:text-white transition-colors cursor-pointer ml-1"
        >
          Login
        </button>
      </div>
    </motion.div>
  );
};
