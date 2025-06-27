import { adminDb } from "@/firebase/admin";
import { unslug } from "@/lib/slug";
import Link from "next/link";

interface Params {
  params: Promise<{ book: string }>;
}

export default async function BookDocumentsPage({ params }: Params) {
  // Resolve the parameters
  const paramsResolved = await params;
  const { book } = paramsResolved;

  // Fetch all documents for this book
  const docsSnap = await adminDb
    .collection("books")
    .doc(book)
    .collection("documents")
    .get();
  const documents: {
    [key: string]: string;
  }[] = docsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="max-w-2xl w-full mx-auto py-8 text-left">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">Documents</h1>
      <ul className="space-y-4">
        {documents.map((doc) => (
          <li key={doc.id} className="">
            <Link
              href={`/pre-translations/books/${book}/documents/${doc.id}`}
              className="block p-4 rounded shadow hover:bg-gray-50 border text-left transition-colors duration-150"
            >
              <span className="font-medium text-lg">{unslug(doc.id)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link
          href="/pre-translations/books"
          className="text-blue-600 hover:underline"
        >
          ← Back to Books
        </Link>
      </div>
    </div>
  );
}
