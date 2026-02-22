"use client";

import { useLocale } from "next-intl";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

/**
 * Privacy Policy Page
 *
 * @description Comprehensive GDPR/PIPA-compliant privacy policy for RealHourly
 * Bilingual (Korean/English) with full disclosure of data processing practices
 */
export default function PrivacyContent() {
  const locale = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {isKorean ? <KoreanContent /> : <EnglishContent />}
      </main>

      <LandingFooter />
    </div>
  );
}

function KoreanContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-2">개인정보 처리방침</h1>
      <p className="text-muted-foreground mb-8">
        최종 수정일: 2026년 2월 13일
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. 서론</h2>
        <p>
          RealHourly("당사", "우리")는 real-hourly.com 웹사이트 및 관련 서비스(총칭하여 "서비스")를
          운영합니다. 본 개인정보 처리방침은 귀하가 당사 서비스를 이용할 때 당사가 수집, 사용,
          공개 및 보호하는 정보에 대해 설명합니다.
        </p>
        <p>
          당사는 대한민국 개인정보보호법(PIPA) 및 유럽연합 일반 데이터 보호 규정(GDPR)을
          준수하며, 귀하의 개인정보를 보호하기 위해 최선을 다하고 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. 수집하는 정보</h2>

        <h3 className="text-xl font-semibold mb-3">2.1 직접 제공하시는 정보</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>계정 정보</strong>: 이메일 주소, 비밀번호, 표시 이름</li>
          <li><strong>프로필 정보</strong>: 기본 통화, 시간당 목표 요율, 시간대, 언어 설정</li>
          <li><strong>프로젝트 데이터</strong>: 프로젝트 이름, 고객 정보, 예상 시간 및 금액, 플랫폼 수수료율, 세율</li>
          <li><strong>시간 기록 데이터</strong>: 작업 설명, 날짜, 시간(분), 카테고리, 자연어 입력 텍스트</li>
          <li><strong>비용 데이터</strong>: 비용 금액, 유형, 메모</li>
          <li><strong>결제 정보</strong>: Polar(Stripe 기반)를 통해 처리되며, 당사는 결제 카드 정보를 직접 저장하지 않습니다</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">2.2 자동으로 수집되는 정보</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>사용 데이터</strong>: IP 주소, 브라우저 유형, 장치 정보, 운영 체제, 페이지 조회수, 클릭 데이터</li>
          <li><strong>쿠키 및 추적 기술</strong>: 세션 쿠키(인증), 분석 쿠키(Google Analytics), 로컬 스토리지(사용자 환경설정)</li>
          <li><strong>로그 데이터</strong>: 액세스 시간, 참조 URL, 오류 로그</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">2.3 제3자로부터 받는 정보</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>소셜 로그인</strong>: Google OAuth를 통해 로그인 시 Google로부터 이메일, 프로필 사진, 이름을 받습니다</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. 정보의 사용 목적</h2>
        <p>당사는 수집한 정보를 다음 목적으로 사용합니다:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>서비스 제공 및 운영 (시간 기록, 수익성 분석, 실질 시급 계산)</li>
          <li>AI 기반 기능 제공 (자연어 시간 기록 파싱, 챗봇 상담, 인사이트 생성)</li>
          <li>계정 인증 및 보안 유지</li>
          <li>고객 지원 및 문의 응답</li>
          <li>서비스 개선 및 새로운 기능 개발</li>
          <li>사용 패턴 분석 및 통계 생성</li>
          <li>법적 의무 준수 및 사기 방지</li>
          <li>마케팅 및 프로모션 (사용자 동의 시)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. 제3자 서비스 제공업체</h2>
        <p>당사는 다음 제3자 서비스를 사용합니다:</p>

        <h3 className="text-xl font-semibold mb-3">4.1 Supabase (데이터베이스 및 인증)</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>목적</strong>: PostgreSQL 데이터베이스 호스팅, 사용자 인증, 세션 관리</li>
          <li><strong>데이터 위치</strong>: AWS (미국 또는 선택한 리전)</li>
          <li><strong>보안</strong>: 행 수준 보안(RLS) 정책 적용, 암호화된 연결</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">4.2 OpenAI (AI 처리)</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>목적</strong>: 자연어 시간 기록 파싱, AI 챗봇, 주간 인사이트 생성, 청구서 항목 생성</li>
          <li><strong>처리되는 데이터</strong>: 시간 기록 텍스트, 프로젝트 컨텍스트, 사용자 질문</li>
          <li><strong>중요 사항</strong>: OpenAI는 처리를 위해서만 데이터를 사용하며, 모델 학습에 사용하지 않습니다.
            데이터는 처리 후 30일 이내에 삭제됩니다 (OpenAI 데이터 사용 정책에 따름)</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">4.3 Google Analytics</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>목적</strong>: 웹사이트 사용 통계 및 분석</li>
          <li><strong>추적 ID</strong>: G-YQ6MKBLBKY</li>
          <li><strong>수집 데이터</strong>: 페이지 조회수, 세션 기간, 사용자 인구통계(익명화)</li>
          <li><strong>거부 방법</strong>: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics 거부 브라우저 애드온</a></li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">4.4 Polar (결제 처리)</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>목적</strong>: 구독 결제 처리</li>
          <li><strong>기반 서비스</strong>: Stripe (PCI-DSS 준수)</li>
          <li><strong>처리 데이터</strong>: 결제 카드 정보, 청구 주소, 거래 내역</li>
          <li><strong>중요 사항</strong>: 당사는 결제 카드 번호를 직접 저장하지 않습니다</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">4.5 Vercel (호스팅)</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>목적</strong>: 웹 애플리케이션 호스팅 및 배포</li>
          <li><strong>데이터 위치</strong>: 전 세계 CDN (미국 기본)</li>
          <li><strong>처리 데이터</strong>: 로그, 성능 지표</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. 데이터 보유 기간</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>계정 데이터</strong>: 계정 삭제 요청 시까지 또는 2년간 비활성 후 자동 삭제</li>
          <li><strong>시간 기록 및 프로젝트 데이터</strong>: 사용자가 삭제할 때까지 보관 (소프트 삭제 후 30일 내 영구 삭제)</li>
          <li><strong>로그 데이터</strong>: 90일간 보관</li>
          <li><strong>결제 내역</strong>: 법적 요구사항에 따라 최소 7년간 보관</li>
          <li><strong>마케팅 데이터</strong>: 동의 철회 시 즉시 삭제</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. 데이터 보안</h2>
        <p>당사는 다음과 같은 보안 조치를 취합니다:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>모든 데이터 전송 시 TLS/SSL 암호화</li>
          <li>저장 데이터 암호화 (AES-256)</li>
          <li>행 수준 보안(RLS) 정책으로 데이터 격리</li>
          <li>정기적인 보안 감사 및 취약점 스캔</li>
          <li>직원 액세스 제한 및 역할 기반 권한 관리</li>
          <li>API 요청 속도 제한 및 DDoS 방어</li>
        </ul>
        <p className="mt-4">
          그러나 인터넷을 통한 전송이나 전자 저장 방법은 100% 안전하지 않습니다.
          당사는 귀하의 개인정보를 보호하기 위해 최선을 다하지만, 절대적인 보안을 보장할 수는 없습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. 귀하의 권리 (GDPR/PIPA)</h2>
        <p>귀하는 다음과 같은 권리를 가집니다:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>액세스 권리</strong>: 당사가 보유한 귀하의 개인정보 사본 요청</li>
          <li><strong>정정 권리</strong>: 부정확하거나 불완전한 정보 수정 요청</li>
          <li><strong>삭제 권리 (잊힐 권리)</strong>: 귀하의 개인정보 삭제 요청</li>
          <li><strong>이동 권리</strong>: 구조화된 기계 판독 가능 형식으로 데이터 수신</li>
          <li><strong>처리 제한 권리</strong>: 특정 상황에서 처리 제한 요청</li>
          <li><strong>반대 권리</strong>: 직접 마케팅 등 특정 처리에 반대</li>
          <li><strong>동의 철회 권리</strong>: 언제든지 동의 철회 (철회 전 처리의 적법성에는 영향 없음)</li>
        </ul>
        <p className="mt-4">
          이러한 권리를 행사하려면 <a href="mailto:support@real-hourly.com" className="text-primary underline">support@real-hourly.com</a>으로
          연락하시기 바랍니다. 당사는 30일 이내에 응답하겠습니다.
        </p>
        <p className="mt-4">
          또한 귀하는 관할 데이터 보호 기관에 불만을 제기할 권리가 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. 아동 개인정보 보호</h2>
        <p>
          당사 서비스는 만 13세 미만의 아동을 대상으로 하지 않습니다.
          당사는 의도적으로 만 13세 미만 아동으로부터 개인정보를 수집하지 않습니다.
          귀하가 부모 또는 보호자이며 자녀가 당사에 개인정보를 제공했다고 판단되는 경우,
          즉시 <a href="mailto:support@real-hourly.com" className="text-primary underline">support@real-hourly.com</a>으로
          연락하여 주시기 바랍니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. 국제 데이터 전송</h2>
        <p>
          귀하의 정보는 귀하가 거주하는 국가 외부의 서버로 전송되어 처리될 수 있습니다.
          특히:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Supabase(AWS): 미국 또는 선택한 리전</li>
          <li>OpenAI: 미국</li>
          <li>Vercel: 전 세계 CDN</li>
        </ul>
        <p className="mt-4">
          당사는 EU 표준 계약 조항(SCC) 및 적절한 보호 조치를 통해 귀하의 데이터가
          본 개인정보 처리방침 및 적용 가능한 법률에 따라 보호되도록 합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. 쿠키 정책</h2>

        <h3 className="text-xl font-semibold mb-3">10.1 사용하는 쿠키</h3>

        <h4 className="text-lg font-semibold mb-2">필수 쿠키</h4>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Supabase 세션 쿠키</strong>: 로그인 상태 유지 (만료: 7일)</li>
          <li><strong>CSRF 토큰</strong>: 보안 공격 방지</li>
        </ul>

        <h4 className="text-lg font-semibold mb-2">분석 쿠키</h4>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Google Analytics (_ga, _gid)</strong>: 사용 통계 수집 (만료: 2년 / 24시간)</li>
        </ul>

        <h4 className="text-lg font-semibold mb-2">기능 쿠키</h4>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>로컬 스토리지</strong>: 언어 설정, 테마 환경설정, 대시보드 레이아웃</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">10.2 쿠키 관리</h3>
        <p>귀하는 다음 방법으로 쿠키를 관리할 수 있습니다:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>브라우저 설정에서 쿠키 차단 또는 삭제</li>
          <li>Google Analytics 거부 애드온 사용</li>
          <li>필수 쿠키를 차단하면 서비스가 제대로 작동하지 않을 수 있습니다</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. 개인정보 처리방침 변경</h2>
        <p>
          당사는 본 개인정보 처리방침을 수시로 업데이트할 수 있습니다.
          변경 사항이 있을 경우 이 페이지에 새로운 개인정보 처리방침을 게시하고
          "최종 수정일"을 업데이트합니다.
        </p>
        <p className="mt-4">
          중요한 변경 사항이 있는 경우 이메일로 통지하거나 서비스에 눈에 띄는 공지를 게시합니다.
          변경 사항이 적용되기 전에 본 개인정보 처리방침을 정기적으로 검토하시기 바랍니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. 연락처</h2>
        <p>
          본 개인정보 처리방침에 대한 질문, 우려 사항 또는 귀하의 권리 행사를 원하시는 경우
          다음으로 연락해 주시기 바랍니다:
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p><strong>RealHourly</strong></p>
          <p>이메일: <a href="mailto:support@real-hourly.com" className="text-primary underline">support@real-hourly.com</a></p>
          <p>웹사이트: <a href="https://real-hourly.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">real-hourly.com</a></p>
        </div>
      </section>

      <section className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">⚠️ 중요 고지사항</h2>
        <p>
          RealHourly는 프리랜서를 위한 수익성 분석 도구입니다.
          당사는 법률, 회계 또는 재무 자문을 제공하지 않습니다.
          모든 계산 결과는 참고용이며, 실제 세금 신고 또는 법적 결정을 위해서는
          공인 회계사 또는 세무사와 상담하시기 바랍니다.
        </p>
        <p className="mt-4">
          당사는 서비스 사용으로 인한 재정적 손실, 세금 문제 또는 법적 책임에 대해
          책임지지 않습니다.
        </p>
      </section>
    </article>
  );
}

function EnglishContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Last Updated: February 13, 2026
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p>
          RealHourly ("we", "us", "our") operates the real-hourly.com website and related services
          (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose,
          and protect information when you use our Service.
        </p>
        <p>
          We comply with the South Korean Personal Information Protection Act (PIPA) and the
          European Union General Data Protection Regulation (GDPR), and are committed to protecting
          your personal information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

        <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide Directly</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Account Information</strong>: Email address, password, display name</li>
          <li><strong>Profile Information</strong>: Default currency, hourly rate goal, timezone, language preferences</li>
          <li><strong>Project Data</strong>: Project names, client information, expected hours and fees, platform fee rates, tax rates</li>
          <li><strong>Time Log Data</strong>: Task descriptions, dates, time (minutes), categories, natural language input text</li>
          <li><strong>Cost Data</strong>: Cost amounts, types, notes</li>
          <li><strong>Payment Information</strong>: Processed via Polar (Stripe-based); we do not directly store payment card information</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Usage Data</strong>: IP address, browser type, device information, operating system, page views, click data</li>
          <li><strong>Cookies and Tracking Technologies</strong>: Session cookies (authentication), analytics cookies (Google Analytics), local storage (user preferences)</li>
          <li><strong>Log Data</strong>: Access times, referral URLs, error logs</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">2.3 Information from Third Parties</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Social Login</strong>: When you log in via Google OAuth, we receive your email, profile picture, and name from Google</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Provide and operate the Service (time tracking, profitability analysis, real hourly rate calculation)</li>
          <li>Provide AI-powered features (natural language time log parsing, chatbot assistance, insight generation)</li>
          <li>Authenticate accounts and maintain security</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Improve the Service and develop new features</li>
          <li>Analyze usage patterns and generate statistics</li>
          <li>Comply with legal obligations and prevent fraud</li>
          <li>Marketing and promotions (with user consent)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Third-Party Service Providers</h2>
        <p>We use the following third-party services:</p>

        <h3 className="text-xl font-semibold mb-3">4.1 Supabase (Database and Authentication)</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Purpose</strong>: PostgreSQL database hosting, user authentication, session management</li>
          <li><strong>Data Location</strong>: AWS (US or selected region)</li>
          <li><strong>Security</strong>: Row-level security (RLS) policies enforced, encrypted connections</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">4.2 OpenAI (AI Processing)</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Purpose</strong>: Natural language time log parsing, AI chatbot, weekly insight generation, invoice item generation</li>
          <li><strong>Data Processed</strong>: Time log text, project context, user questions</li>
          <li><strong>Important</strong>: OpenAI uses data for processing only and does not use it for model training.
            Data is deleted within 30 days after processing (per OpenAI's data usage policies)</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">4.3 Google Analytics</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Purpose</strong>: Website usage statistics and analysis</li>
          <li><strong>Tracking ID</strong>: G-YQ6MKBLBKY</li>
          <li><strong>Data Collected</strong>: Page views, session duration, user demographics (anonymized)</li>
          <li><strong>Opt-out</strong>: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics Opt-out Browser Add-on</a></li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">4.4 Polar (Payment Processing)</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Purpose</strong>: Subscription payment processing</li>
          <li><strong>Based On</strong>: Stripe (PCI-DSS compliant)</li>
          <li><strong>Data Processed</strong>: Payment card information, billing address, transaction history</li>
          <li><strong>Important</strong>: We do not directly store payment card numbers</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">4.5 Vercel (Hosting)</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Purpose</strong>: Web application hosting and deployment</li>
          <li><strong>Data Location</strong>: Global CDN (US default)</li>
          <li><strong>Data Processed</strong>: Logs, performance metrics</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Account Data</strong>: Until account deletion request or automatic deletion after 2 years of inactivity</li>
          <li><strong>Time Log and Project Data</strong>: Retained until user deletion (soft delete, permanent deletion within 30 days)</li>
          <li><strong>Log Data</strong>: Retained for 90 days</li>
          <li><strong>Payment History</strong>: Retained for minimum 7 years per legal requirements</li>
          <li><strong>Marketing Data</strong>: Deleted immediately upon consent withdrawal</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
        <p>We implement the following security measures:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>TLS/SSL encryption for all data transmission</li>
          <li>Data-at-rest encryption (AES-256)</li>
          <li>Row-level security (RLS) policies for data isolation</li>
          <li>Regular security audits and vulnerability scans</li>
          <li>Employee access restrictions and role-based permission management</li>
          <li>API request rate limiting and DDoS protection</li>
        </ul>
        <p className="mt-4">
          However, no method of transmission over the Internet or electronic storage is 100% secure.
          While we strive to protect your personal information, we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Your Rights (GDPR/PIPA)</h2>
        <p>You have the following rights:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Right of Access</strong>: Request a copy of your personal information we hold</li>
          <li><strong>Right to Rectification</strong>: Request correction of inaccurate or incomplete information</li>
          <li><strong>Right to Erasure (Right to be Forgotten)</strong>: Request deletion of your personal information</li>
          <li><strong>Right to Data Portability</strong>: Receive your data in a structured, machine-readable format</li>
          <li><strong>Right to Restriction of Processing</strong>: Request restriction of processing in certain circumstances</li>
          <li><strong>Right to Object</strong>: Object to certain processing, such as direct marketing</li>
          <li><strong>Right to Withdraw Consent</strong>: Withdraw consent at any time (without affecting lawfulness of processing before withdrawal)</li>
        </ul>
        <p className="mt-4">
          To exercise these rights, please contact us at <a href="mailto:support@real-hourly.com" className="text-primary underline">support@real-hourly.com</a>.
          We will respond within 30 days.
        </p>
        <p className="mt-4">
          You also have the right to lodge a complaint with your supervisory data protection authority.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
        <p>
          Our Service is not directed to children under 13 years of age.
          We do not knowingly collect personal information from children under 13.
          If you are a parent or guardian and believe your child has provided us with personal information,
          please contact us immediately at <a href="mailto:support@real-hourly.com" className="text-primary underline">support@real-hourly.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed on servers outside your country of residence.
          Specifically:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Supabase (AWS): US or selected region</li>
          <li>OpenAI: US</li>
          <li>Vercel: Global CDN</li>
        </ul>
        <p className="mt-4">
          We ensure your data is protected in accordance with this Privacy Policy and applicable law
          through EU Standard Contractual Clauses (SCCs) and appropriate safeguards.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Cookie Policy</h2>

        <h3 className="text-xl font-semibold mb-3">10.1 Cookies We Use</h3>

        <h4 className="text-lg font-semibold mb-2">Essential Cookies</h4>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Supabase Session Cookies</strong>: Maintain login state (expires: 7 days)</li>
          <li><strong>CSRF Token</strong>: Prevent security attacks</li>
        </ul>

        <h4 className="text-lg font-semibold mb-2">Analytics Cookies</h4>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Google Analytics (_ga, _gid)</strong>: Collect usage statistics (expires: 2 years / 24 hours)</li>
        </ul>

        <h4 className="text-lg font-semibold mb-2">Functional Cookies</h4>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Local Storage</strong>: Language settings, theme preferences, dashboard layout</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">10.2 Managing Cookies</h3>
        <p>You can manage cookies through:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Browser settings to block or delete cookies</li>
          <li>Google Analytics opt-out add-on</li>
          <li>Note: Blocking essential cookies may prevent the Service from functioning properly</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time.
          When we make changes, we will post the new Privacy Policy on this page and update the
          "Last Updated" date.
        </p>
        <p className="mt-4">
          For significant changes, we will notify you via email or by posting a prominent notice on our Service.
          We encourage you to review this Privacy Policy periodically before the changes take effect.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
        <p>
          If you have questions, concerns, or wish to exercise your rights regarding this Privacy Policy,
          please contact us at:
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p><strong>RealHourly</strong></p>
          <p>Email: <a href="mailto:support@real-hourly.com" className="text-primary underline">support@real-hourly.com</a></p>
          <p>Website: <a href="https://real-hourly.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">real-hourly.com</a></p>
        </div>
      </section>

      <section className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">⚠️ Important Disclaimer</h2>
        <p>
          RealHourly is a profitability analysis tool for freelancers.
          We do not provide legal, accounting, or financial advice.
          All calculation results are for reference only. For actual tax filing or legal decisions,
          please consult with a certified public accountant or tax professional.
        </p>
        <p className="mt-4">
          We are not liable for any financial losses, tax issues, or legal liabilities
          arising from the use of our Service.
        </p>
      </section>
    </article>
  );
}
