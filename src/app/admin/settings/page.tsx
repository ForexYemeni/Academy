import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings = await db.settings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await db.settings.create({ data: { id: "singleton" } });
  }
  return <SettingsForm initialSettings={settings} />;
}
