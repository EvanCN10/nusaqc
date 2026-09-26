"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

interface AuthForgotPasswordProps {
  onSignIn: () => void;
  onSuccess: (email: string) => void;
}

export const AuthForgotPassword: React.FC<AuthForgotPasswordProps> = ({ onSignIn, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSuccess(email.trim());
    }, 700);
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter your email to receive recovery instructions.
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
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#007BC0] focus:ring-1 focus:ring-[#007BC0] transition-all"
            required
          />
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
            <span>Send Instructions</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};
