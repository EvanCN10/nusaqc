import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type TitleDetailProps = {
  lotId: string;
};

export const TitleDetail = ({ lotId }: TitleDetailProps) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* TODO: Link target should dynamically preserve filters or fallback to /history */}
      <Link
        href="/history"
        className="inline-flex self-start items-center gap-2 text-sm font-medium font-sans text-sky-500 hover:underline"
      >
        <ArrowLeft className="size-4 text-sky-500" />
        <span>Back to Lot History</span>
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-sans text-zinc-900">
          Inspection Detail
        </h1>
        <p className="text-sm font-medium font-mono text-gray-700">
          {lotId}
        </p>
      </div>
    </div>
  );
};

