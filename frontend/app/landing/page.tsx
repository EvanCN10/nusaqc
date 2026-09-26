import { Metadata } from "next";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingAbout } from "@/components/landing/LandingAbout";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingArchitecture } from "@/components/landing/LandingArchitecture";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "NusaQC - Autonomous Fish Quality Control & Cold Storage Management",
  description:
    "Edge computer vision quality grading, local deterministic decision engine, and smart 2-zone cold storage allocation for industrial seafood processing.",
};

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#030712] text-white selection:bg-[#007BC0]/30 selection:text-white">
        <LandingNavbar />
        <main>
          <LandingHero />
          <LandingAbout />
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingArchitecture />
          <LandingCTA />
        </main>
        <LandingFooter />
      </div>
    </SmoothScrollProvider>
  );
}
