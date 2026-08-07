import { HeadSection } from "@/components/sections/dashboard-page/HeadSection";
import { BodySection } from "@/components/sections/dashboard-page/BodySection";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <HeadSection />
      <BodySection />
    </div>
  );
}