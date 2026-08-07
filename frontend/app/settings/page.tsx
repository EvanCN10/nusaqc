import { Hardware } from "@/components/sections/settings-page/Hardware"
import { AIModel } from "@/components/sections/settings-page/AIModel"
import { ExportSettings } from "@/components/sections/settings-page/ExportSettings"
import { BottomSection } from "@/components/sections/settings-page/BottomSection"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <Hardware/>
      <AIModel/>
      <ExportSettings/>
      <BottomSection/>
    </div>
  )
}