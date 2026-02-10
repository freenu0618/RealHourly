"use client";

import React from "react";
import { CheckCircle2, Circle, Pause, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/**
 * ProjectStatusDropdown
 *
 * @description 프로젝트 상태를 변경하는 드롭다운 컴포넌트
 * 완료 상태 선택 시 외부 다이얼로그를 통한 확인 프로세스 실행
 *
 * @example
 * <ProjectStatusDropdown
 *   projectId="uuid"
 *   currentStatus="active"
 *   isEditable={true}
 *   onStatusChanged={(status) => refreshData()}
 *   onCompleteRequest={() => setShowCompleteDialog(true)}
 * />
 */

interface ProjectStatusDropdownProps {
  projectId: string;
  currentStatus: string;
  isEditable: boolean;
  onStatusChanged: (newStatus: string) => void;
  onCompleteRequest: () => void;
}

export function ProjectStatusDropdown({
  projectId,
  currentStatus,
  isEditable,
  onStatusChanged,
  onCompleteRequest,
}: ProjectStatusDropdownProps) {
  const t = useTranslations("projects");

  const statusConfig = {
    active: { icon: Circle, label: t("statusActive"), color: "text-green-600" },
    completed: { icon: CheckCircle2, label: t("statusCompleted"), color: "text-blue-600" },
    paused: { icon: Pause, label: t("statusPaused"), color: "text-amber-600" },
    cancelled: { icon: X, label: t("statusCancelled"), color: "text-red-600" },
  };

  const currentConfig = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.active;
  const CurrentIcon = currentConfig.icon;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === "completed") {
      onCompleteRequest();
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to update status");
      }

      toast.success(t("statusUpdateSuccess"));
      onStatusChanged(newStatus);
    } catch (error) {
      toast.error(t("statusUpdateError"));
      console.error("Status update error:", error);
    }
  };

  if (!isEditable) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
          <CurrentIcon className={`h-4 w-4 ${currentConfig.color}`} />
          <span>{currentConfig.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={status === currentStatus}
              className="gap-2 cursor-pointer"
            >
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span>{config.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
