// app/dictionary/page.tsx
import { redirect } from "next/navigation";

export default function DictionaryPage() {
  // this runs on the server and immediately issues a 307
  redirect("/dictionary/Adjectives");
}
