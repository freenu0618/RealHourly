"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl font-bold mb-2">Offline</h1>
        <p className="text-muted-foreground mb-6">
          Internet connection is not available.
          <br />
          Please check your connection and try again.
        </p>
        <button
          className="px-6 py-3 rounded-lg bg-[#2B6B93] text-white font-medium hover:bg-[#1f5577] transition-colors"
          onClick={() => typeof window !== "undefined" && window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
