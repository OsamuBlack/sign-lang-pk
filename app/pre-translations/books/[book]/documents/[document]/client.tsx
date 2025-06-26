"use client";

import { VideoSegmentPlayer } from "@/components/video-player";
import Link from "next/link";
import React from "react";

export function DocumentClient({
  sentences,
  book,
  document,
}: {
  sentences: {
    from: string;
    to: string;
    feed?: {
      word: string;
      url: string;
    }[];
  }[];
  book: string;
  document: string;
}) {
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [autoplay, setAutoplay] = React.useState(false);
  const sentenceRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Flatten all videos for memory efficiency
  const allVideos = sentences[currentIdx]?.feed || [];

  // Helper: detect if a word is likely fingerspelled (single char, or not in feed, or no url)
  function isFingerspelled(word: string, url: string | undefined) {
    // Heuristic: single char, or url is missing, or word is all caps and not in dictionary
    return word.length === 1 || !url || /[A-Z]{2,}/.test(word);
  }

  // When video ends, go to next sentence if autoplay
  const handleVideoEnd = () => {
    if (autoplay && currentIdx < sentences.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  // Autoscroll to current sentence
  React.useEffect(() => {
    const ref = sentenceRefs.current[currentIdx];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIdx]);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">
        Document: {decodeURIComponent(document)}
      </h1>
      <div className="mb-6">
        <VideoSegmentPlayer
          videos={allVideos.map((video) => ({
            label: video.word,
            url: video.url,
          }))}
          onEnded={handleVideoEnd}
        />
      </div>
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto rounded border bg-white shadow-inner p-2">
        {sentences.map((sentence, idx) => (
          <button
            key={idx + "1"}
            ref={(el) => {
              sentenceRefs.current[idx] = el;
            }}
            className={`text-left p-3 rounded transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              idx === currentIdx
                ? "bg-primary/10 border-primary/40"
                : "hover:bg-muted"
            }`}
            onClick={() => setCurrentIdx(idx)}
            tabIndex={0}
          >
            <span className="block font-semibold text-gray-700 mb-1">
              {sentence.from}
            </span>
            <span className="block text-gray-900">{sentence.to}</span>
            {/* Show video feed for this sentence, with fingerspelled words visually closer */}
            {sentence.feed && sentence.feed.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {sentence.feed.map((v, i) => (
                  <span
                    key={v.word + i}
                    className={`inline-block px-2 py-1 rounded text-xs font-mono ${
                      isFingerspelled(v.word, v.url)
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                        : "bg-blue-100 text-blue-900 border border-blue-200"
                    }`}
                    style={
                      isFingerspelled(v.word, v.url)
                        ? { marginRight: 2, marginLeft: 2 }
                        : {}
                    }
                  >
                    {v.word}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-6">
        <button
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
          onClick={() => setAutoplay((a) => !a)}
        >
          {autoplay ? "Autoplay: On" : "Autoplay: Off"}
        </button>
        <Link
          href={`/pre-translations/books/${book}`}
          className="text-blue-600 hover:underline"
        >
          Back to Documents
        </Link>
      </div>
    </div>
  );
}
