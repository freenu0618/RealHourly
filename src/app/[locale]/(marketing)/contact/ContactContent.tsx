"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Send } from "lucide-react";
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

/**
 * Contact Page
 *
 * @description Contact form that creates a mailto link with pre-filled subject and body.
 * No backend needed for MVP. Shows direct contact info and response time.
 */
export default function ContactContent() {
  const t = useTranslations("contact");
  const locale = useLocale();

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

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
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
