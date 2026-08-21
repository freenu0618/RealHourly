import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAlternates, getOpenGraph, getTwitter } from "@/lib/seo/metadata";
import { FullCalculator } from "@/components/landing/FullCalculator";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isKo = locale === "ko";

  const title = isKo
    ? "프리랜서 실제 시급 계산기 - 수수료·세금·비청구 시간·최소 수주 단가 | RealHourly"
    : "Freelancer Hourly Rate Calculator - Fees, Taxes, Unbilled Time & Minimum Rate | RealHourly";
  const description = isKo
    ? "플랫폼 수수료, 세금, 비청구 시간을 모두 반영한 진짜 시급을 계산하세요. 무료 온라인 계산기로 프리랜서 수익성, 최소 수주 단가, 프로젝트 가격 기준선을 더 정확히 잡을 수 있습니다."
    : "Calculate your real hourly rate after platform fees, taxes, and unbilled time. Free online calculator to measure freelancer profitability, set a smarter minimum rate, and price projects with more confidence.";

  return {
    title,
    description,
    keywords: isKo
      ? [
          "프리랜서 시급 계산기",
          "실제 시급 계산",
          "최소 수주 단가 계산",
          "프로젝트 가격 계산",
          "플랫폼 수수료 계산",
          "프리랜서 세금 계산",
          "숨겨진 비용 계산",
          "Upwork 수수료",
          "크몽 수익",
        ]
      : [
          "freelancer rate calculator",
          "real hourly rate",
          "minimum freelance rate",
          "project pricing calculator",
          "platform fee calculator",
          "freelancer tax calculator",
          "hidden cost calculator",
          "Upwork fees",
          "freelance earnings",
        ],
    robots: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    alternates: getAlternates(locale, "/calculator"),
    openGraph: getOpenGraph(locale, "/calculator", title, description),
    twitter: getTwitter(title, description),
  };
}

function buildJsonLd(locale: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com";
  const isKo = locale === "ko";
  const dateModified = "2026-08-22";

  const calculatorName = isKo
    ? "프리랜서 실제 시급 계산기"
    : "Freelancer Real Rate Calculator";
  const calculatorDescription = isKo
    ? "플랫폼 수수료, 세금, 비청구 시간을 반영한 실제 시급 계산기"
    : "Calculate your real hourly rate after platform fees, taxes, and unbilled time";
  const inputChecklist = isKo
    ? [
        ["계약 총액", "클라이언트와 합의한 고정가 프로젝트 금액 또는 예상 총매출"],
        ["플랫폼 수수료", "Upwork, Fiverr, 크몽 등 마켓플레이스 또는 결제 수수료"],
        ["예상 세금률", "거주지와 계약 조건에 맞춰 보수적으로 입력하는 세금 추정치"],
        ["도구·외주 비용", "구독 도구, 폰트·소스 구매, 외주·하청 비용처럼 프로젝트별로 빠지는 비용"],
        ["제작 시간", "디자인, 개발, 번역, 집필 등 직접 산출물을 만드는 청구 가능 작업 시간"],
        ["비청구 시간", "견적, 미팅, 메시지, 리서치, QA, 수정, 자료 대기, 관리처럼 실제로 쓰지만 청구에서 빠지기 쉬운 시간"],
        ["결제 조건", "계약금, 마일스톤 승인, 최종 결제일, 지연 시 후속 커뮤니케이션처럼 현금흐름과 시간을 바꾸는 조건"],
        ["클라이언트 자료와 승인", "원고, 이미지, 접근 권한, 피드백 담당자, 승인 기한처럼 일정 지연과 재작업을 만드는 조건"],
        ["검수·인수인계·사후지원", "최종 QA, 소스 파일 정리, 문서화, 납품 후 짧은 수정이나 지원처럼 완료 직전과 이후에 붙는 시간"],
        ["할인·무료 추가 요청", "할인율, 무료 수정 예상 시간, 납기 영향, 유료 전환 기준처럼 총수익과 투입 시간을 동시에 바꾸는 조건"],
        ["긴급 납기·주말 작업", "야간·주말 대응, 일정 압축, 빠른 피드백 대기처럼 일반 견적보다 높은 시간 밀도를 만드는 조건"],
        ["성과보수·레버뉴쉐어", "확정 선금, 조건부 보너스, 매출 공유, 지급 조건, 추적 가능성처럼 보장 수익과 리스크를 나눠야 하는 계약 요소"],
        ["목표 실제 시급", "다음 견적을 판단할 때 지켜야 하는 최소 순수익 기준"],
      ]
    : [
        ["Gross project fee", "The fixed project amount or expected total revenue agreed with the client"],
        ["Platform fee", "Marketplace or payment fees from Upwork, Fiverr, local platforms, or processors"],
        ["Estimated tax rate", "A conservative tax estimate based on the freelancer's location and contract context"],
        ["Tool and subcontractor costs", "Project-specific subscriptions, assets, contractors, or specialist support"],
        ["Production hours", "Billable work time spent creating the actual deliverable"],
        ["Unbilled hours", "Quoting, meetings, messages, research, QA, revisions, asset waiting, and admin time that still reduce margin"],
        ["Payment terms", "Deposit, milestone approval, final payment date, and follow-up work that can change cash flow and time risk"],
        ["Client materials and approvals", "Copy, images, access credentials, reviewer ownership, and approval deadlines that can create delays or rework"],
        ["QA, handoff, and support", "Final review, source-file cleanup, documentation, and short post-delivery support that can add time near or after launch"],
        ["Discounts and free extras", "Discount rate, expected unpaid revision time, deadline impact, and paid-add-on boundaries that change both revenue and hours"],
        ["Rush deadlines and weekend work", "Night or weekend work, compressed schedules, and fast-feedback standby that can make the same scope more time-intensive"],
        ["Performance bonuses and revenue share", "Guaranteed deposit, conditional upside, revenue share, payment rules, and tracking confidence that separate protected income from risk"],
        ["Target real hourly rate", "The minimum net effective rate the next quote should protect"],
      ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: calculatorName,
      description: calculatorDescription,
      url: `${siteUrl}/${locale}/calculator`,
      inLanguage: isKo ? "ko-KR" : "en-US",
      dateModified,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      keywords: isKo
        ? "프리랜서 실제 시급 계산기, 프로젝트 단가 계산, 플랫폼 수수료, 세금, 비청구 시간, 최소 수주 단가"
        : "freelancer hourly rate calculator, project pricing, platform fees, taxes, unbilled time, minimum freelance rate",
      about: isKo
        ? [
            "프리랜서 실제 시급",
            "고정가 프로젝트 수익성",
            "비청구 시간",
            "플랫폼 수수료",
            "최소 수주 단가",
          ]
        : [
            "freelancer real hourly rate",
            "fixed-fee project profitability",
            "unbilled time",
            "platform fees",
            "minimum project quote",
          ],
      featureList: isKo
        ? [
            "프로젝트 총액 기반 실제 시급 계산",
            "플랫폼 수수료와 세금 반영",
            "미팅·이메일·수정 등 비청구 시간 포함",
            "목표 시급 기준 최소 수주 단가 추정",
          ]
        : [
            "Real hourly rate from total project fee",
            "Platform fee and tax adjustments",
            "Unbilled meetings, messages, revisions, and admin time",
            "Minimum project fee estimate from target hourly rate",
          ],
      audience: {
        "@type": "Audience",
        audienceType: isKo
          ? "프리랜서, 독립 컨설턴트, 1인 사업자, 소규모 에이전시"
          : "Freelancers, independent consultants, solo operators, and small agencies",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      isPartOf: {
        "@type": "WebSite",
        name: "RealHourly",
        url: siteUrl,
      },
      significantLink: [
        `${siteUrl}/${locale}/features`,
        `${siteUrl}/${locale}/contact`,
        `${siteUrl}/${locale}/privacy`,
        `${siteUrl}/${locale}/terms`,
      ],
      mainEntityOfPage: `${siteUrl}/${locale}/calculator`,
      potentialAction: {
        "@type": "UseAction",
        name: isKo
          ? "비청구 시간을 포함한 실제 시급 계산"
          : "Calculate real hourly rate including unbilled time",
        target: `${siteUrl}/${locale}/calculator`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: isKo
        ? "프리랜서 실제 시급 계산 방법"
        : "How to calculate your real freelance hourly rate",
      description: calculatorDescription,
      totalTime: "PT3M",
      dateModified,
      tool: [
        {
          "@type": "HowToTool",
          name: calculatorName,
        },
      ],
      step: (isKo
        ? [
            {
              name: "총 계약 금액 입력",
              text: "클라이언트와 합의한 프로젝트 금액이나 예상 매출을 입력합니다.",
            },
            {
              name: "플랫폼 수수료와 세금 반영",
              text: "Upwork, Fiverr, 크몽 등 플랫폼 수수료와 예상 세금률을 더해 순수입을 계산합니다.",
            },
            {
              name: "실제 투입 시간 계산",
              text: "제작 시간뿐 아니라 미팅, 이메일, 수정, 리서치 같은 비청구 시간을 포함합니다.",
            },
            {
              name: "실제 시급과 최소 수주 단가 확인",
              text: "순수입을 실제 투입 시간으로 나눠 실제 시급을 확인하고, 다음 견적의 기준선을 잡습니다.",
            },
          ]
        : [
            {
              name: "Enter the project fee",
              text: "Add the agreed project fee or expected gross revenue from the client.",
            },
            {
              name: "Include platform fees and taxes",
              text: "Account for fees from platforms such as Upwork, Fiverr, or local marketplaces plus your expected tax rate.",
            },
            {
              name: "Count all real working time",
              text: "Include unbilled meetings, emails, revisions, research, and admin time, not only production hours.",
            },
            {
              name: "Review real hourly rate and minimum rate",
              text: "Divide net revenue by real hours worked to find your real hourly rate and set a safer baseline for the next quote.",
            },
          ]
      ).map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        ...step,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isKo
        ? "프리랜서 실제 시급 계산 입력 체크리스트"
        : "Freelancer real-rate calculator input checklist",
      description: isKo
        ? "고정가 프로젝트나 플랫폼 계약을 수락하기 전에 실제 시급 계산에 넣어야 하는 핵심 입력값입니다."
        : "Core inputs to check before accepting a fixed-fee or platform freelance project.",
      dateModified,
      numberOfItems: inputChecklist.length,
      itemListElement: inputChecklist.map(([name, description], index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
        description,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      dateModified,
      mainEntity: (isKo
        ? [
            {
              question: "계약 시급과 실제 시급은 왜 다른가요?",
              answer:
                "계약 시급은 청구 가능한 작업 시간만 기준으로 보기 쉽지만, 실제 시급은 플랫폼 수수료, 세금, 도구 비용, 미팅, 메시지, 수정, 리서치 같은 비청구 시간을 함께 반영합니다.",
            },
            {
              question: "고정가 프로젝트에도 이 계산기를 쓸 수 있나요?",
              answer:
                "네. 고정가 프로젝트의 총 계약 금액을 입력하고 실제 투입될 모든 시간을 더하면 시간당 순수익과 다음 견적의 최소 수주 단가를 추정할 수 있습니다.",
            },
            {
              question: "견적 전에 입력값이 부족하면 무엇부터 확인해야 하나요?",
              answer:
                "계약 총액, 플랫폼 또는 결제 수수료, 예상 세금, 도구·외주 비용, 제작 시간, 미팅·메시지·수정 같은 비청구 시간, 목표 실제 시급을 먼저 확인해야 합니다.",
            },
            {
              question: "두 프로젝트 제안을 비교할 때는 어떻게 봐야 하나요?",
              answer:
                "총액만 비교하지 말고 각 제안에 같은 전제(수수료, 세금, 도구·외주 비용, 제작 시간, 비청구 시간, 수정 버퍼, 목표 실제 시급)를 적용해 순수익과 실제 시급을 나란히 확인해야 합니다.",
            },
            {
              question: "견적 전 영업·관리 시간도 포함해야 하나요?",
              answer:
                "네. 발견 미팅, 제안서 작성, 일정 조율, 파일 정리, 사후 팔로업처럼 청구서에 바로 잡히지 않는 영업·관리 시간이 반복된다면 목표 실제 시급과 최소 수주 단가를 정할 때 별도 버퍼로 포함하는 것이 안전합니다.",
            },
            {
              question: "리테이너나 유지보수 견적은 어떻게 계산해야 하나요?",
              answer:
                "월 고정 보수만 보지 말고 정기 작업, 응답 대기, 긴급 수정, 회의, 보고, 파일 인수인계 시간을 따로 잡아 실제 시급을 확인하세요. 포함 범위가 모호하면 수정 횟수, 응답 시간, 유지보수 기간, 유료 전환 기준을 견적 조건으로 분리하는 것이 좋습니다.",
            },
            {
              question: "계약금이나 마일스톤 결제 조건도 실제 시급 판단에 넣어야 하나요?",
              answer:
                "네. 결제가 대부분 마지막 승인 뒤로 밀리거나 승인 기준이 모호하면 팔로업, 일정 대기, 재작업 시간이 늘어 실제 수익성이 낮아질 수 있습니다. 견적 전에는 계약금, 마일스톤 승인 기준, 최종 결제일, 지연 시 대응 조건을 분리해 확인하세요.",
            },
            {
              question: "외주 파트너나 협업 비용이 있으면 어떻게 계산하나요?",
              answer:
                "외주 파트너 비용은 프로젝트별 비용으로 따로 차감하고, 본인이 쓰는 PM, 검수, 커뮤니케이션, 인수인계 시간은 실제 투입 시간에 포함하세요. 비용이 확정되지 않았다면 낮음, 기준, 보수적 시나리오로 나눠 목표 실제 시급이 유지되는지 확인하는 것이 안전합니다.",
            },
            {
              question: "클라이언트가 자료를 늦게 주면 실제 시급에도 영향을 주나요?",
              answer:
                "네. 원고, 이미지, 계정 접근 권한, 피드백 담당자가 늦어지면 대기, 일정 재조정, 재작업, 팔로업 시간이 생겨 실제 시급이 낮아질 수 있습니다. 견적 전에는 자료 제공 기한, 승인 담당자, 지연 시 일정 변경 기준을 분리해 두는 것이 좋습니다.",
            },
            {
              question: "검수나 파일 인수인계, 납품 후 지원 시간도 포함해야 하나요?",
              answer:
                "반복적으로 필요한 QA, 소스 파일 정리, 사용 설명, 짧은 사후 수정, 배포 확인은 실제 시급을 낮추는 시간입니다. 견적 전에는 포함 지원 기간과 유료 전환 기준을 따로 정하고, 완료 직전에는 기록을 남겨 다음 견적의 기준선에 반영하세요.",
            },
            {
              question: "할인이나 무료 추가 수정을 요청받으면 어떻게 판단하나요?",
              answer:
                "할인은 총수익을 낮추고 무료 추가 수정은 실제 투입 시간을 늘리므로 둘 다 실제 시급을 바로 낮출 수 있습니다. 수락 전 할인 후 총액, 추가 작업 예상 시간, 납기 영향, 목표 실제 시급을 다시 계산하고, 목표보다 낮아지면 범위 축소나 유료 추가 수정 기준을 먼저 제안하세요.",
            },
            {
              question: "긴급 납기나 주말 작업은 별도 비용으로 봐야 하나요?",
              answer:
                "네. 같은 산출물이라도 야간·주말 작업, 빠른 응답 대기, 일정 압축이 있으면 회복 시간과 다른 프로젝트 기회비용까지 실제 수익성을 낮출 수 있습니다. 견적 전에는 러시 버퍼를 별도 시간이나 추가 비용으로 분리하고, 목표 실제 시급이 유지되는지 다시 확인하세요.",
            },
            {
              question: "성과보수나 레버뉴쉐어 제안은 실제 시급을 어떻게 봐야 하나요?",
              answer:
                "확정 선금과 조건부 보상을 분리해 보세요. 매출 공유, 커미션, 보너스, 지분처럼 나중에 받을 수 있는 금액은 보수적 시나리오로 두고, 지급 조건, 정산 주기, 추적 가능성, 미팅·수정 시간을 함께 넣어 최소 보장 실제 시급이 목표 아래로 내려가지 않는지 먼저 확인하는 것이 안전합니다.",
            },
            {
              question: "계산된 실제 시급이 목표보다 낮으면 무엇을 조정해야 하나요?",
              answer:
                "먼저 수정 범위, 미팅·메시지 시간, 도구·외주 비용, 플랫폼 수수료가 빠졌는지 확인하세요. 그래도 목표 실제 시급보다 낮다면 고정가를 올리거나 범위를 줄이고, 진행 중에는 시간 기록과 스코프 크립 근거를 남기는 것이 좋습니다.",
            },
            {
              question: "계산 결과는 세무 신고나 법률 자문으로 사용할 수 있나요?",
              answer:
                "아니요. RealHourly의 계산은 견적과 수익성 의사결정을 돕는 참고용 추정치입니다. 세무·법률 판단은 각 계약과 거주지 기준에 맞게 전문가 검토가 필요합니다.",
            },
            {
              question: "계산 결과를 클라이언트 제안서에 그대로 넣어도 되나요?",
              answer:
                "그대로 넣기보다 내부 기준선으로 사용하세요. 제안서에는 산출물, 포함 수정 횟수, 응답 시간, 결제 조건, 유지보수 포함 여부를 명확히 쓰고, 세금률이나 내부 목표 시급 같은 민감한 가정은 공개하지 않는 것이 안전합니다.",
            },
          ]
        : [
            {
              question: "Why is my contract rate different from my real hourly rate?",
              answer:
                "A contract rate usually ignores hidden work and deductions. Real hourly rate includes platform fees, taxes, tool costs, meetings, messages, revisions, research, and other unbilled time.",
            },
            {
              question: "Can I use this calculator for fixed-fee projects?",
              answer:
                "Yes. Enter the total fixed project fee and all realistic work time to estimate net hourly earnings and a safer minimum quote for the next project.",
            },
            {
              question: "What should I check first if I do not have every input?",
              answer:
                "Start with gross project fee, platform or payment fee, estimated tax, tool or subcontractor costs, production hours, unbilled meetings, messages and revisions, and your target real hourly rate.",
            },
            {
              question: "How should I compare two project offers?",
              answer:
                "Do not compare contract totals alone. Apply the same assumptions to each offer: fees, taxes, tool or subcontractor costs, production hours, unbilled time, revision buffer, and target real hourly rate.",
            },
            {
              question: "Should I include sales and admin time before quoting?",
              answer:
                "Yes. If discovery calls, proposal writing, scheduling, file cleanup, or follow-up work repeats across projects, include it as an overhead buffer when choosing a target real hourly rate and minimum sustainable quote.",
            },
            {
              question: "How should I price retainers or maintenance work?",
              answer:
                "Do not judge the monthly fee alone. Estimate recurring work, response standby, urgent fixes, meetings, reporting, and file handoff time, then check the real hourly rate. If the scope is unclear, separate included revisions, response time, support period, and paid add-on rules in the quote.",
            },
            {
              question: "Should deposit or milestone payment terms affect my real-rate decision?",
              answer:
                "Yes. If most payment is delayed until final approval or the approval criteria are vague, follow-up time, waiting, and rework can reduce real profitability. Before quoting, separate deposit, milestone acceptance criteria, final payment date, and late-payment boundaries.",
            },
            {
              question: "How should I count subcontractor or collaborator costs?",
              answer:
                "Keep partner costs as project-specific costs, then count your own project management, review, communication, and handoff time as real working time. If the cost is not final, compare low, expected, and conservative scenarios against your target real hourly rate.",
            },
            {
              question: "Do late client materials affect my real hourly rate?",
              answer:
                "Yes. Delayed copy, images, account access, or reviewer feedback can add waiting, rescheduling, rework, and follow-up time. Before quoting, separate material due dates, approval ownership, and schedule-change boundaries so the delay risk is visible.",
            },
            {
              question: "Should QA, handoff, or post-delivery support time be included?",
              answer:
                "Yes. Recurring final review, source-file cleanup, documentation, short support, and launch checks are real work that can lower the effective hourly rate. Before quoting, define the included support window and paid-add-on boundary, then carry the evidence into the next quote.",
            },
            {
              question: "How should I evaluate a discount or free extra revision request?",
              answer:
                "A discount lowers revenue and free revisions add real work time, so both can reduce the effective hourly rate quickly. Before accepting, recalculate with the discounted fee, extra hours, deadline impact, and target real hourly rate, then narrow scope or define paid add-ons if the result falls below target.",
            },
            {
              question: "Should rush deadlines or weekend work be priced separately?",
              answer:
                "Yes. Even with the same deliverable, night or weekend work, fast-response standby, and compressed schedules can reduce profitability through recovery time and opportunity cost. Before quoting, separate a rush buffer as extra time or a separate fee, then check whether the target real hourly rate still holds.",
            },
            {
              question: "How should I evaluate performance bonus or revenue-share offers?",
              answer:
                "Separate guaranteed cash from conditional upside. Treat revenue share, commission, bonus, or equity as a conservative scenario, then include payment rules, payout timing, tracking confidence, meetings, and revision time so the minimum guaranteed real hourly rate does not fall below your target.",
            },
            {
              question: "What should I adjust if the calculated real rate is below my target?",
              answer:
                "First check whether revision scope, meeting and message time, tool or subcontractor costs, and platform fees are missing. If the result is still below target, raise the fixed fee or narrow the scope, then track delivery evidence and scope-creep signals during the project.",
            },
            {
              question: "Is the result tax or legal advice?",
              answer:
                "No. RealHourly provides decision-support estimates for pricing and profitability. Tax and legal decisions should be reviewed for your contract and jurisdiction.",
            },
            {
              question: "Should I paste the calculator result into a client proposal?",
              answer:
                "Use it as an internal baseline instead. A client proposal should spell out deliverables, included revisions, response expectations, payment terms, and maintenance boundaries without exposing private assumptions such as tax estimates or target margin.",
            },
          ]).map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: isKo ? "시급 계산기" : "Calculator",
          item: `${siteUrl}/${locale}/calculator`,
        },
      ],
    },
  ];
}

function getCalculatorGuidance(locale: string) {
  const isKo = locale === "ko";

  return {
    eyebrow: isKo ? "계산 결과 해석 가이드" : "How to read the result",
    title: isKo
      ? "실제 시급은 ‘받은 돈 ÷ 제작 시간’보다 넓게 봐야 합니다"
      : "Real hourly rate is broader than “revenue ÷ production hours”",
    description: isKo
      ? "견적 전에는 아래 세 가지를 함께 확인하세요. AI 검색 답변과 사용자 화면 모두에서 같은 전제를 반복해 결과를 과신하지 않도록 돕습니다."
      : "Before quoting, check these three assumptions together. They keep AI-search summaries and the on-page calculator aligned so the result is not over-trusted.",
    cards: isKo
      ? [
          {
            title: "입력값",
            body: "계약 총액, 플랫폼 수수료, 예상 세금, 도구 비용, 미팅·메시지·수정 시간, 결제 조건을 모두 포함합니다.",
          },
          {
            title: "핵심 출력",
            body: "순수입, 비청구 시간 포함 실제 시급, 목표 수입을 달성하기 위한 최소 계약 단가를 함께 봅니다.",
          },
          {
            title: "안전한 활용 범위",
            body: "결과는 견적과 수익성 판단을 위한 추정치입니다. 세무·법률·계약 판단은 전문가 검토가 필요합니다.",
          },
          {
            title: "입력값이 부족할 때",
            body: "총액만 알고 있거나 두 제안을 비교한다면 수수료, 세금, 도구 비용, 제작 시간, 비청구 시간, 자료 대기, 영업·관리 버퍼, 목표 시급을 같은 기준으로 채워야 합니다.",
          },
          {
            title: "협업 비용",
            body: "외주·파트너 비용은 별도 비용으로 빼고, PM·검수·커뮤니케이션 시간은 실제 투입 시간에 넣어야 합니다.",
          },
          {
            title: "완료 직전 시간",
            body: "QA, 파일 인수인계, 사용 설명, 짧은 사후 지원은 견적에서 빠지기 쉬우므로 포함 범위와 유료 전환 기준을 따로 확인합니다.",
          },
          {
            title: "할인 요청",
            body: "할인율과 무료 추가 수정 시간을 함께 넣어 목표 실제 시급이 유지되는지 먼저 확인합니다.",
          },
          {
            title: "긴급 납기",
            body: "야간·주말 대응, 빠른 응답 대기, 일정 압축은 러시 버퍼나 별도 비용으로 분리해 계산합니다.",
          },
          {
            title: "성과보수 제안",
            body: "확정 선금과 조건부 보상을 나누고, 보수적 시나리오에서도 최소 실제 시급이 유지되는지 확인합니다.",
          },
        ]
      : [
          {
            title: "Inputs",
            body: "Include total project fee, platform fee, estimated tax, tool costs, payment terms, and unbilled meetings, messages, and revisions.",
          },
          {
            title: "Key outputs",
            body: "Review net income, real hourly rate with unbilled time, and the minimum contract rate needed for your target income.",
          },
          {
            title: "Safe use",
            body: "Use the result as a pricing and profitability estimate. Tax, legal, and contract decisions still need expert review.",
          },
          {
            title: "Missing inputs",
            body: "If you only know the fee or are comparing offers, add fees, tax, tool costs, production time, unbilled time, material-wait risk, sales/admin overhead, and target rate on the same basis.",
          },
          {
            title: "Collaborator costs",
            body: "Subtract subcontractor or partner costs separately, then count your project management, review, communication, and handoff time as real work.",
          },
          {
            title: "Closeout time",
            body: "QA, source-file handoff, documentation, launch checks, and short support should have a clear included scope and paid-add-on boundary.",
          },
          {
            title: "Discount requests",
            body: "Add the discount and unpaid extra revision time together before deciding whether the target real rate still holds.",
          },
          {
            title: "Rush deadlines",
            body: "Separate night or weekend delivery, fast-response standby, and compressed schedules into a rush buffer or separate fee.",
          },
          {
            title: "Performance upside",
            body: "Separate guaranteed cash from conditional bonus or revenue share, then test whether the conservative real rate still meets your floor.",
          },
        ],
    nextSteps: isKo
      ? [
          {
            label: "계산 후 수익성이 낮다면",
            title: "기록·알림 흐름 확인",
            body: "진행 중 실제 시간이 늘어날 때 스코프 크립 신호와 클라이언트 설명 근거를 어떻게 남기는지 확인하세요.",
            href: "/features",
          },
          {
            label: "두 제안을 비교한다면",
            title: "같은 전제로 다시 계산",
            body: "총액보다 수수료, 세금, 비용, 제작 시간, 비청구 시간, 수정 버퍼를 같은 기준으로 맞춘 뒤 실제 시급을 비교하세요.",
            href: "/calculator",
          },
          {
            label: "정책·도입 문의가 필요하다면",
            title: "공식 문의로 연결",
            body: "팀 도입, 결제, 맞춤 워크플로우처럼 추측하면 안 되는 질문은 문의 경로에서 확인하세요.",
            href: "/contact",
          },
          {
            label: "제안서로 옮길 때",
            title: "내부 계산과 공개 조건 분리",
            body: "실제 시급 결과는 내부 기준선으로 두고, 클라이언트에게는 산출물·수정 횟수·응답 시간·결제 조건을 명확히 전달하세요.",
            href: "/calculator",
          },
          {
            label: "결제가 늦어질 수 있다면",
            title: "마일스톤 조건까지 확인",
            body: "계약금, 승인 기준, 최종 결제일, 지연 시 팔로업 시간을 따로 두어 높은 총액이 낮은 실제 시급을 숨기지 않게 하세요.",
            href: "/calculator",
          },
          {
            label: "자료 제공이 불확실하다면",
            title: "대기·재작업 시간을 분리",
            body: "원고, 이미지, 접근 권한, 승인 담당자와 제공 기한을 따로 정리해 자료 지연이 실제 시급을 깎지 않게 하세요.",
            href: "/calculator",
          },
          {
            label: "유지보수 견적이라면",
            title: "응답·지원 시간을 따로 계산",
            body: "월 고정 보수에는 정기 작업뿐 아니라 긴급 수정, 보고, 파일 인수인계, 응답 대기 시간이 들어가는지 확인하세요.",
            href: "/features",
          },
          {
            label: "할인을 요청받았다면",
            title: "무료 범위부터 다시 계산",
            body: "할인 후 총액과 추가 수정 예상 시간을 함께 넣고, 목표보다 낮으면 포함 범위나 유료 전환 기준을 조정하세요.",
            href: "/calculator",
          },
          {
            label: "긴급 납기라면",
            title: "러시 버퍼 분리",
            body: "야간·주말 작업과 빠른 응답 대기 시간을 따로 넣어 같은 총액이 실제 시급을 낮추지 않는지 확인하세요.",
            href: "/calculator",
          },
          {
            label: "성과보수 제안이라면",
            title: "확정 수익과 조건부 수익 분리",
            body: "선금, 지급 조건, 정산 주기, 추적 가능성을 나눠 보수적 실제 시급이 목표 아래로 내려가지 않는지 확인하세요.",
            href: "/calculator",
          },
        ]
      : [
          {
            label: "If the quote looks weak",
            title: "Review the logging and alert workflow",
            body: "See how RealHourly keeps evidence when actual time, revisions, and scope risk grow during delivery.",
            href: "/features",
          },
          {
            label: "If comparing two offers",
            title: "Recalculate on equal assumptions",
            body: "Compare real hourly rate after matching fees, tax, costs, production time, unbilled time, and revision buffer for both offers.",
            href: "/calculator",
          },
          {
            label: "If policy or adoption is unclear",
            title: "Use the official contact path",
            body: "Route team adoption, billing, and custom workflow questions to contact instead of guessing.",
            href: "/contact",
          },
          {
            label: "Before sending a proposal",
            title: "Separate private math from client terms",
            body: "Keep the real-rate result as an internal baseline, then state deliverables, revision count, response time, and payment terms for the client.",
            href: "/calculator",
          },
          {
            label: "If payment may lag",
            title: "Check milestone terms",
            body: "Separate deposit, approval criteria, final payment date, and follow-up time so a large project total does not hide a weak real hourly rate.",
            href: "/calculator",
          },
          {
            label: "If inputs may arrive late",
            title: "Separate waiting and rework",
            body: "Make copy, assets, access, reviewer ownership, and material deadlines visible so delays do not quietly lower the real rate.",
            href: "/calculator",
          },
          {
            label: "For retainers",
            title: "Count support and response time separately",
            body: "Check whether the monthly fee covers urgent fixes, reporting, file handoff, response standby, and recurring support work.",
            href: "/features",
          },
          {
            label: "If asked for a discount",
            title: "Recalculate the free scope",
            body: "Combine the lower fee with expected extra revision time, then narrow included scope or set paid-add-on rules if the target rate drops.",
            href: "/calculator",
          },
          {
            label: "For rush deadlines",
            title: "Separate the rush buffer",
            body: "Add night or weekend work and fast-response standby separately so the same project fee does not hide a weaker real rate.",
            href: "/calculator",
          },
          {
            label: "If upside is conditional",
            title: "Separate guaranteed and variable pay",
            body: "Check deposits, payout rules, timing, and tracking confidence before counting revenue share or bonuses in the real rate.",
            href: "/calculator",
          },
        ],
  };
}

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jsonLd = buildJsonLd(locale);
  const guidance = getCalculatorGuidance(locale);

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <LandingNav />
      <main id="main-content" tabIndex={-1} className="pt-20">
        <FullCalculator />
        <section className="mx-auto max-w-5xl px-4 pb-16" aria-labelledby="calculator-guidance-title">
          <div className="rounded-[24px] border bg-card p-6 sm:p-8">
            <p className="mb-3 text-sm font-semibold text-primary">{guidance.eyebrow}</p>
            <h2 id="calculator-guidance-title" className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {guidance.title}
            </h2>
            <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {guidance.description}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {guidance.cards.map((card) => (
                <article key={card.title} className="rounded-2xl border bg-background p-5">
                  <h3 className="mb-2 font-semibold">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 grid gap-3 border-t pt-5 lg:grid-cols-4">
              {guidance.nextSteps.map((step) => (
                <Link
                  key={`${step.href}-${step.label}`}
                  href={step.href}
                  className="group rounded-2xl border border-primary/15 bg-primary/5 p-4 transition hover:border-primary/35 hover:bg-primary/10"
                  aria-label={`${step.label}: ${step.title}`}
                >
                  <p className="text-xs font-semibold text-primary">{step.label}</p>
                  <h3 className="mt-2 text-sm font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
