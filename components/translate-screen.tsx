"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { fromGlossSchema, toGlossSchema } from "@/lib/translationSchema";
import { VideoSegmentPlayer } from "./video-player";

export default function TranslationScreen() {
  const [input, setInput] = useState<string>();
  const [translatedText, setTranslatedText] = useState<string>();
  const [isReversed, setIsReversed] = useState(false);
  const [videoMap, setVideoMap] =
    useState<Array<{ label: string; url: string }>>();

  const { submit, isLoading, stop } = useObject({
    api: isReversed ? "/api/gloss-to-text" : "/api/text-to-gloss",
    schema: isReversed ? fromGlossSchema : toGlossSchema,
    async onFinish({ object, error }) {
      if (object) {
        toast.success("Generated response successfully!");
        const sentences = object.sentences.map((pair) => pair);
        setInput(sentences.map((pair) => pair.from).join(" "));
        const gloss = sentences.map((pair) => pair.to).join(" ");
        setTranslatedText(gloss);
        // Fetch video mapping for gloss
        if (!isReversed) {
          try {
            const res = await fetch("/api/gloss-to-videos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gloss }),
              cache: "no-store",
            });
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log(data);

            setVideoMap(data.videos);
          } catch (e) {
            console.error("Failed to fetch videos:", e);
            toast.error("Failed to fetch videos for gloss");
            setVideoMap(undefined);
          }
        } else {
          setVideoMap(undefined);
        }
      }
      if (error) {
        toast.error("Failed to parse generated response.");
        console.error("Parsing error:", error);
      }
    },
    onError(error) {
      toast.error("An error occurred during generation.");
      console.error("Generation error:", error);
    },
  });

  const handleSwitch = useCallback(() => {
    setIsReversed(!isReversed);
    setInput(translatedText);
    setTranslatedText(input);
    setVideoMap(undefined);
  }, [isReversed, setInput, translatedText, input]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-2xl font-bold">Text to Sign Language</h1>
        <Button
          onClick={handleSwitch}
          variant="outline"
          size="icon"
          className="self-start md:self-auto"
        >
          <ArrowLeftRight size="16" />
        </Button>
        <h2 className="text-xl font-semibold">Sign Language to Text</h2>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1 space-y-2">
          <label className="font-medium text-sm">
            {isReversed ? "Sign Language" : "Text Input"}
          </label>
          <Textarea
            placeholder={
              isReversed ? "Enter sign language" : "Enter text to translate"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>
        <div className="flex-1 space-y-2 relative">
          <label className="font-medium text-sm">
            {isReversed ? "Translated Text" : "Sign Language Output"}
          </label>
          <Textarea
            placeholder={
              isReversed ? "Translated text" : "Translated sign language"
            }
            value={translatedText}
            readOnly
            rows={8}
            className="resize-none"
          />
        </div>
      </div>
      <div className="mt-4">
        <VideoSegmentPlayer videos={videoMap?.length ? videoMap : []} />
      </div>
      {isLoading ? (
        <Button
          onClick={() => stop()}
          variant="destructive"
          className="w-full mt-4"
        >
          Stop
        </Button>
      ) : (
        <Button
          onClick={() => {
            if (!input) {
              toast.error("Please enter text to translate");
              return;
            }
            submit(input);
          }}
          className="w-full mt-4"
        >
          Translate
        </Button>
      )}

      {/* <Button
        onClick={async () => {
          const res = await fetch("/api/gloss-to-videos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gloss: translatedText || input }),
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          console.log(data);
        }}
        className="w-full mt-4"
      >
        Check Generation
      </Button> */}
    </div>
  );
}
