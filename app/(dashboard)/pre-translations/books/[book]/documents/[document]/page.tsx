import { adminDb } from "@/firebase/admin";
import { DocumentClient } from "./client";

interface Params {
  params: Promise<{ book: string; document: string }>;
}

export default async function DocumentPage({ params }: Params) {
  const paramsResolved = await params;
  const { book, document } = paramsResolved;
  const docSnap = await adminDb
    .collection("books")
    .doc(book)
    .collection("documents")
    .doc(decodeURIComponent(document))
    .get();
  const docData = docSnap.data();

  if (!docData) {
    return <div className="p-8">Document not found.</div>;
  }

  // Sentences array
  const paragraphs = docData.paragraphs || [];

  // Client-side state for current sentence
  // (useState must be used in a client component, so we split rendering)
  return (
    <DocumentClient paragraphs={paragraphs} book={book} document={document} />
  );
}
