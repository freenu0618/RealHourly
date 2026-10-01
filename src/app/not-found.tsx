import Link from "next/link";
import { getLocale } from "next-intl/server";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Global 404 with localized recovery links; no account is required. */
export default async function NotFound() {
  const locale = (await getLocale()) === "en" ? "en" : "ko";
  const copy = locale === "ko"
    ? {
        title: "페이지를 찾을 수 없습니다",
        description: "요청하신 페이지가 존재하지 않거나 이동되었습니다. 주소를 확인하거나 아래 링크로 이동해 주세요.",
        home: "홈으로 이동",
        calculator: "실질 시급 계산기",
        features: "기능 살펴보기",
      }
    : {
        title: "Page Not Found",
        description: "The page you are looking for does not exist or has been moved. Check the address or use one of the links below.",
        home: "Go Home",
        calculator: "Hourly Rate Calculator",
        features: "Explore Features",
      };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <FileQuestion aria-hidden="true" className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
        <h1 className="mb-4">
          <span className="block text-6xl font-bold mb-4">404</span>
          <span className="text-2xl font-semibold">{copy.title}</span>
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {copy.description}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={`/${locale}`}>{copy.home}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/${locale}/calculator`}>{copy.calculator}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/${locale}/features`}>{copy.features}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
