import type { Metadata } from "next";
import { OfflineClient } from "./OfflineClient";

export const metadata: Metadata = {
  title: "Offline | RealHourly",
  robots: { index: false, follow: false, noarchive: true },
};

export default function OfflinePage() {
  return <OfflineClient />;
}
