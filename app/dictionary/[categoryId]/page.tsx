import { db } from "@/drizzle/db";
import { categories, words } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { slug, unslug } from "@/lib/slug";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const paramsResolved = await params;
  const catId = paramsResolved.categoryId;
  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, catId));
  const selectedCat = cats[0];
  if (!selectedCat) return notFound();
  const wordList = await db
    .select()
    .from(words)
    .where(eq(words.categoryId, selectedCat.id));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">{unslug(selectedCat.name)}</h2>
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
    </div>
  );
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) => {
  const paramsResolved = await params;
  const catId = paramsResolved.categoryId;

  return {
    title: unslug(catId) + " - PSL Dictionary",
  };
};

export async function generateStaticParams() {
  // Fetch all category IDs for static generation
  const allCategories = await db.select().from(categories);
  return allCategories.map((cat) => ({ categoryId: slug(cat.name) }));
}
