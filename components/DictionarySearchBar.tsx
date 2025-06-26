"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function DictionarySearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <form
      className="flex gap-2 mb-4"
      onSubmit={e => {
        e.preventDefault();
        if (q.trim().length > 0) {
          router.push(`/dictionary/search?q=${encodeURIComponent(q)}`);
        }
      }}
    >
      <Input
        type="text"
        placeholder="Search words..."
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <Button type="submit">
        Search
      </Button>
    </form>
  );
}
