import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign Up | Sonic Academy" };

export default async function RegisterPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(user.role === "STUDENT" ? "/student" : "/admin");

  return <AuthForm mode="register" />;
}
