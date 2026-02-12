import { setRequestLocale } from "next-intl/server";
import { ClientsListClient } from "@/components/clients/ClientsListClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ClientsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ClientsListClient />;
}
