export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin-shell";
import { FlagsContent } from "./flags-content";

export default function FlagsPage() {
  return (
    <AdminShell>
      <FlagsContent />
    </AdminShell>
  );
}
