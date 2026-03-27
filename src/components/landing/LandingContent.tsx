import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { InteractiveCalcSection } from "./InteractiveCalcSection";
import { FeatureSection } from "./FeatureSection";
import { ComparisonSection } from "./ComparisonSection";
import { PricingSection } from "./PricingSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { LandingFooter } from "./LandingFooter";

// Removed from landing (kept for /features page reuse):
// SocialProofSection, CountUpSection, EmpathySection, StepsSection, ProductDemoSection, UseCaseSection

export function LandingContent() {
  return (
    <>
      <LandingNav />
      <HeroSection />
      <InteractiveCalcSection />
      <FeatureSection />
      <ComparisonSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </>
  );
}
