import { db } from "@/drizzle/db";
import { words as wordsTable } from "@/drizzle/schema";
import { like } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import { slug } from "@/lib/slug";

export default async function DictionarySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParamsResolved = await searchParams;
  const q = searchParamsResolved.q || "";
  let results: InferSelectModel<typeof wordsTable>[] = [];
  if (q.length > 0) {
    results = await db
      .select()
      .from(wordsTable)
      .where(like(wordsTable.word, `%${q}%`))
      .limit(20);
  }
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {q.length === 0 ? (
        <div className="text-muted-foreground">Enter a word to search.</div>
      ) : results.length === 0 ? (
        <div className="text-red-500">
          No results found for &quot;{q}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((word) => (
            <Card
              key={word.id}
              className="p-5 flex flex-col gap-2 border shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <Link
                href={`/dictionary/word/${slug(word.word)}`}
                className="text-xl font-semibold text-primary hover:underline"
              >
                {word.word.toUpperCase()}
              </Link>
              {word.definition ? (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {word.definition}
                </p>
              ) : (
                ""
              )}
              <Link
                href={word.url || "#"}
                className="mt-auto text-muted-foreground hover:text-primary transition-colors text-xs"
              >
                View on PSL Website
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic"; // Ensure this page is always dynamic to reflect search results
