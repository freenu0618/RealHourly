export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-ghibli-cream to-ghibli-warm p-4 selection:bg-primary/30 selection:text-primary dark:from-background dark:to-background">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/40 opacity-60 blur-3xl dark:bg-white/5" />
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-[#ffe4c4]/30 opacity-50 blur-3xl dark:bg-[#ffe4c4]/5" />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
