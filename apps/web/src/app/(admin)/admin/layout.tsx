"use client";

import type { ReactNode } from "react";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { refineConvexDataProvider } from "@/lib/refineDataProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_RESOURCES } from "@/config/adminResources";

function Sidebar() {
  const pathname = usePathname();
  const nav = ADMIN_RESOURCES.filter((r) => r.enabled).map((r) => ({
    href: r.href,
    label: r.label,
  }));
  return (
    <aside className="flex h-svh w-60 flex-col border-r bg-card">
      <div className="px-4 py-3 text-lg font-semibold">Admin</div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={`rounded px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-3 text-xs text-muted-foreground">Powered by Refine</div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const enabledResources = ADMIN_RESOURCES.filter((r) => r.enabled);
  const refineResources = enabledResources.map((r) => ({
    name: r.key,
    list: r.routes.list,
    create: r.routes.create,
    edit: r.routes.edit,
  }));
  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={refineConvexDataProvider}
      resources={refineResources}
      options={{ syncWithLocation: true, warnWhenUnsavedChanges: false, disableTelemetry: true }}
    >
      <div className="flex">
        <Sidebar />
        <main className="min-h-svh flex-1 p-6">{children}</main>
      </div>
    </Refine>
  );
}
