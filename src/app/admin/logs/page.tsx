export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin-shell";
import { LogsContent } from "./logs-content";

export default function LogsPage() {
  return (
    <AdminShell>
      <LogsContent />
    </AdminShell>
  );
}
