export interface ProjectSummary {
  id: string;
  name: string;
  currency: string;
  isActive: boolean;
  progressPercent: number;
  expectedFee: number;
  expectedHours: number;
  platformFeeRate: number;
  taxRate: number;
  totalMinutes: number;
  fixedCosts: number;
}

export interface RecentEntry {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  minutes: number;
  category: string;
  taskDescription: string;
}

export interface ActiveAlert {
  id: string;
  projectId: string;
  projectName: string;
  alertType: string;
  metadata: Record<string, unknown>;
}

export interface DashboardData {
  projects: ProjectSummary[];
  recentEntries: RecentEntry[];
  activeAlerts: ActiveAlert[];
  weeklyMinutes: { date: string; minutes: number }[];
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalNet: number;
  totalCost: number;
  totalHours: number;
  avgRealRate: number | null;
  currency: string;
}

import { getDominantCurrency } from "@/lib/money/currency";

export function computeMetrics(projects: ProjectSummary[]): DashboardMetrics {
  let totalRevenue = 0;
  let totalNet = 0;
  let totalCost = 0;
  let totalMinutes = 0;

  for (const p of projects) {
    const gross = p.expectedFee;
    const platformFee = gross * p.platformFeeRate;
    const tax = gross * p.taxRate;
    const directCost = p.fixedCosts + platformFee + tax;
    const net = gross - directCost;

    totalRevenue += gross;
    totalNet += net;
    totalCost += directCost;
    totalMinutes += p.totalMinutes;
  }

  const totalHours = totalMinutes / 60;

  return {
    totalRevenue,
    totalNet,
    totalCost,
    totalHours: Math.round(totalHours * 10) / 10,
    avgRealRate: totalHours > 0 ? Math.round((totalNet / totalHours) * 100) / 100 : null,
    currency: getDominantCurrency(projects),
  };
}
