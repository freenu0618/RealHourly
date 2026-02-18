import { FullCalculator } from "@/components/landing/FullCalculator";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function CalculatorPage() {
  return (
    <>
      <LandingNav />
      <div className="pt-20">
        <FullCalculator />
      </div>
      <LandingFooter />
    </>
  );
}
