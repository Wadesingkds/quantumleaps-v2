export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin-shell";
import { UsersContent } from "./users-content";

export default function UsersPage() {
  return (
    <AdminShell>
      <UsersContent />
    </AdminShell>
  );
}
