import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const worker = await getSession()

  if (!worker) {
    redirect("/login")
  }

  if (worker.role !== "admin" && worker.role !== "super_admin") {
    redirect("/worker")
  }

  return <AdminDashboard admin={worker} />
}
