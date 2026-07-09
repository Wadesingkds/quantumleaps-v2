export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin-shell";
import { SettingsContent } from "./settings-content";

export default function SettingsPage() {
  return (
    <AdminShell>
      <SettingsContent />
    </AdminShell>
  );
}
