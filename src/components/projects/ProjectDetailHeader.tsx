"use client";

import React from "react";
import { Pencil, Trash2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProjectStatusDropdown } from "./ProjectStatusDropdown";

/**
 * ProjectDetailHeader
 *
 * @description 프로젝트 상세 페이지 헤더 컴포넌트
 * 프로젝트명, 상태 드롭다운, 액션 버튼들(편집, 삭제, 견적서, 청구서) 표시
 *
 * @example
 * <ProjectDetailHeader
 *   projectId="uuid"
 *   projectName="Website Redesign"
 *   status="active"
 *   isEditable={true}
 *   onStatusChanged={() => refresh()}
 *   onCompleteRequest={() => setShowCompleteDialog(true)}
 *   onEditRequest={() => setShowEditDialog(true)}
 *   onDeleteRequest={() => setShowDeleteDialog(true)}
 *   onInvoiceRequest={(type) => handleInvoice(type)}
 * />
 */

interface ProjectDetailHeaderProps {
  projectId: string;
  projectName: string;
  status: string;
  isEditable: boolean;
  onStatusChanged: (newStatus: string) => void;
  onCompleteRequest: () => void;
  onEditRequest: () => void;
  onDeleteRequest: () => void;
  onInvoiceRequest: (type: "estimate" | "invoice") => void;
}

export function ProjectDetailHeader({
  projectId,
  projectName,
  status,
  isEditable,
  onStatusChanged,
  onCompleteRequest,
  onEditRequest,
  onDeleteRequest,
  onInvoiceRequest,
}: ProjectDetailHeaderProps) {
  const t = useTranslations("projects");

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{projectName}</h1>
          <ProjectStatusDropdown
            projectId={projectId}
            currentStatus={status}
            isEditable={isEditable}
            onStatusChanged={onStatusChanged}
            onCompleteRequest={onCompleteRequest}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isEditable && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditRequest}
              className="gap-1.5 rounded-xl text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("editProject")}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteRequest}
            className="gap-1.5 rounded-xl text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("deleteProject")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onInvoiceRequest("estimate")}
            className="gap-1.5 rounded-xl text-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            {t("generateEstimate")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onInvoiceRequest("invoice")}
            className="gap-1.5 rounded-xl text-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            {t("generateInvoice")}
          </Button>
        </div>
      </div>
    </div>
  );
}
