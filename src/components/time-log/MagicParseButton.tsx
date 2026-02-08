"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

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

  return (
    <Button onClick={onClick} disabled={disabled || loading} className="gap-2">
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {t("parsing")}
        </>
      ) : (
        <>
          <Sparkles className="size-4" />
          {t("parse")}
        </>
      )}
    </Button>
  );
}
