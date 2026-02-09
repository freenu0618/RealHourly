export interface InvoiceData {
  type: "estimate" | "invoice";
  documentNumber: string;
  issueDate: string;
  dueDate?: string;

  from: {
    name: string;
    email: string;
    address?: string;
    bankInfo?: string;
  };

  to: {
    name: string;
    email?: string;
  };

  project: {
    name: string;
    description?: string;
  };

  items: {
    description: string;
    hours: number;
    rate: number;
    amount: number;
  }[];

  costs: {
    description: string;
    amount: number;
  }[];

  subtotal: number;
  totalCosts: number;
  tax: number;
  total: number;

  currency: string;
  locale: string;
  notes?: string;
}
