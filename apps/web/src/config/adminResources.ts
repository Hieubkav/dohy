import type { Route } from "next";

export type AdminResource = {
  key: string; // refine resource name
  label: string; // sidebar label
  enabled: boolean;
  href: Route; // main list page href (typed route)
  routes: {
    list: string;
    create?: string;
    edit?: string; // use ":id" placeholder for refine
  };
};

// Central place to toggle admin resources on/off.
// Set enabled: true/false here to show/hide from both Refine and the sidebar.
export const ADMIN_RESOURCES: AdminResource[] = [
  {
    key: "todos",
    label: "Todos",
    enabled: true,
    href: "/admin/todos",
    routes: {
      list: "/admin/todos",
      create: "/admin/todos/create",
      edit: "/admin/todos/edit/:id",
    },
  },
];
