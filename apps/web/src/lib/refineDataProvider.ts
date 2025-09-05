import type { DataProvider } from "@refinedev/core";
import { ConvexReactClient } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type TodoRecord = {
  _id: Id<"todos">;
  _creationTime: number;
  text: string;
  completed: boolean;
};

const mapTodo = (t: TodoRecord) => ({
  id: t._id,
  _id: t._id,
  _creationTime: t._creationTime,
  text: t.text,
  completed: t.completed,
});

export const refineConvexDataProvider: DataProvider = {
  // Minimal data provider for `todos`. Extend as needed.
  getList: async ({ resource }) => {
    if (resource !== "todos") throw new Error("Unsupported resource");
    const data = (await convex.query(api.todos.getAll, {})) as TodoRecord[];
    const mapped = data.map(mapTodo);
    return {
      data: mapped as any,
      total: mapped.length,
    } as any;
  },

  getOne: async ({ resource, id }) => {
    if (resource !== "todos") throw new Error("Unsupported resource");
    // No direct getOne in backend; fallback to list and find
    const all = (await convex.query(api.todos.getAll, {})) as TodoRecord[];
    const item = all.find((t) => String(t._id) === String(id));
    if (!item) throw new Error("Not found");
    return { data: mapTodo(item) as any } as any;
  },

  create: async ({ resource, variables }) => {
    if (resource !== "todos") throw new Error("Unsupported resource");
    const created = (await convex.mutation(api.todos.create, {
      text: (variables as any).text,
    })) as TodoRecord;
    return { data: mapTodo(created) as any } as any;
  },

  update: async ({ resource, id, variables }) => {
    if (resource !== "todos") throw new Error("Unsupported resource");
    // Only supports toggling `completed` for KISS
    const completed = (variables as any).completed as boolean | undefined;
    if (typeof completed === "boolean") {
      await convex.mutation(api.todos.toggle, {
        id: id as Id<"todos">,
        completed,
      });
      return { data: { id, ...(variables as any) } as any } as any;
    }
    const text = (variables as any).text as string | undefined;
    if (typeof text === "string") {
      await convex.mutation(api.todos.updateText, {
        id: id as Id<"todos">,
        text,
      });
      return { data: { id, ...(variables as any) } as any } as any;
    }
    throw new Error("Update not supported for provided fields");
  },

  deleteOne: async ({ resource, id }) => {
    if (resource !== "todos") throw new Error("Unsupported resource");
    await convex.mutation(api.todos.deleteTodo, { id: id as Id<"todos"> });
    return { data: { id } as any } as any;
  },

  // Unused methods can throw to keep it minimal (KISS)
  getMany: async () => {
    throw new Error("getMany not implemented");
  },
  createMany: async () => {
    throw new Error("createMany not implemented");
  },
  updateMany: async () => {
    throw new Error("updateMany not implemented");
  },
  deleteMany: async () => {
    throw new Error("deleteMany not implemented");
  },
  getApiUrl: () => {
    return "/";
  },
  custom: async () => {
    throw new Error("custom not implemented");
  },
};
