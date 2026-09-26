"use client";

import React from "react";
import { Sparkles, Shield, UserCheck, KeyRound, Activity } from "lucide-react";
import { USERS_DB, Role } from "@/lib/auth";

interface AuthJuryPresetsProps {
  onSelectPreset: (username: string, password: string) => void;
  disabled?: boolean;
}

export const AuthJuryPresets: React.FC<AuthJuryPresetsProps> = ({ onSelectPreset, disabled }) => {
  const presets: { role: Role; label: string; name: string; scope: string; badgeColor: string; borderColor: string; hoverBg: string }[] = [
    {
      role: "operator",
      label: "QC Operator",
      name: USERS_DB.operator.user.name,
      scope: "Inspection & Logging",
      badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/30",
      borderColor: "border-amber-500/30 hover:border-amber-400",
      hoverBg: "hover:bg-amber-500/10",
    },
    {
      role: "supervisor",
      label: "QC Supervisor",
      name: USERS_DB.supervisor.user.name,
      scope: "Approval & Cold Chain",
      badgeColor: "text-sky-400 bg-sky-400/10 border-sky-400/30",
      borderColor: "border-sky-500/30 hover:border-sky-400",
      hoverBg: "hover:bg-sky-500/10",
    },
    {
      role: "admin",
      label: "System Admin",
      name: USERS_DB.admin.user.name,
      scope: "Full Control & Config",
      badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
      borderColor: "border-emerald-500/30 hover:border-emerald-400",
      hoverBg: "hover:bg-emerald-500/10",
    },
  ];

  return (
    <div className="mt-6 pt-5 border-t border-slate-800/80">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FFBD07] animate-pulse" />
          Jury Quick-Test Presets
        </span>
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
          <KeyRound className="size-3 text-slate-500" />
          Pass: nusaqc2026
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {presets.map((p) => {
          const cred = USERS_DB[p.role];
          return (
            <button
              key={p.role}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPreset(cred.user.username, cred.password)}
              className={`p-2.5 rounded-xl bg-slate-950/70 border ${p.borderColor} ${p.hoverBg} transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm`}
            >
              <div>
                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${p.badgeColor} mb-1.5`}>
                  {p.label}
                </span>
                <p className="text-xs font-semibold text-slate-100 group-hover:text-white truncate transition-colors">
                  {p.name}
                </p>
              </div>
              <span className="text-[9px] text-slate-400 mt-2 truncate flex items-center gap-1">
                <Activity className="size-2.5 text-slate-500 shrink-0" />
                {p.scope}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
