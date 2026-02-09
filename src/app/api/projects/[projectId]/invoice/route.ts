import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { GenerateInvoiceSchema } from "@/lib/validators/invoice";
import { buildInvoiceData } from "@/lib/pdf/build-invoice-data";
import { createInvoiceDocument } from "@/lib/pdf/InvoiceTemplate";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const body = GenerateInvoiceSchema.parse(await req.json());

    const invoiceData = await buildInvoiceData({
      projectId,
      userId: user.id,
      type: body.type,
      from: body.from,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      notes: body.notes,
      locale: body.locale ?? "en",
    });

    // createInvoiceDocument returns a <Document> element directly
    const document = createInvoiceDocument(invoiceData);
    const buffer = await renderToBuffer(document);

    const prefix = body.type === "estimate" ? "estimate" : "invoice";
    const filename = `${prefix}-${invoiceData.documentNumber}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
