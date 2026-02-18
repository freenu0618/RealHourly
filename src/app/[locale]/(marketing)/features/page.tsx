import { PublicGuideContent } from "@/components/landing/PublicGuideContent";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function FeaturesPage() {
  return (
    <>
      <LandingNav />
      <div className="pt-20">
        <PublicGuideContent />
      </div>
      <LandingFooter />
    </>
  );
}
