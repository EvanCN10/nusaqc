import { FishInspection } from "@/components/sections/inspection-page/FishInspection";
import { ResultSection } from "@/components/sections/inspection-page/ResultSection";

export default function InspectionPage() {
  return (
    <div className="grid gap-4 p-6 grid-cols-12 w-full">
      <div className="col-span-7">
        <FishInspection />
      </div>
      <div className="col-span-5">
        <ResultSection />
      </div>
    </div>
  );
}
