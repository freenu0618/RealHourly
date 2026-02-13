"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, Clock, TrendingUp, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * OnboardingModal
 *
 * @description Multi-step onboarding flow for first-time RealHourly users.
 * Shows 3 steps: Welcome, Quick Start guide, and Ready confirmation.
 * Uses localStorage to track completion and prevent re-showing.
 *
 * @example
 * <OnboardingModal />
 */
const OnboardingModal = () => {
  const t = useTranslations("onboarding");
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const STORAGE_KEY = "onboarding-completed";
  const TOTAL_STEPS = 3;

  // Hydration safety: only check localStorage on client
  useEffect(() => {
    setIsClient(true);
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Don't render during SSR or if already completed
  if (!isClient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="onboarding-description"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">
            {t("title")}
          </DialogTitle>
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label={t("skip")}
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div id="onboarding-description" className="py-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {t("welcome.title")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("welcome.description")}
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {t("quickStart.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("quickStart.description")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                      <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">
                        {t("quickStart.step1.title")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("quickStart.step1.description")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">
                        {t("quickStart.step2.title")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("quickStart.step2.description")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">
                        {t("quickStart.step3.title")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("quickStart.step3.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                    <TrendingUp className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {t("ready.title")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("ready.description")}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 pb-4">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-6 bg-primary"
                  : "bg-muted hover:bg-muted-foreground/30"
              }`}
              aria-label={`${t("goToStep")} ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                aria-label={t("back")}
              >
                {t("back")}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < TOTAL_STEPS - 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                {t("skip")}
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === TOTAL_STEPS - 1 ? t("getStarted") : t("next")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
