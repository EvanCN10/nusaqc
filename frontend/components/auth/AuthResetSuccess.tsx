"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface AuthResetSuccessProps {
  email: string;
  onSignIn: () => void;
}

export const AuthResetSuccess: React.FC<AuthResetSuccessProps> = ({ email, onSignIn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="p-8 sm:p-10 text-center"
    >
      <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="size-6 text-emerald-400" />
      </div>

      <h1 className="text-2xl font-bold text-white tracking-tight">Instructions Sent</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
        A password reset link has been sent to{" "}
        <span className="font-medium text-slate-200">{email}</span>.
      </p>

      <div className="mt-8">
        <button
          type="button"
          onClick={onSignIn}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#007BC0] to-[#013880] hover:from-[#007BC0]/90 hover:to-[#013880]/90 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-[#007BC0]/20 cursor-pointer"
        >
          Return to Login
        </button>
      </div>
    </motion.div>
  );
};
