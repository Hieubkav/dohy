"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditTodoPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) as Id<"todos">;

  const record = useQuery(api.todos.getById, { id });
  const updateText = useMutation(api.todos.updateText);
  const toggle = useMutation(api.todos.toggle);

  const [text, setText] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (record) {
      setText(record.text);
      setCompleted(record.completed);
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    await updateText({ id, text: value });
    await toggle({ id, completed });
    router.push("/admin/todos");
  };

  if (record === undefined) return null;
  if (record === null) return <div>Not found</div>;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Edit Todo</CardTitle>
        <CardDescription>Chỉnh sửa todo</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="text">Text</Label>
            <Input id="text" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="completed" type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
            <Label htmlFor="completed">Completed</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!text.trim()}>Save</Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/admin/todos")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

