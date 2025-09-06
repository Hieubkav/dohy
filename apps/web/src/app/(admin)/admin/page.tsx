"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

type Status = "all" | "active" | "completed";

export default function AdminTodosPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const args = useMemo(
    () => ({ search: search || undefined, status, offset: (page - 1) * pageSize, limit: pageSize }),
    [search, status, page]
  );

  const data = useQuery(api.todos.list, args);
  const createTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggle);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const updateText = useMutation(api.todos.updateText);

  const [newText, setNewText] = useState("");

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function onAdd() {
    const text = newText.trim();
    if (!text) return;
    await createTodo({ text });
    setNewText("");
    toast.success("Todo created");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Todos</h1>
        <div className="flex gap-2">
          <Input
            placeholder="New todo text..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            className="w-64"
          />
          <Button onClick={onAdd}>
            <Plus className="size-4 mr-1.5" /> Add
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search todos..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-8 w-64"
            />
          </div>
          <div className="ml-auto flex gap-2">
            {(["all", "active", "completed"] as const).map((s) => (
              <Button
                key={s}
                variant={status === s ? "default" : "secondary"}
                onClick={() => {
                  setPage(1);
                  setStatus(s);
                }}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-2 text-left font-medium">Done</th>
                <th className="py-2 px-2 text-left font-medium">Text</th>
                <th className="py-2 px-2 text-left font-medium">Created</th>
                <th className="py-2 pl-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((todo) => (
                <TodoRow
                  key={todo._id}
                  todo={todo}
                  onToggle={async (v) => {
                    await toggleTodo({ id: todo._id, completed: v });
                  }}
                  onDelete={async () => {
                    await deleteTodo({ id: todo._id });
                    toast.success("Todo deleted");
                  }}
                  onUpdate={async (text) => {
                    await updateText({ id: todo._id, text });
                    toast.success("Todo updated");
                  }}
                />
              ))}
              {data === undefined && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              )}
              {data && data.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No todos found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {total > 0
              ? `Showing ${args.offset + 1}–${Math.min(args.offset + pageSize, total)} of ${total}`
              : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <div className="text-sm tabular-nums">
              Page {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TodoRow({
  todo,
  onToggle,
  onDelete,
  onUpdate,
}: {
  todo: { _id: any; text: string; completed: boolean; _creationTime: number };
  onToggle: (completed: boolean) => Promise<void>;
  onDelete: () => Promise<void>;
  onUpdate: (text: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const [saving, setSaving] = useState(false);

  async function save() {
    const next = text.trim();
    if (!next || next === todo.text) {
      setEditing(false);
      setText(todo.text);
      return;
    }
    setSaving(true);
    try {
      await onUpdate(next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-2 align-middle">
        <Checkbox checked={todo.completed} onCheckedChange={(v) => onToggle(Boolean(v))} />
      </td>
      <td className="py-2 px-2 align-middle">
        {editing ? (
          <Input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setEditing(false);
                setText(todo.text);
              }
            }}
            className="max-w-xl"
          />
        ) : (
          <span className={todo.completed ? "line-through text-muted-foreground" : undefined}>{todo.text}</span>
        )}
      </td>
      <td className="py-2 px-2 align-middle text-muted-foreground">
        {new Date(todo._creationTime).toLocaleString()}
      </td>
      <td className="py-2 pl-2 align-middle text-right">
        {editing ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setEditing(false); setText(todo.text); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              Save
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil className="size-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete()} className="text-red-600">
                <Trash2 className="size-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  );
}

