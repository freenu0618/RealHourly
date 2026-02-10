"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link2, Copy, Settings, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatDate } from "@/lib/date";
import { CreateShareDialog } from "./CreateShareDialog";
import { EditShareDialog } from "./EditShareDialog";

interface ShareDTO {
  id: string;
  projectId: string;
  shareToken: string;
  shareUrl: string;
  label: string | null;
  expiresAt: string | null;
  showTimeDetails: boolean;
  showCategoryBreakdown: boolean;
  showProgress: boolean;
  showInvoiceDownload: boolean;
  isRevoked: boolean;
  lastAccessedAt: string | null;
  accessCount: number;
  createdAt: string;
}

interface ShareManagementSectionProps {
  projectId: string;
}

export function ShareManagementSection({
  projectId,
}: ShareManagementSectionProps) {
  const t = useTranslations("clientReport");
  const [shares, setShares] = useState<ShareDTO[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ShareDTO | null>(null);

  const fetchShares = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/shares`);
      if (!res.ok) return;
      const { data } = await res.json();
      setShares(data);
    } catch {
      // silent
    }
  }, [projectId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  async function handleRevoke(shareId: string) {
    if (!confirm(t("revokeConfirm"))) return;
    try {
      const res = await fetch(`/api/shares/${shareId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(t("revoked"));
      fetchShares();
    } catch {
      toast.error(t("createFailed"));
    }
  }

  async function handleCopy(url: string) {
    const ok = await copyToClipboard(url);
    if (ok) toast.success(t("linkCopied"));
  }

  const activeShares = shares.filter((s) => !s.isRevoked);
  const revokedShares = shares.filter((s) => s.isRevoked);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="size-4" />
            {t("shareButton")}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={() => setShowCreate(true)}
          >
            {t("createLink")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeShares.length === 0 && revokedShares.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              {t("createLink")}
            </p>
          )}

          {activeShares.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("activeLinks")}
              </p>
              {activeShares.map((share) => (
                <ShareCard
                  key={share.id}
                  share={share}
                  t={t}
                  onCopy={handleCopy}
                  onEdit={() => setEditTarget(share)}
                  onRevoke={() => handleRevoke(share.id)}
                />
              ))}
            </div>
          )}

          {revokedShares.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("revokedLinks")}
              </p>
              {revokedShares.map((share) => (
                <div
                  key={share.id}
                  className="rounded-xl border border-dashed p-3 opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Ban className="size-3.5" />
                    <span className="text-sm line-through">
                      {share.label || share.shareUrl}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {t("revoked")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateShareDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        projectId={projectId}
        onCreated={fetchShares}
      />

      <EditShareDialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        share={editTarget}
        onUpdated={fetchShares}
      />
    </>
  );
}

function ShareCard({
  share,
  t,
  onCopy,
  onEdit,
  onRevoke,
}: {
  share: ShareDTO;
  t: ReturnType<typeof useTranslations>;
  onCopy: (url: string) => void;
  onEdit: () => void;
  onRevoke: () => void;
}) {
  const isExpired =
    share.expiresAt && new Date(share.expiresAt) < new Date();

  return (
    <div className="rounded-xl border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Link2 className="size-3.5 shrink-0 text-primary" />
        <span className="text-sm font-medium truncate">
          {share.label || share.shareUrl}
        </span>
        {isExpired && (
          <Badge variant="destructive" className="text-xs">
            Expired
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground truncate">{share.shareUrl}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          {t("created")}: {formatDate(new Date(share.createdAt), "PP")}
        </span>
        <span>
          {t("expires")}:{" "}
          {share.expiresAt
            ? formatDate(new Date(share.expiresAt), "PP")
            : t("noExpiry")}
        </span>
        {share.lastAccessedAt && (
          <span>
            {t("lastAccessed")}:{" "}
            {formatDate(new Date(share.lastAccessedAt), "PP")}
          </span>
        )}
        <span>{t("accessCount", { count: share.accessCount })}</span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg gap-1.5"
          onClick={() => onCopy(share.shareUrl)}
        >
          <Copy className="size-3" />
          {t("copyLink")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg gap-1.5"
          onClick={onEdit}
        >
          <Settings className="size-3" />
          {t("editSettings")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-lg gap-1.5 text-destructive hover:text-destructive"
          onClick={onRevoke}
        >
          <Ban className="size-3" />
          {t("revokeLink")}
        </Button>
      </div>
    </div>
  );
}
