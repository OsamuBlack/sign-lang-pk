"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function UploadPage() {
  type Book = { id: string; name: string };
  const [text, setText] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [docName, setDocName] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [newBookName, setNewBookName] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => setBooks(data));
  }, [showBookDialog]);

  const handleAddDoc = async () => {
    if (!text || !selectedBook || !docName) return;
    setLoading(true);
    const res = await fetch("/api/transcribe-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: text,
        book: selectedBook.id,
        document: docName,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setShowDialog(true);
      setText("");
      setDocName("");
    } else {
      alert("Failed to add document");
    }
  };

  const handleCreateBook = async () => {
    if (!newBookName) return;
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBookName }),
    });
    if (res.ok) {
      setShowBookDialog(false);
      setNewBookName("");
      const data = await res.json();
      setBooks((prev) => [...prev, data]);
      setSelectedBook(data);
    } else {
      alert("Failed to create book");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-xl space-y-6 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">
          Upload Pre-Translations
        </h1>
        <div className="space-y-2">
          <label className="font-medium">Select Book</label>
          <div className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-48 justify-between">
                  {selectedBook ? selectedBook.name : "Choose a book"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {books.map((book) => (
                  <DropdownMenuItem
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                  >
                    {book.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => setShowBookDialog(true)}>
                  + Create new book
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-medium">Document Name</label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Enter document name"
          />
        </div>
        <div className="space-y-2">
          <label className="font-medium">Text</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            rows={8}
          />
        </div>
        <Button
          className="w-full mt-4 text-lg"
          onClick={handleAddDoc}
          disabled={loading || !text || !selectedBook || !docName}
        >
          {loading ? "Adding..." : "Add Doc"}
        </Button>
      </div>
      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>
              Document added successfully.
              <br />
              <Button
                className="mt-4"
                onClick={() => setShowDialog(false)}
              >
                View Document (placeholder)
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Create Book Dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Book</DialogTitle>
            <DialogDescription>
              <input
                className="w-full border rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="Book name"
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCreateBook} disabled={!newBookName}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
