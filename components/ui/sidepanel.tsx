"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "./card"

interface SidePanelProps {
  title?: string
  items: { id: number; name: string; href: string }[]
  selectedId?: number
  className?: string
}

export function SidePanel({
  title = "Categories",
  items,
  selectedId,
  className,
}: SidePanelProps) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [items, search]
  )

  // Mobile: show only selected, popup for all
  return (
    <>
      <div className="block md:hidden w-full mb-4">
        <button
          className="w-full px-4 py-2 rounded border bg-card text-primary flex justify-between items-center"
          onClick={() => setOpen(true)}
        >
          {items.find((i) => i.id === selectedId)?.name || title}
          <span className="ml-2">▼</span>
        </button>
        {open && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center"
            onClick={() => setOpen(false)}
          >
            <div
              className="bg-background rounded-lg shadow-lg mt-24 w-11/12 max-w-sm p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{title}</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-xl"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded border px-2 py-1 text-sm mb-2"
              />
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {filteredItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-md px-2 py-2 font-medium transition-colors hover:bg-muted hover:text-primary",
                        selectedId === item.id &&
                          "bg-muted text-primary font-semibold"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {/* Desktop: sticky side panel */}
      <Card className="hidden md:block sticky top-4 z-10 pb-4">
        <CardHeader>
          <div className="flex flex-col space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-primary">
              {title}
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className={cn(
                "w-full rounded border px-2 py-1 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            />
          </div>
        </CardHeader>
        <CardContent className="w-64 h-[calc(100vh-12rem)] overflow-auto overflow-x-hidden">
          <aside className={cn(className)}>
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-1 px-2 py-4">
                {filteredItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-md px-2 py-2 font-medium transition-colors hover:bg-muted hover:text-primary",
                        selectedId === item.id &&
                          "bg-muted text-primary font-semibold"
                      )}
                    >
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </CardContent>
      </Card>
    </>
  )
}
