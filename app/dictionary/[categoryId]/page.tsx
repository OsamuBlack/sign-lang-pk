import { db } from "@/drizzle/db";
import { categories, words } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: { categoryId: string };
}) {
  const catId = Number(params.categoryId);
  const cats = await db.select().from(categories);
  const selectedCat = cats.find((c) => c.id === catId);
  if (!selectedCat) return notFound();
  const wordList = await db
    .select()
    .from(words)
    .where(eq(words.categoryId, catId));

  // Get next/recommended words (other words in the same category, excluding the current one)
  const recommended = wordList.slice(0, 6); // Show up to 6 recommendations

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {selectedCat.name.charAt(0).toUpperCase() + selectedCat.name.slice(1)}{" "}
          Words
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wordList.map((word) => (
            <Card
              key={word.id}
              className="p-5 flex flex-col gap-2 border shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <Link
                href={`/dictionary/word/${word.id}`}
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
                className="mt-auto text-muted-foreground 
                hover:text-primary transition-colors text-xs"
              >
                View on PSL Website
              </Link>
            </Card>
          ))}
        </div>
      </div>
      {recommended.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-2 text-primary">Next Videos</h3>
          <div className="flex flex-wrap gap-4">
            {recommended.map((word) => (
              <Link
                key={word.id}
                href={`/dictionary/word/${word.id}`}
                className="bg-muted rounded-lg px-4 py-2 shadow hover:bg-accent transition-colors text-primary font-medium"
              >
                {word.word.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
