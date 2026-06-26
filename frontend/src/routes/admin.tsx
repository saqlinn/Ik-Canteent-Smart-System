import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/ik/AdminShell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}