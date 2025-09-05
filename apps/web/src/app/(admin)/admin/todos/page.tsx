"use client";
export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Row = {
  _id: Id<"todos">;
  _creationTime: number;
  text: string;
  completed: boolean;
};

const columns = [
  { key: "text", label: "Text" },
  { key: "completed", label: "Done" },
  { key: "_creationTime", label: "Created" },
] as const;

type ColKey = (typeof columns)[number]["key"];

export default function AdminTodosPage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<ColKey>("_creationTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [visible, setVisible] = useState<Record<ColKey, boolean>>({
    text: true,
    completed: true,
    _creationTime: true,
  });

  const todos = useQuery(api.todos.getAll);
  const toggleTodo = useMutation(api.todos.toggle);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  const handleToggle = (id: Id<"todos">, completed: boolean) => {
    toggleTodo({ id, completed: !completed });
  };

  const handleDelete = (id: Id<"todos">) => {
    deleteTodo({ id });
  };

  const data = useMemo(() => {
    if (!Array.isArray(todos)) return [] as Row[];
    let rows = todos as Row[];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) => r.text.toLowerCase().includes(q));
    }
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const ak = a[sortKey];
      const bk = b[sortKey];
      if (typeof ak === "string" && typeof bk === "string")
        return ak.localeCompare(bk) * dir;
      if (typeof ak === "boolean" && typeof bk === "boolean")
        return (Number(ak) - Number(bk)) * dir;
      return ((ak as number) - (bk as number)) * dir;
    });
    return rows;
  }, [todos, search, sortKey, sortDir]);

  const toggleSort = (key: ColKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleString();

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>Todos</CardTitle>
        <CardDescription>CRUD • Search • Sort • Columns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 ml-auto">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-56"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Cột hiển thị</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {columns.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key}
                    checked={visible[c.key]}
                    onCheckedChange={(v) =>
                      setVisible((s) => ({ ...s, [c.key]: Boolean(v) }))
                    }
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild>
              <Link href="/admin/todos/create">New</Link>
            </Button>
          </div>
        </div>

        {todos === undefined ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Không có dữ liệu.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  {visible.text && (
                    <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort("text")}>
                      Text {sortKey === "text" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                  )}
                  {visible.completed && (
                    <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort("completed")}>
                      Done {sortKey === "completed" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                  )}
                  {visible._creationTime && (
                    <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort("_creationTime")}>
                      Created {sortKey === "_creationTime" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                  )}
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row._id} className="border-b">
                    {visible.text && (
                      <td className="px-3 py-2">
                        <span className={row.completed ? "line-through text-muted-foreground" : ""}>
                          {row.text}
                        </span>
                      </td>
                    )}
                    {visible.completed && (
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={row.completed}
                            onCheckedChange={() => handleToggle(row._id, row.completed)}
                            id={`todo-${row._id}`}
                          />
                        </div>
                      </td>
                    )}
                    {visible._creationTime && (
                      <td className="px-3 py-2 text-muted-foreground">{fmtDate(row._creationTime)}</td>
                    )}
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/todos/edit/${row._id}`}>Edit</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(row._id)}
                          aria-label="Xóa todo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
