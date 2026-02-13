"use client";

import { useTranslations, useLocale } from "next-intl";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function TermsOfServicePage() {
  const t = useTranslations();
  const locale = useLocale();
  const isKorean = locale === "ko";

  return (
    <>
      <LandingNav />
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {isKorean ? <KoreanTerms /> : <EnglishTerms />}
      </main>
      <LandingFooter />
    </>
  );
}

function KoreanTerms() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-2">서비스 이용약관</h1>
      <p className="text-muted-foreground mb-8">
        최종 수정일: 2026년 2월 13일
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. 약관의 동의</h2>
        <p>
          RealHourly 서비스(이하 "서비스")에 접속하거나 사용함으로써 귀하는 본
          이용약관(이하 "약관")에 구속되는 것에 동의합니다. 본 약관에 동의하지
          않으시는 경우 서비스를 사용하지 마십시오.
        </p>
        <p>
          본 서비스는 만 14세 이상의 사용자를 대상으로 합니다. 만 14세 미만
          사용자의 서비스 이용은 금지됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. 서비스 설명</h2>
        <p>
          RealHourly는 프리랜서 및 독립 계약자를 위한 AI 기반 수익성 대시보드를
          제공합니다. 주요 기능은 다음과 같습니다:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>자연어 처리 기반 시간 기록 및 음성 입력</li>
          <li>숨겨진 비용을 반영한 실제 시급 계산</li>
          <li>프로젝트 범위 초과 감지 및 AI 청구 메시지 생성</li>
          <li>수익성 분석 및 대시보드</li>
          <li>주간 리포트 및 AI 인사이트</li>
          <li>PDF 인보이스 및 견적서 생성</li>
          <li>고객 업무 리포트 공유</li>
        </ul>
        <p>
          당사는 서비스의 기능, 가격, 가용성을 사전 통지 없이 수정하거나
          중단할 권리를 보유합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          3. 계정 및 등록
        </h2>
        <p>
          서비스를 사용하려면 Supabase를 통해 계정을 생성해야 합니다. 계정
          생성 시:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>정확하고 완전하며 최신의 정보를 제공해야 합니다</li>
          <li>계정 자격증명의 보안을 유지할 책임이 있습니다</li>
          <li>계정에서 발생하는 모든 활동에 대한 책임을 집니다</li>
          <li>
            무단 사용 또는 보안 침해가 의심되는 즉시 당사에 알려야 합니다
          </li>
        </ul>
        <p>
          당사는 단독 재량으로 계정 등록을 거부하거나 기존 계정을 해지할 수
          있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          4. 구독 및 결제
        </h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">4.1 요금제</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>무료 플랜:</strong> 기본 기능 제공, 프로젝트 수 제한
          </li>
          <li>
            <strong>Pro 플랜 ($9/월):</strong> 무제한 프로젝트, AI 인사이트,
            우선 지원
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.2 결제 처리</h3>
        <p>
          모든 구독 결제는 Polar를 통해 처리됩니다. Pro 플랜 구독 시 귀하는
          다음에 동의합니다:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>월간 구독료는 매월 자동으로 청구됩니다</li>
          <li>결제 수단에 충분한 자금을 유지할 책임이 있습니다</li>
          <li>
            결제 실패 시 서비스 접근이 일시 중지되거나 종료될 수 있습니다
          </li>
          <li>모든 요금은 미국 달러(USD)로 표시됩니다</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.3 환불 정책</h3>
        <p>
          구독료는 환불되지 않습니다. 결제 주기 중간에 취소하는 경우 현재
          결제 주기가 끝날 때까지 서비스에 계속 접근할 수 있으나, 다음 주기에는
          청구되지 않습니다.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.4 가격 변경</h3>
        <p>
          당사는 30일 전 통지를 통해 구독 가격을 변경할 권리를 보유합니다.
          가격 변경 후 서비스를 계속 사용하면 새로운 가격에 동의하는 것으로
          간주됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. 지식재산권</h2>
        <p>
          서비스 및 그 원본 콘텐츠, 기능, 기능성은 RealHourly 및 그
          라이선스제공자의 독점 재산이며 저작권, 상표권 및 기타 지식재산권법의
          보호를 받습니다.
        </p>
        <p>귀하는 다음 행위를 할 수 없습니다:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>서비스의 소스 코드를 복제, 수정, 배포, 판매 또는 임대</li>
          <li>서비스를 리버스 엔지니어링, 디컴파일 또는 디스어셈블</li>
          <li>당사의 상표, 로고 또는 브랜딩을 무단으로 사용</li>
          <li>서비스 기반의 파생 작품 생성</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. 사용자 콘텐츠</h2>
        <p>
          귀하는 서비스에 업로드하거나 입력하는 모든 데이터 및 콘텐츠(프로젝트
          정보, 시간 기록, 비용 항목 등)에 대한 소유권을 유지합니다.
        </p>
        <p>
          서비스를 사용함으로써 귀하는 당사에 다음 제한적 라이선스를
          부여합니다:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>귀하에게 서비스를 제공하기 위해 콘텐츠를 저장 및 처리</li>
          <li>AI 기반 분석 및 인사이트 생성을 위해 콘텐츠 사용</li>
          <li>
            익명화되고 집계된 형태로 서비스 개선을 위한 분석에 데이터 사용
          </li>
        </ul>
        <p>
          당사는 귀하의 개인 데이터를 제3자에게 판매하거나 공유하지 않습니다.
          데이터 처리에 대한 자세한 내용은 개인정보처리방침을 참조하십시오.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. 금지 행위</h2>
        <p>서비스 사용 시 다음 행위를 금지합니다:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>불법적이거나 사기적인 목적으로 서비스 사용</li>
          <li>서비스의 보안 기능을 우회하거나 무력화하려는 시도</li>
          <li>
            자동화된 시스템(봇, 스크레이퍼)을 사용하여 서비스에 무단 접근
          </li>
          <li>악성 코드, 바이러스 또는 기타 유해한 코드 전송</li>
          <li>다른 사용자의 계정에 무단 접근 시도</li>
          <li>
            서비스 인프라에 과도한 부하를 가하거나 다른 사용자의 접근 방해
          </li>
          <li>
            당사 또는 타인의 지식재산권을 침해하는 콘텐츠 업로드 또는 공유
          </li>
          <li>
            불법적, 위협적, 중상모략적, 외설적 또는 기타 불쾌한 콘텐츠 게시
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          8. 면책조항 및 책임 제한
        </h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">8.1 서비스 제공 조건</h3>
        <p>
          서비스는 "있는 그대로" 및 "사용 가능한 대로" 제공됩니다. 당사는
          다음을 포함하되 이에 국한되지 않는 어떠한 보증도 하지 않습니다:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>서비스가 중단 없이 안전하고 오류 없이 작동한다는 보증</li>
          <li>계산 결과가 100% 정확하다는 보증</li>
          <li>서비스가 귀하의 특정 요구사항을 충족한다는 보증</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">8.2 전문가 자문 부재</h3>
        <p className="font-semibold text-amber-600 dark:text-amber-500">
          중요: RealHourly는 재무, 세무, 법률 또는 회계 자문을 제공하지
          않습니다. 본 서비스의 모든 계산 및 인사이트는 참고용이며 전문가
          자문을 대체할 수 없습니다.
        </p>
        <p>
          급여 계산, 세금 신고, 계약 협상 등 중요한 재무 결정을 내리기 전에
          자격을 갖춘 회계사, 세무사 또는 법률 전문가와 상담하시기 바랍니다.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">8.3 책임 제한</h3>
        <p>
          관련 법률이 허용하는 최대 범위 내에서 RealHourly는 다음에 대해
          책임지지 않습니다:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            간접적, 우발적, 특별, 결과적 또는 징벌적 손해(데이터 손실, 수익
            손실, 영업 중단 등 포함)
          </li>
          <li>
            서비스 사용 또는 사용 불능으로 인한 직접적 손해(최대 책임액은 지난
            12개월간 귀하가 지불한 금액으로 제한)
          </li>
          <li>제3자 서비스(Supabase, Polar, OpenAI) 장애 또는 중단</li>
          <li>
            계산 오류, 데이터 손실 또는 보안 침해로 인한 재무적 손실
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. 데이터 보안</h2>
        <p>
          당사는 업계 표준 보안 조치를 사용하여 귀하의 데이터를 보호하지만
          인터넷을 통한 전송 또는 전자 저장 방법이 100% 안전하다고 보장할 수
          없습니다.
        </p>
        <p>귀하의 책임:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>강력한 비밀번호를 사용하고 정기적으로 변경</li>
          <li>계정 자격증명을 타인과 공유하지 않음</li>
          <li>중요한 데이터는 정기적으로 백업(설정 {'>'} 데이터 내보내기)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">10. 계정 해지</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">10.1 귀하에 의한 해지</h3>
        <p>
          언제든지 계정 설정에서 구독을 취소하고 계정을 삭제할 수 있습니다.
          계정 삭제 시 모든 데이터는 30일 이내에 영구적으로 삭제됩니다.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">10.2 당사에 의한 해지</h3>
        <p>당사는 다음 경우 즉시 계정을 정지하거나 해지할 수 있습니다:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>본 약관 위반</li>
          <li>결제 실패 또는 사기 행위 의심</li>
          <li>장기간 계정 비활성(12개월 이상)</li>
          <li>법적 요구사항 또는 정부 명령</li>
        </ul>
        <p>
          해지 시 현재 결제 주기에 대한 환불은 제공되지 않으며 모든 데이터
          접근이 즉시 중단됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">11. 약관 변경</h2>
        <p>
          당사는 단독 재량으로 언제든지 본 약관을 수정할 수 있습니다. 중요한
          변경사항이 있는 경우:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>최소 30일 전에 이메일로 통지합니다</li>
          <li>
            서비스 내 공지사항 및 본 페이지 상단의 "최종 수정일"을 업데이트합니다
          </li>
        </ul>
        <p>
          변경된 약관 발효 후 서비스를 계속 사용하면 새로운 약관에 동의하는
          것으로 간주됩니다. 변경사항에 동의하지 않으시는 경우 서비스 사용을
          중단하고 계정을 삭제하시기 바랍니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">12. 준거법 및 분쟁 해결</h2>
        <p>
          본 약관은 대한민국 법률에 따라 해석되고 규율됩니다. 본 약관 또는
          서비스와 관련하여 발생하는 모든 분쟁은:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            먼저 당사와의 협상을 통해 해결을 시도해야 합니다(아래 연락처로
            문의)
          </li>
          <li>
            협상이 실패한 경우 대한민국 서울 관할 법원의 전속 관할에
            따릅니다
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">13. 기타 조항</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">13.1 완전 합의</h3>
        <p>
          본 약관은 서비스 사용과 관련하여 귀하와 RealHourly 간의 완전한 합의를
          구성하며 이전의 모든 구두 또는 서면 합의를 대체합니다.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">13.2 분리 가능성</h3>
        <p>
          본 약관의 어느 조항이 집행 불가능한 것으로 판단되는 경우 해당 조항은
          집행 가능한 범위 내에서 수정되거나 삭제되며 나머지 조항은 완전한
          효력을 유지합니다.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">13.3 권리 불포기</h3>
        <p>
          당사가 본 약관의 권리 또는 조항을 행사하거나 집행하지 않더라도
          그러한 권리 또는 조항을 포기하는 것으로 간주되지 않습니다.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">13.4 양도 금지</h3>
        <p>
          귀하는 당사의 사전 서면 동의 없이 본 약관에 따른 권리 또는 의무를
          양도할 수 없습니다. 당사는 본 약관을 자유롭게 양도할 수 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">14. 연락처</h2>
        <p>본 약관에 관한 질문이나 문의사항은 다음으로 연락주시기 바랍니다:</p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p>
            <strong>RealHourly</strong>
          </p>
          <p>이메일: support@real-hourly.com</p>
          <p>웹사이트: https://real-hourly.com</p>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          본 약관을 주의 깊게 읽어주셔서 감사합니다. RealHourly 서비스를
          사용함으로써 귀하는 본 약관을 읽고 이해했으며 이에 구속되는 것에
          동의함을 인정합니다.
        </p>
      </div>
    </article>
  );
}

function EnglishTerms() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Last Updated: February 13, 2026
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using the RealHourly service (the "Service"), you
          agree to be bound by these Terms of Service ("Terms"). If you do not
          agree to these Terms, do not use the Service.
        </p>
        <p>
          The Service is intended for users who are at least 14 years old.
          Users under 14 are prohibited from using the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          2. Service Description
        </h2>
        <p>
          RealHourly provides an AI-powered profitability dashboard for
          freelancers and independent contractors. Key features include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Natural language processing-based time logging with voice input</li>
          <li>Real hourly rate calculation accounting for hidden costs</li>
          <li>
            Scope creep detection and AI-generated billing message generation
          </li>
          <li>Profitability analysis and dashboard</li>
          <li>Weekly reports and AI insights</li>
          <li>PDF invoice and estimate generation</li>
          <li>Client work report sharing</li>
        </ul>
        <p>
          We reserve the right to modify, suspend, or discontinue the Service's
          features, pricing, or availability at any time without prior notice.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          3. Accounts and Registration
        </h2>
        <p>
          To use the Service, you must create an account through Supabase. When
          creating an account:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You must provide accurate, complete, and current information</li>
          <li>You are responsible for maintaining the security of your account credentials</li>
          <li>You are responsible for all activities that occur under your account</li>
          <li>
            You must notify us immediately of any unauthorized use or security
            breach
          </li>
        </ul>
        <p>
          We reserve the right to refuse account registration or terminate
          existing accounts at our sole discretion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          4. Subscriptions and Billing
        </h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Pricing Plans</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Free Plan:</strong> Basic features with limited projects
          </li>
          <li>
            <strong>Pro Plan ($9/month):</strong> Unlimited projects, AI
            insights, priority support
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Payment Processing</h3>
        <p>
          All subscription payments are processed through Polar. By subscribing
          to the Pro Plan, you agree that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Monthly subscription fees will be charged automatically</li>
          <li>
            You are responsible for maintaining sufficient funds in your payment
            method
          </li>
          <li>
            Failed payments may result in service suspension or termination
          </li>
          <li>All fees are stated in United States Dollars (USD)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Refund Policy</h3>
        <p>
          Subscription fees are non-refundable. If you cancel mid-billing cycle,
          you will retain access to the Service until the end of the current
          billing period, but you will not be charged for the next cycle.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">4.4 Price Changes</h3>
        <p>
          We reserve the right to change subscription pricing with 30 days'
          notice. Continued use of the Service after a price change constitutes
          acceptance of the new pricing.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          5. Intellectual Property
        </h2>
        <p>
          The Service and its original content, features, and functionality are
          the exclusive property of RealHourly and its licensors and are
          protected by copyright, trademark, and other intellectual property
          laws.
        </p>
        <p>You may not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Copy, modify, distribute, sell, or lease any part of the Service's
            source code
          </li>
          <li>Reverse engineer, decompile, or disassemble the Service</li>
          <li>Use our trademarks, logos, or branding without authorization</li>
          <li>Create derivative works based on the Service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. User Content</h2>
        <p>
          You retain ownership of all data and content you upload or enter into
          the Service (project information, time entries, cost entries, etc.).
        </p>
        <p>
          By using the Service, you grant us a limited license to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Store and process your content to provide the Service to you</li>
          <li>Use your content to generate AI-powered analytics and insights</li>
          <li>
            Use data in anonymized and aggregated form for service improvement
            analytics
          </li>
        </ul>
        <p>
          We do not sell or share your personal data with third parties. See our
          Privacy Policy for details on data processing.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Prohibited Use</h2>
        <p>When using the Service, you must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the Service for any illegal or fraudulent purpose</li>
          <li>
            Attempt to bypass or disable any security features of the Service
          </li>
          <li>
            Use automated systems (bots, scrapers) to access the Service without
            authorization
          </li>
          <li>Transmit malware, viruses, or other harmful code</li>
          <li>Attempt to gain unauthorized access to other users' accounts</li>
          <li>
            Overload the Service infrastructure or interfere with other users'
            access
          </li>
          <li>
            Upload or share content that infringes on our or others'
            intellectual property rights
          </li>
          <li>
            Post illegal, threatening, defamatory, obscene, or otherwise
            objectionable content
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          8. Disclaimers and Limitation of Liability
        </h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">8.1 As-Is Service</h3>
        <p>
          The Service is provided "as is" and "as available" without warranties
          of any kind, including but not limited to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Warranties that the Service will operate uninterrupted, securely, or
            error-free
          </li>
          <li>Warranties that calculation results are 100% accurate</li>
          <li>Warranties that the Service meets your specific requirements</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          8.2 No Professional Advice
        </h3>
        <p className="font-semibold text-amber-600 dark:text-amber-500">
          IMPORTANT: RealHourly does not provide financial, tax, legal, or
          accounting advice. All calculations and insights provided by the
          Service are for informational purposes only and do not constitute
          professional advice.
        </p>
        <p>
          Before making important financial decisions such as salary
          calculations, tax filings, or contract negotiations, consult with a
          qualified accountant, tax professional, or legal advisor.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          8.3 Limitation of Liability
        </h3>
        <p>
          To the maximum extent permitted by applicable law, RealHourly shall
          not be liable for:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Indirect, incidental, special, consequential, or punitive damages
            (including data loss, revenue loss, business interruption, etc.)
          </li>
          <li>
            Direct damages arising from use or inability to use the Service (our
            maximum liability is limited to the amount you paid in the last 12
            months)
          </li>
          <li>
            Third-party service failures or interruptions (Supabase, Polar,
            OpenAI)
          </li>
          <li>
            Financial losses due to calculation errors, data loss, or security
            breaches
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Data Security</h2>
        <p>
          We use industry-standard security measures to protect your data, but
          we cannot guarantee that transmission over the Internet or electronic
          storage methods are 100% secure.
        </p>
        <p>Your responsibilities:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use strong passwords and change them regularly</li>
          <li>Do not share your account credentials with others</li>
          <li>
            Regularly back up important data (Settings {'>'} Export Data)
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Termination</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">
          10.1 Termination by You
        </h3>
        <p>
          You may cancel your subscription and delete your account at any time
          from account settings. Upon account deletion, all data will be
          permanently deleted within 30 days.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          10.2 Termination by Us
        </h3>
        <p>
          We may suspend or terminate your account immediately if:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You violate these Terms</li>
          <li>Payment fails or fraudulent activity is suspected</li>
          <li>Your account is inactive for an extended period (12+ months)</li>
          <li>Legal requirements or government orders require it</li>
        </ul>
        <p>
          Upon termination, no refund will be provided for the current billing
          cycle and all data access will be immediately revoked.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          11. Changes to Terms
        </h2>
        <p>
          We may modify these Terms at any time at our sole discretion. For
          significant changes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We will notify you by email at least 30 days in advance</li>
          <li>
            We will update the "Last Updated" date at the top of this page and
            post a notice on the Service
          </li>
        </ul>
        <p>
          Continued use of the Service after the effective date of the updated
          Terms constitutes acceptance of the new Terms. If you do not agree to
          the changes, you must stop using the Service and delete your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          12. Governing Law and Dispute Resolution
        </h2>
        <p>
          These Terms shall be interpreted and governed by the laws of the
          Republic of Korea. Any disputes arising from these Terms or the
          Service shall:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            First be attempted to be resolved through negotiation with us (contact
            below)
          </li>
          <li>
            If negotiation fails, be subject to the exclusive jurisdiction of
            the courts of Seoul, Republic of Korea
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          13. Miscellaneous Provisions
        </h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">13.1 Entire Agreement</h3>
        <p>
          These Terms constitute the entire agreement between you and RealHourly
          regarding your use of the Service and supersede all prior oral or
          written agreements.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">13.2 Severability</h3>
        <p>
          If any provision of these Terms is deemed unenforceable, that
          provision shall be modified to the extent enforceable or deleted, and
          the remaining provisions shall remain in full effect.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">13.3 No Waiver</h3>
        <p>
          Our failure to exercise or enforce any right or provision of these
          Terms shall not constitute a waiver of such right or provision.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">13.4 No Assignment</h3>
        <p>
          You may not assign your rights or obligations under these Terms
          without our prior written consent. We may freely assign these Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact</h2>
        <p>
          For questions or inquiries about these Terms, please contact us at:
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p>
            <strong>RealHourly</strong>
          </p>
          <p>Email: support@real-hourly.com</p>
          <p>Website: https://real-hourly.com</p>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Thank you for carefully reading these Terms. By using the RealHourly
          Service, you acknowledge that you have read, understood, and agree to
          be bound by these Terms.
        </p>
      </div>
    </article>
  );
}
