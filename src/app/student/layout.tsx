import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/student/student-shell";

export const metadata = { title: "Student | Sonic Academy" };

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");
  if (user.role === "ADMIN" || user.role === "MODERATOR") redirect("/admin");

  return (
    <StudentShell
      user={{
        id: user.id,
        name: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        referralCode: user.referralCode,
        referralRewards: user.referralRewards,
        preferredLang: user.preferredLang,
      }}
    >
      {children}
    </StudentShell>
  );
}
