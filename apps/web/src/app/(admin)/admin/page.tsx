import { redirect } from "next/navigation";
import { ADMIN_RESOURCES } from "@/config/adminResources";

export default function AdminIndexPage() {
  const first = ADMIN_RESOURCES.find((r) => r.enabled);
  if (first) {
    redirect(first.routes.list);
  }
  // If no resources are enabled, keep a simple empty page or redirect elsewhere.
  // You could also return a 404 or a message here.
  return null;
}

