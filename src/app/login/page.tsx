import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Login | Sonic Academy" };

export default async function LoginPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(user.role === "STUDENT" ? "/student" : "/admin");

  return <AuthForm mode="login" />;
}
