import { adminDb } from "@/firebase/admin";
import Link from "next/link";

export default async function BooksPage() {
  // Fetch all books from Firestore
  const booksSnap = await adminDb.collection("books").get();
  const books = booksSnap.docs.map(
    (doc) =>
      ({ id: doc.id, ...doc.data() } as {
        id: string;
        name: string;
        description?: string;
        author?: string;
        publishedDate?: string;
        coverImageUrl?: string;
      })
  );

  return (
    <div className="max-w-2xl w-full mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Books</h1>
      <ul className="space-y-4">
        {books.map((book) => (
          <li key={book.id}>
            <Link
              href={`/pre-translations/books/${book.id}`}
              className="block p-4 rounded shadow hover:bg-gray-50 border"
            >
              {book.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
