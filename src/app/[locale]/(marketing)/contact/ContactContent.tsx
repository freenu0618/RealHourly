"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Bug, CreditCard, Lightbulb, Mail, Send, Users } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONTACT_GUIDE = {
  ko: {
    title: "더 빠른 답변을 위한 문의 유형",
    description:
      "문의 내용을 아래 흐름에 맞춰 정리하면 담당자가 기능, 버그, 결제, 도입 질문을 더 정확히 확인할 수 있습니다.",
    items: [
      {
        icon: Lightbulb,
        title: "기능 제안",
        body: "어떤 프리랜서 워크플로에서 필요한지와 기대하는 결과를 함께 적어주세요.",
      },
      {
        icon: Bug,
        title: "버그 신고",
        body: "발생한 페이지, 브라우저, 입력값, 재현 단계를 포함하면 확인이 빨라집니다.",
      },
      {
        icon: CreditCard,
        title: "결제 문의",
        body: "플랜, 영수증, 구독 상태처럼 확인이 필요한 항목을 구체적으로 남겨주세요.",
      },
      {
        icon: Users,
        title: "도입 상담",
        body: "팀 규모, 프로젝트 방식, 필요한 리포트나 승인 흐름을 알려주세요.",
      },
    ],
  },
  en: {
    title: "Inquiry types that help us answer faster",
    description:
      "Framing your note this way helps the team route feature, bug, billing, and adoption questions accurately.",
    items: [
      {
        icon: Lightbulb,
        title: "Feature requests",
        body: "Share the freelance workflow, the pain point, and the outcome you expect.",
      },
      {
        icon: Bug,
        title: "Bug reports",
        body: "Include the page, browser, inputs, and steps that reproduce the issue.",
      },
      {
        icon: CreditCard,
        title: "Billing questions",
        body: "Mention the plan, receipt, subscription state, or policy detail to check.",
      },
      {
        icon: Users,
        title: "Adoption questions",
        body: "Tell us your team size, project model, and reporting or approval needs.",
      },
    ],
  },
} as const;

/**
 * Contact Page
 *
 * @description Contact form that creates a mailto link with pre-filled subject and body.
 * No backend needed for MVP. Shows direct contact info and response time.
 */
export default function ContactContent() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const guide = locale === "ko" ? CONTACT_GUIDE.ko : CONTACT_GUIDE.en;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return;
    }

    // Create mailto link
    const subjectLine = `[${formData.subject}] ${t("emailSubjectPrefix")} - ${formData.name}`;
    const body = `${t("emailBodyName")}: ${formData.name}\n${t("emailBodyEmail")}: ${formData.email}\n\n${t("emailBodyMessage")}:\n${formData.message}`;

    const mailtoLink = `mailto:support@real-hourly.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main id="main-content" tabIndex={-1} className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h2 className="font-semibold mb-1">{t("directContactTitle")}</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  <a
                    href="mailto:support@real-hourly.com"
                    className="text-primary hover:underline"
                  >
                    support@real-hourly.com
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("responseTime")}
                </p>
              </div>
            </div>
          </div>

          <section
            aria-labelledby="contact-guide-title"
            className="mb-8 rounded-lg border bg-muted/30 p-5"
          >
            <h2 id="contact-guide-title" className="text-lg font-semibold">
              {guide.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {guide.description}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {guide.items.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-md border bg-background p-4">
                    <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("namePlaceholder")}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="subject">{t("subjectLabel")}</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => handleChange("subject", value)}
                required
              >
                <SelectTrigger id="subject" className="mt-1.5">
                  <SelectValue placeholder={t("subjectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t("subjectGeneral")}</SelectItem>
                  <SelectItem value="bug">{t("subjectBug")}</SelectItem>
                  <SelectItem value="feature">{t("subjectFeature")}</SelectItem>
                  <SelectItem value="billing">{t("subjectBilling")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">{t("messageLabel")}</Label>
              <Textarea
                id="message"
                required
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder={t("messagePlaceholder")}
                rows={6}
                className="mt-1.5"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!formData.name || !formData.email || !formData.subject || !formData.message}
            >
              <Send className="h-4 w-4 mr-2" />
              {t("submitButton")}
            </Button>
          </form>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
