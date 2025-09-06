import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideListTodo, PanelsTopLeft } from "lucide-react";

const nav = [
  { href: "/admin", label: "Todos", icon: LucideListTodo },
] as const;

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh">
      <aside className="w-64 border-r bg-sidebar text-sidebar-foreground">
        <div className="h-14 flex items-center gap-2 px-4 border-b">
          <PanelsTopLeft className="size-5" />
          <span className="font-semibold">Admin</span>
        </div>
        <nav className="px-2 py-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
