"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { refineConvexDataProvider } from "@/lib/refineDataProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Sidebar() {
  const pathname = usePathname();
  const nav = [{ href: "/admin/todos", label: "Todos" }] as const;
  return (
    <aside className="flex h-svh w-60 flex-col border-r bg-card">
      <div className="px-4 py-3 text-lg font-semibold">Admin</div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading admin...</div>}>
      <Refine
        routerProvider={routerProvider}
        dataProvider={refineConvexDataProvider}
        resources={[{
          name: "todos",
          list: "/admin/todos",
          create: "/admin/todos/create",
          edit: "/admin/todos/edit/:id",
        }]}
        options={{ syncWithLocation: true, warnWhenUnsavedChanges: false, disableTelemetry: true }}
      >
        <div className="flex">
          <Suspense fallback={<div className="w-60 p-4 text-sm text-muted-foreground">Loading menu...</div>}>
            <Sidebar />
          </Suspense>
          <main className="min-h-svh flex-1 p-6">{children}</main>
        </div>
      </Refine>
    </Suspense>
  );
}
