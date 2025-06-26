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
  // const [grammerLayouted, setGrammerLayouted] = useState(false);
  // const [signLayouted, setSignLayouted] = useState(false);

  const { submit, isLoading, stop } = useObject({
    api: isReversed ? "/api/gloss-to-text" : "/api/text-to-gloss",
    schema: isReversed ? fromGlossSchema : toGlossSchema,
    onFinish({ object, error }) {
      if (object) {
        toast.success("Generated response successfully!");
        const sentences = object.sentences.map((pair) => pair);
        setInput(sentences.map((pair) => pair.from).join(" "));
        setTranslatedText(sentences.map((pair) => pair.to).join(" "));
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
  }, [isReversed, setInput, translatedText, input]);

  // useEffect(() => {
  //   if (!isLoading && signLayouted && grammerLayouted) {
  //     setSignLayouted(false);
  //     setGrammerLayouted(false);
  //   }
  // }, [grammerLayouted, isLoading, signLayouted]);

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
        <VideoSegmentPlayer
          videos={{
            W: "https://api.aajkaadin.com/video?session=session&file=/storage/videos/w/720p/w_1598514882_93790.mp4",
            X: "https://api.aajkaadin.com/video?session=session&file=/storage/videos/x/720p/x_1598514901_59022.mp4",
            Y: "https://api.aajkaadin.com/video?session=session&file=/storage/videos/y/720p/y_1598514921_17735.mp4",
            Z: "https://api.aajkaadin.com/video?session=session&file=/storage/videos/z/720p/z_1598514941_50908.mp4",
          }}
        />
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
            console.log(input);
            submit(input);
          }}
          className="w-full mt-4"
        >
          Translate
        </Button>
      )}
    </div>
  );
}
