import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { InteractiveCalcSection } from "./InteractiveCalcSection";
import { SocialProofSection } from "./SocialProofSection";
import { FeatureSection } from "./FeatureSection";
import { CountUpSection } from "./CountUpSection";
import { EmpathySection } from "./EmpathySection";
import { ComparisonSection } from "./ComparisonSection";
import { StepsSection } from "./StepsSection";
import { ProductDemoSection } from "./ProductDemoSection";
import { UseCaseSection } from "./UseCaseSection";
import { PricingSection } from "./PricingSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { LandingFooter } from "./LandingFooter";

export function LandingContent() {
  return (
    <>
      <LandingNav />
      <HeroSection />
      <InteractiveCalcSection />
      <SocialProofSection />
      <FeatureSection />
      <CountUpSection />
      <EmpathySection />
      <ComparisonSection />
      <StepsSection />
      <ProductDemoSection />
      <UseCaseSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </>
  );
}
