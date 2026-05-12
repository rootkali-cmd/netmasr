import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

export default async function ControlPanelPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/control-panel/dashboard");
  }
  redirect("/control-panel/login");
}
