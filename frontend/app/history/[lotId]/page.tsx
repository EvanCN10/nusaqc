import { TitleDetail } from "@/components/sections/lot-history-page/lot-history-page-detail/TitleDetail";
import { ResultDetail } from "@/components/sections/lot-history-page/lot-history-page-detail/ResultDetail";

export default async function HistoryDetailPage({ params }: { params: Promise<{ lotId: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <TitleDetail lotId={resolvedParams.lotId} />
      <ResultDetail lotId={resolvedParams.lotId} />
    </div>
  );
}
