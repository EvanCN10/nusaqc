import { StatCard } from "@/components/common/StatCard";
import {
  CheckCircle2,
  AlertTriangle,
  Cpu,
  BriefcaseConveyorBelt,
} from "lucide-react";

export function HeadSection() {
  return (
    <div className="flex gap-4">
      <StatCard
        title="Total Inspected Today"
        value="1,247"
        unit="fish"
        subtext="Lot LOT-2026-0730"
        icon={<BriefcaseConveyorBelt className="size-5" />}
      />
      <StatCard
        title="Pass Rate"
        value="94.2%"
        delta="+1.2%"
        deltaPositive={true}
        valueColor="text-green-600"
        icon={<CheckCircle2 className="size-5 text-green-500" />}
      />
      <StatCard
        title="Fail Rate"
        value="5.8%"
        delta="-0.4%"
        deltaPositive={false}
        valueColor="text-red-500"
        icon={<AlertTriangle className="size-5 text-red-400" />}
      />
      <StatCard
        title="Avg Confidence Score"
        value="89.3%"
        valueColor="text-sky-600"
        icon={<Cpu className="size-5 text-sky-400" />}
      />
    </div>
  );
}
