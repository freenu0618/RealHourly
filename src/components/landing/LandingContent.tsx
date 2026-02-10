"use client";

import { useEffect } from "react";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { FeatureSection } from "./FeatureSection";
import { CountUpSection } from "./CountUpSection";
import { StepsSection } from "./StepsSection";
import { EmpathySection } from "./EmpathySection";
import { ComparisonSection } from "./ComparisonSection";
import { UseCaseSection } from "./UseCaseSection";
import { PricingSection } from "./PricingSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { LandingFooter } from "./LandingFooter";

function useAnimateOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const animation = el.dataset.animation || "animate-fadeUp";
            el.classList.add(animation);
            el.classList.remove("opacity-0");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      el.classList.add("opacity-0");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

export function LandingContent() {
  useAnimateOnScroll();

  return (
    <>
      <LandingNav />
      <HeroSection />
      <FeatureSection />
      <CountUpSection />
      <StepsSection />
      <EmpathySection />
      <ComparisonSection />
      <UseCaseSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </>
  );
}
