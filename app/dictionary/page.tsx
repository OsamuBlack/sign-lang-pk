"use client";

import { useEffect } from "react";

export default function DictionaryPage() {
  useEffect(() => {
    // Redirect to the first category in the dictionary
    window.location.href = "/dictionary/1";
  }, []);
  return (
    <h2 className="text-xl font-bold mb-4">Redirecting to the dictionary...</h2>
  );
}
