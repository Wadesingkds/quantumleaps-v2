"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold">Terjadi kesalahan</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Halaman gagal dimuat. Coba lagi atau kembali ke dashboard.
        </p>
        <div className="flex justify-center gap-2">
          <Button onClick={reset} size="sm">
            Coba Lagi
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/dashboard")}>
            Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
