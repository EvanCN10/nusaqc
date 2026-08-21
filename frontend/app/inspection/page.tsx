"use client";

import { useState } from "react";
import { FishInspection } from "@/components/sections/inspection-page/FishInspection";
import { ResultSection } from "@/components/sections/inspection-page/ResultSection";
import { InspectionResult } from "@/types";

export default function InspectionPage() {
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);

  return (
    <div className="grid gap-4 p-6 grid-cols-12 w-full">
      <div className="col-span-7">
        <FishInspection onInspectionComplete={setInspectionResult} />
      </div>
      <div className="col-span-5">
        <ResultSection result={inspectionResult} />
      </div>
    </div>
  );
}
