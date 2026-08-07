import { SearchHistory } from "@/components/sections/lot-history-page/SearchHistory"
import { TableSection } from "@/components/sections/lot-history-page/TableSection"

export default function HistoryPage () {
  return (
    <div className="flex flex-col gap-4">
      <SearchHistory/>
      <TableSection/>
    </div>
  )
}