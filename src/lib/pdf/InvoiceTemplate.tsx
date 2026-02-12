import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { InvoiceData } from "./types";

// Register Noto Sans KR for Korean text support
Font.register({
  family: "NotoSansKR",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-400-normal.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-600-normal.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.ttf",
      fontWeight: 700,
    },
  ],
});

const PRIMARY = "#2B6B93";
const TEXT_DARK = "#1E293B";
const TEXT_MUTED = "#64748B";
const BORDER = "#E2E8F0";
const BG_LIGHT = "#F8FAFC";

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 9,
    color: TEXT_DARK,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: PRIMARY,
  },
  docType: {
    fontSize: 22,
    fontWeight: 700,
    color: TEXT_DARK,
    textAlign: "right",
  },
  docNumber: {
    fontSize: 9,
    color: TEXT_MUTED,
    textAlign: "right",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoCol: {
    width: "48%",
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 10,
    fontWeight: 600,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginBottom: 1,
  },
  projectBox: {
    backgroundColor: BG_LIGHT,
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  projectName: {
    fontSize: 11,
    fontWeight: 600,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  projectDesc: {
    fontSize: 8,
    color: TEXT_MUTED,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PRIMARY,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 600,
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: BG_LIGHT,
  },
  colDesc: { width: "45%" },
  colHours: { width: "15%", textAlign: "right" },
  colRate: { width: "20%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },
  cellText: {
    fontSize: 9,
    color: TEXT_DARK,
  },
  costsSection: {
    marginBottom: 16,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  costLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
  },
  costAmount: {
    fontSize: 9,
    color: TEXT_DARK,
  },
  summaryBox: {
    backgroundColor: BG_LIGHT,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 600,
    color: TEXT_DARK,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: PRIMARY,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: TEXT_DARK,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: PRIMARY,
  },
  notesBox: {
    marginTop: 24,
    padding: 12,
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: TEXT_DARK,
    lineHeight: 1.5,
  },
  dateRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  dateItem: {},
  dateLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 10,
    fontWeight: 600,
    color: TEXT_DARK,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: TEXT_MUTED,
  },
});

function fmtCurrency(amount: number, currency: string): string {
  const map: Record<string, { locale: string; cur: string }> = {
    USD: { locale: "en-US", cur: "USD" },
    KRW: { locale: "ko-KR", cur: "KRW" },
    EUR: { locale: "de-DE", cur: "EUR" },
    GBP: { locale: "en-GB", cur: "GBP" },
    JPY: { locale: "ja-JP", cur: "JPY" },
  };
  const cfg = map[currency] ?? map.USD;
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.cur,
    maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

const LABELS = {
  ko: {
    estimate: "견적서",
    invoice: "인보이스",
    from: "발신자",
    to: "수신자",
    project: "프로젝트",
    description: "항목",
    hours: "시간",
    rate: "단가",
    amount: "금액",
    subtotal: "소계",
    costs: "비용 공제",
    tax: "세금",
    total: "최종 금액",
    issueDate: "발행일",
    dueDate: "마감일",
    notes: "비고",
    generatedBy: "RealHourly로 생성됨",
  },
  en: {
    estimate: "Estimate",
    invoice: "Invoice",
    from: "From",
    to: "To",
    project: "Project",
    description: "Description",
    hours: "Hours",
    rate: "Rate",
    amount: "Amount",
    subtotal: "Subtotal",
    costs: "Cost Deductions",
    tax: "Tax",
    total: "Total",
    issueDate: "Issue Date",
    dueDate: "Due Date",
    notes: "Notes",
    generatedBy: "Generated by RealHourly",
  },
};

export function createInvoiceDocument(data: InvoiceData) {
  return <InvoiceTemplate data={data} />;
}

function InvoiceTemplate({ data }: { data: InvoiceData }) {
  const lang = data.locale === "ko" ? "ko" : "en";
  const l = LABELS[lang];
  const fmt = (n: number) => fmtCurrency(n, data.currency);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>RealHourly</Text>
          <View>
            <Text style={styles.docType}>
              {data.type === "estimate" ? l.estimate : l.invoice}
            </Text>
            <Text style={styles.docNumber}>{data.documentNumber}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>{l.issueDate}</Text>
            <Text style={styles.dateValue}>{data.issueDate}</Text>
          </View>
          {data.dueDate && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>{l.dueDate}</Text>
              <Text style={styles.dateValue}>{data.dueDate}</Text>
            </View>
          )}
        </View>

        {/* From / To */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>{l.from}</Text>
            <Text style={styles.infoText}>{data.from.name}</Text>
            <Text style={styles.infoSubtext}>{data.from.email}</Text>
            {data.from.address && (
              <Text style={styles.infoSubtext}>{data.from.address}</Text>
            )}
            {data.from.bankInfo && (
              <Text style={styles.infoSubtext}>{data.from.bankInfo}</Text>
            )}
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>{l.to}</Text>
            <Text style={styles.infoText}>{data.to.name}</Text>
            {data.to.email && (
              <Text style={styles.infoSubtext}>{data.to.email}</Text>
            )}
          </View>
        </View>

        {/* Project */}
        <View style={styles.projectBox}>
          <Text style={styles.projectName}>{data.project.name}</Text>
          {data.project.description && (
            <Text style={styles.projectDesc}>{data.project.description}</Text>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>
              {l.description}
            </Text>
            <Text style={[styles.tableHeaderText, styles.colHours]}>
              {l.hours}
            </Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>
              {l.rate}
            </Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>
              {l.amount}
            </Text>
          </View>
          {data.items.map((item, i) => (
            <View
              key={i}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.cellText, styles.colDesc]}>
                {item.description}
              </Text>
              <Text style={[styles.cellText, styles.colHours]}>
                {item.hours}h
              </Text>
              <Text style={[styles.cellText, styles.colRate]}>
                {fmt(item.rate)}
              </Text>
              <Text style={[styles.cellText, styles.colAmount]}>
                {fmt(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Costs */}
        {data.costs.length > 0 && (
          <View style={styles.costsSection}>
            <Text
              style={[styles.infoLabel, { marginBottom: 4, paddingLeft: 8 }]}
            >
              {l.costs}
            </Text>
            {data.costs.map((cost, i) => (
              <View key={i} style={styles.costRow}>
                <Text style={styles.costLabel}>{cost.description}</Text>
                <Text style={styles.costAmount}>-{fmt(cost.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{l.subtotal}</Text>
            <Text style={styles.summaryValue}>{fmt(data.subtotal)}</Text>
          </View>
          {data.totalCosts > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{l.costs}</Text>
              <Text style={styles.summaryValue}>-{fmt(data.totalCosts)}</Text>
            </View>
          )}
          {data.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{l.tax}</Text>
              <Text style={styles.summaryValue}>-{fmt(data.tax)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{l.total}</Text>
            <Text style={styles.totalValue}>{fmt(data.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>{l.notes}</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>{l.generatedBy}</Text>
      </Page>
    </Document>
  );
}
