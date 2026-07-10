import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = { title: "Admin | Sonic Academy" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") redirect("/student");

  return (
    <AdminShell
      user={{
        name: user.fullName,
        role: user.role as "ADMIN" | "MODERATOR",
        avatar: user.avatar,
        moderator: user.moderator,
      }}
    >
      {children}
    </AdminShell>
  );
}
