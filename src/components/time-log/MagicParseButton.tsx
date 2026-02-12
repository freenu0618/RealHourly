"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface MagicParseButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function MagicParseButton({
  onClick,
  loading,
  disabled,
}: MagicParseButtonProps) {
  const t = useTranslations("timeLog");

  if (loading) {
    return (
      <Button onClick={onClick} disabled className="gap-2">
        <Loader2 className="size-4 animate-spin" />
        {t("parsing")}
      </Button>
    );
  }

  return (
    <ShimmerButton
      onClick={onClick}
      disabled={disabled}
      shimmerColor="#E8882D"
      shimmerSize="0.06em"
      background="var(--primary)"
      borderRadius="8px"
      className="h-9 px-4 text-sm font-medium text-primary-foreground gap-2"
    >
      <Sparkles className="size-4" />
      {t("parse")}
    </ShimmerButton>
  );
}
