import Image from "next/image";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted p-4 selection:bg-primary/30 selection:text-primary dark:from-background dark:to-background">
      {/* Navigation bar */}
      <nav className="fixed top-0 z-50 flex h-14 w-full items-center px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/images/logo.png" alt="RealHourly" width={28} height={28} className="rounded-lg" />
          <span className="text-lg font-bold">RealHourly</span>
        </Link>
      </nav>
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/40 opacity-60 blur-3xl dark:bg-white/5" />
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-blue-200/20 opacity-50 blur-3xl dark:bg-blue-400/5" />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
