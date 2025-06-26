import { db } from "@/drizzle/db";
import { categories } from "@/drizzle/schema";
import { SidePanel } from "@/components/ui/sidepanel";
import { DictionarySearchBar } from "@/components/DictionarySearchBar";
import React from "react";
import { slug } from "@/lib/slug";
// import {unstable_cache as cache} from "next/cache"

export default async function DictionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cats = await db.select().from(categories);

  const items = cats.map((cat) => ({
    id: cat.id,
    name: cat.name,
    href: `/dictionary/${slug(cat.name)}`,
  }));

  // Try to extract selectedId from the current path
  let selectedId: number | undefined = undefined;
  if (typeof window !== "undefined") {
    const match = window.location.pathname.match(/\/dictionary\/(\d+)/);
    if (match) selectedId = Number(match[1]);
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen items-start relative">
      <SidePanel items={items} selectedId={selectedId} />
      <main className="flex-1 p-4 bg-background">
        <DictionarySearchBar />
        {children}
      </main>
    </div>
  );
}
