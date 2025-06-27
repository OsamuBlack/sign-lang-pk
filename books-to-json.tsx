import {config} from "dotenv"

config();
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const adminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

const adminApp = !getApps().length ? initializeApp(adminConfig) : getApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

import fs from "fs/promises";

export default async function BooksToJsonPage() {
  // Fetch all books from Firestore
  const booksSnap = await adminDb.collection("books").get();
  const books: {
    id: string;
    name: string;
    documents: {
      id: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any; // Adjust type as needed
    }[];
  }[] = booksSnap.docs.map((doc) => ({
    id: doc.id,
    name: "",
    ...doc.data(),
    documents: [], // Initialize documents array
  }));

  // Get sub-collection /documents for each book
  for (const book of books) {
    book.documents = [];
    const docsSnap = await adminDb
      .collection("books")
      .doc(book.id)
      .collection("documents")
      .get();
    docsSnap.forEach((doc) => {
      book.documents.push({ id: doc.id, ...doc.data() });
    });
  }

  // Save to json file
  await fs.writeFile("./dataset.json", JSON.stringify(books, null, 2), "utf-8");
  return books;
}

// Call the function if this file is run directly (node books-to-json.tsx)
if (require.main === module) {
  BooksToJsonPage()
    .then((books) => {
      console.log("Books exported to dataset.json", books.length);
    })
    .catch((err) => {
      console.error("Error exporting books:", err);
    });
}
