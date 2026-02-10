"use client";

import { useEffect } from "react";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { EmpathySection } from "./EmpathySection";
import { FeatureSection } from "./FeatureSection";
import { StepsSection } from "./StepsSection";
import { ComparisonSection } from "./ComparisonSection";
import { PricingSection } from "./PricingSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { LandingFooter } from "./LandingFooter";

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeUp");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 },
    );

    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export function LandingContent() {
  useScrollAnimation();

  return (
    <>
      <LandingNav />
      <HeroSection />
      <div className="opacity-0 translate-y-8" data-animate>
        <EmpathySection />
      </div>
      <div className="opacity-0 translate-y-8" data-animate>
        <FeatureSection />
      </div>
      <div className="opacity-0 translate-y-8" data-animate>
        <StepsSection />
      </div>
      <div className="opacity-0 translate-y-8" data-animate>
        <ComparisonSection />
      </div>
      <div className="opacity-0 translate-y-8" data-animate>
        <PricingSection />
      </div>
      <div className="opacity-0 translate-y-8" data-animate>
        <FaqSection />
      </div>
      <div className="opacity-0 translate-y-8" data-animate>
        <CtaSection />
      </div>
      <LandingFooter />
    </>
  );
}
