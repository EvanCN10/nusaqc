"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/auth";
import { AuthSignIn } from "./AuthSignIn";
import { AuthSignUp } from "./AuthSignUp";
import { AuthForgotPassword } from "./AuthForgotPassword";
import { AuthResetSuccess } from "./AuthResetSuccess";

export enum AuthView {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
  RESET_SUCCESS = "reset-success",
}

export const AuthPortalCard: React.FC = () => {
  const router = useRouter();
  const { login, register } = useAuth();
  const [view, setView] = useState<AuthView>(AuthView.SIGN_IN);
  const [recoveryEmail, setRecoveryEmail] = useState<string>("");

  const handleSignIn = async (username: string, pass: string) => {
    const res = await login(username, pass);
    if (res.success) {
      router.push("/");
    }
    return res;
  };

  const handleSignUp = async (data: { name: string; usernameOrEmail: string; password: string; role: Role }) => {
    const res = await register(data);
    if (res.success) {
      router.push("/");
    }
    return res;
  };

  const handleCancel = () => {
    router.push("/landing");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[420px] mx-auto"
    >
      {/* Sleek Dark Glass Card matching Landing Page */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#007BC0]/15 blur-2xl pointer-events-none rounded-full" />

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {view === AuthView.SIGN_IN && (
              <AuthSignIn
                key="sign-in"
                onForgotPassword={() => setView(AuthView.FORGOT_PASSWORD)}
                onSignUp={() => setView(AuthView.SIGN_UP)}
                onCancel={handleCancel}
                onSubmitSignIn={handleSignIn}
              />
            )}

            {view === AuthView.SIGN_UP && (
              <AuthSignUp
                key="sign-up"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSubmitSignUp={handleSignUp}
              />
            )}

            {view === AuthView.FORGOT_PASSWORD && (
              <AuthForgotPassword
                key="forgot-password"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSuccess={(email) => {
                  setRecoveryEmail(email);
                  setView(AuthView.RESET_SUCCESS);
                }}
              />
            )}

            {view === AuthView.RESET_SUCCESS && (
              <AuthResetSuccess
                key="reset-success"
                email={recoveryEmail}
                onSignIn={() => setView(AuthView.SIGN_IN)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
