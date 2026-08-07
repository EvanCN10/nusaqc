import { ImageDetail } from "@/components/sections/lot-history-page/lot-history-page-detail/ImageDetail"
import { ResultDetail } from "@/components/sections/lot-history-page/lot-history-page-detail/ResultDetail"

export default function HistoryDetailPage() {
  return (
    <div className="flex flex-row gap-6">
      <ImageDetail/>
      <ResultDetail/>
    </div>
  )
}