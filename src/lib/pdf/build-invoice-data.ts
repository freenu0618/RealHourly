import { getProjectById } from "@/db/queries/projects";
import { getTimeEntriesByProject } from "@/db/queries/time-entries";
import { getCostEntriesByProject } from "@/db/queries/cost-entries";
import { getClientsByUserId } from "@/db/queries/clients";
import { ApiError } from "@/lib/api/errors";
import type { InvoiceData } from "./types";

interface BuildInvoiceInput {
  projectId: string;
  userId: string;
  type: "estimate" | "invoice";
  from: {
    name: string;
    email: string;
    address?: string;
    bankInfo?: string;
  };
  issueDate: string;
  dueDate?: string;
  notes?: string;
  locale: string;
  itemDescriptions?: Record<string, string>;
}

const CATEGORY_LABELS_KO: Record<string, string> = {
  planning: "기획",
  design: "디자인",
  development: "개발",
  meeting: "미팅",
  revision: "수정",
  admin: "관리",
  email: "이메일",
  research: "리서치",
  other: "기타",
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  planning: "Planning",
  design: "Design",
  development: "Development",
  meeting: "Meeting",
  revision: "Revision",
  admin: "Admin",
  email: "Email",
  research: "Research",
  other: "Other",
};

export async function buildInvoiceData(
  input: BuildInvoiceInput,
): Promise<InvoiceData> {
  const project = await getProjectById(input.projectId, input.userId);
  if (!project) throw new ApiError("NOT_FOUND", 404, "Project not found");

  const [timeEntries, costEntries, allClients] = await Promise.all([
    getTimeEntriesByProject(input.projectId, { intent: "done" }),
    getCostEntriesByProject(input.projectId),
    getClientsByUserId(input.userId),
  ]);

  // Find client name
  const client = project.clientId
    ? allClients.find((c) => c.id === project.clientId)
    : null;

  // Group time entries by category
  const categoryMap = new Map<string, number>();
  for (const entry of timeEntries) {
    const existing = categoryMap.get(entry.category) ?? 0;
    categoryMap.set(entry.category, existing + entry.minutes);
  }

  // Calculate rate (nominal hourly or derived from expected fee/hours)
  const gross = project.expectedFee ?? 0;
  const nominalHourly =
    (project.expectedHours ?? 0) > 0
      ? gross / project.expectedHours!
      : 0;

  const catLabels =
    input.locale === "ko" ? CATEGORY_LABELS_KO : CATEGORY_LABELS_EN;

  // Build line items from category groups
  const items: InvoiceData["items"] = [];
  for (const [category, minutes] of categoryMap.entries()) {
    const hours = Math.round((minutes / 60) * 10) / 10;
    const amount = Math.round(hours * nominalHourly * 100) / 100;
    const label = catLabels[category] ?? category;
    const customDesc = input.itemDescriptions?.[category];
    items.push({
      description: customDesc ?? label,
      hours,
      rate: nominalHourly,
      amount,
    });
  }

  // Sort by amount descending
  items.sort((a, b) => b.amount - a.amount);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  // Build cost deductions
  const platformFeeRate = project.platformFeeRate ?? 0;
  const taxRate = project.taxRate ?? 0;
  const platformFeeAmount = Math.round(gross * platformFeeRate * 100) / 100;
  const taxAmount = Math.round(gross * taxRate * 100) / 100;

  const costs: InvoiceData["costs"] = [];
  if (platformFeeAmount > 0) {
    costs.push({
      description:
        input.locale === "ko"
          ? `플랫폼 수수료 (${Math.round(platformFeeRate * 100)}%)`
          : `Platform Fee (${Math.round(platformFeeRate * 100)}%)`,
      amount: platformFeeAmount,
    });
  }

  // Fixed cost entries
  for (const ce of costEntries) {
    costs.push({
      description: ce.notes ?? ce.costType,
      amount: Number(ce.amount),
    });
  }

  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
  const total = subtotal - totalCosts - taxAmount;

  // Generate document number
  const now = new Date();
  const prefix = input.type === "estimate" ? "EST" : "INV";
  const seq = String(now.getTime()).slice(-4);
  const documentNumber = `${prefix}-${now.getFullYear()}-${seq}`;

  return {
    type: input.type,
    documentNumber,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    from: input.from,
    to: {
      name: client?.name ?? (input.locale === "ko" ? "클라이언트" : "Client"),
    },
    project: {
      name: project.name,
    },
    items,
    costs,
    subtotal,
    totalCosts,
    tax: taxAmount,
    total,
    currency: project.currency,
    locale: input.locale,
    notes: input.notes,
  };
}
