type Row = Record<string, unknown>;

function toISOString(val: unknown): string | null {
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "string") return val;
  return null;
}

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

export function clientToDTO(row: Row) {
  return {
    id: row.id as string,
    userId: row.userId as string,
    name: row.name as string,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

export function projectToDTO(row: Row) {
  return {
    id: row.id as string,
    userId: row.userId as string,
    clientId: (row.clientId as string) ?? null,
    name: row.name as string,
    aliases: (row.aliases as string[]) ?? [],
    startDate: (row.startDate as string) ?? null,
    expectedHours: toNumber(row.expectedHours),
    expectedFee: toNumber(row.expectedFee),
    currency: row.currency as string,
    platformFeeRate: toNumber(row.platformFeeRate),
    taxRate: toNumber(row.taxRate),
    progressPercent: row.progressPercent as number,
    isActive: row.isActive as boolean,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

export function timeEntryToDTO(row: Row) {
  return {
    id: row.id as string,
    projectId: row.projectId as string,
    date: row.date as string,
    minutes: row.minutes as number,
    category: row.category as string,
    intent: row.intent as string,
    taskDescription: row.taskDescription as string,
    sourceText: (row.sourceText as string) ?? null,
    issues: (row.issues as string[]) ?? [],
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

export function costEntryToDTO(row: Row) {
  return {
    id: row.id as string,
    projectId: row.projectId as string,
    date: (row.date as string) ?? null,
    amount: toNumber(row.amount),
    costType: row.costType as string,
    notes: (row.notes as string) ?? null,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

export function alertToDTO(row: Row) {
  return {
    id: row.id as string,
    projectId: row.projectId as string,
    alertType: row.alertType as string,
    triggeredAt: toISOString(row.triggeredAt),
    dismissedAt: toISOString(row.dismissedAt),
    metadata: row.metadata as Record<string, unknown>,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

export function generatedMessageToDTO(row: Row) {
  return {
    id: row.id as string,
    alertId: row.alertId as string,
    tone: row.tone as string,
    subject: row.subject as string,
    body: row.body as string,
    copiedAt: toISOString(row.copiedAt),
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}
