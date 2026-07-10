import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings = await db.settings.findFirst();
  if (!settings) {
    settings = await db.settings.create({ data: {} });
  }
  return <SettingsForm initialSettings={settings} />;
}
