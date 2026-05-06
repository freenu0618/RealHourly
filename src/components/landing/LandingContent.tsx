import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { InteractiveCalcSection } from "./InteractiveCalcSection";
import { FeatureSection } from "./FeatureSection";
import { StepsSection } from "./StepsSection";
import { ComparisonSection } from "./ComparisonSection";
import { PricingSection } from "./PricingSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { LandingFooter } from "./LandingFooter";

// Removed from landing (kept for future reuse):
// SocialProofSection, CountUpSection, EmpathySection, ProductDemoSection, UseCaseSection

export function LandingContent() {
  return (
    <>
      <LandingNav />
      <HeroSection />
      <InteractiveCalcSection />
      <StepsSection />
      <FeatureSection />
      <ComparisonSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </>
  );
}
