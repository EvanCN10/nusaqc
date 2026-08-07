import { FishInspection } from "@/components/sections/inspection-page/FishInspection";
import { ResultSection } from "@/components/sections/inspection-page/ResultSection";

export default function InspectionPage() {
  return (
    <div className="flex flex-row flex-1 gap-4
    ">
      <FishInspection/>
      <ResultSection/>
    </div>
  )
}