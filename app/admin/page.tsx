import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { getSession } from "@/lib/auth";
import { listApplications } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panou staff", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const user = await getSession();
  if (!user) return <AdminLogin />;
  return <AdminDashboard initialApplications={await listApplications()} user={user} />;
}
