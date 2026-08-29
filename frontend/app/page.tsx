import { MarketingNavbar } from "@/components/landing/marketing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { PipelineFlow } from "@/components/landing/pipeline-flow";
import { CtaSection } from "@/components/landing/cta-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <MarketingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureGrid />
        <PipelineFlow />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
