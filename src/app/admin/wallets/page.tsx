import { db } from "@/lib/db";
import { WalletsManager } from "@/components/admin/wallets-manager";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminWalletsPage() {
  await requireAdmin();
  const wallets = await db.wallet.findMany();
  return <WalletsManager wallets={wallets} />;
}
