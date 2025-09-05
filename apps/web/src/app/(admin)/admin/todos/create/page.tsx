"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateTodoPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const create = useMutation(api.todos.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    await create({ text: value });
    router.push("/admin/todos");
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New Todo</CardTitle>
        <CardDescription>Tạo mới một todo</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="text">Text</Label>
            <Input id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nội dung..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!text.trim()}>Create</Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/admin/todos")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
