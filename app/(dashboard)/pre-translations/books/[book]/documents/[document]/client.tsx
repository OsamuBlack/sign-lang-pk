"use client";

import { VideoSegmentPlayer } from "@/components/video-player";
import Link from "next/link";
import React from "react";

export function DocumentClient({
  paragraphs,
  book,
  document,
}: {
  paragraphs: {
    sentences: {
      from: string;
      to: string;
      feed?: (
        | {
            word: string;
            url: string;
          }
        | {
            word: string;
            group: string[];
            urls: string[];
          }
      )[];
    }[];
  }[];
  book: string;
  document: string;
}) {
  // Flatten all sentences for navigation and video
  const allSentences = paragraphs.flatMap((p) => p.sentences);
  const [currentIdx, setCurrentIdx] = React.useState<number>(0);
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);
  const [editFrom, setEditFrom] = React.useState("");
  const [editTo, setEditTo] = React.useState("");
  const sentenceRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  // Autoscroll to current sentence
  React.useEffect(() => {
    if (currentIdx !== null) {
      const ref = sentenceRefs.current[currentIdx];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentIdx]);

  // Handle edit save (stub, implement API call as needed)
  const handleEditSave = (idx: number) => {
    // TODO: Call API to update sentence
    // For now, just update locally
    allSentences[idx].from = editFrom;
    allSentences[idx].to = editTo;
    setEditingIdx(null);
  };

  // Handle video end: move to next sentence if possible
  const handleVideoEnd = () => {
    if (currentIdx < allSentences.length - 1) {
      setCurrentIdx((idx) => idx + 1);
    }
  };

  // Ensure video auto-plays when currentIdx changes
  const [shouldAutoPlay, setShouldAutoPlay] = React.useState(false);
  React.useEffect(() => {
    if (shouldAutoPlay) {
      setShouldAutoPlay(false);
    }
  }, [currentIdx, shouldAutoPlay]);

  return (
    <div className="max-w-3xl mx-auto space-y-4 text-left">
      <h1 className="text-2xl font-bold mb-4">
        Document: {decodeURIComponent(document)}
      </h1>
      {/* Show video for current sentence only */}
      {allSentences[currentIdx]?.feed && allSentences[currentIdx].feed.length > 0 && (
        <div className="mb-6">
          <VideoSegmentPlayer
            videos={allSentences[currentIdx].feed.map((video) => ({
              ...video,
              label: video.word,
            }))}
            onEnded={() => {
              setShouldAutoPlay(true);
              handleVideoEnd();
            }}
            // autoplay={shouldAutoPlay}
          />
        </div>
      )}
      <div className="prose prose-lg max-w-none bg-white rounded shadow-inner p-4 text-left max-h-[40vh] overflow-y-auto">
        {paragraphs.map((paragraph, pIdx) => (
          <div key={pIdx} className="mb-6">
            {paragraph.sentences.map((sentence, sIdx) => {
              // Calculate the global sentence index for navigation/editing
              const globalIdx =
                paragraphs
                  .slice(0, pIdx)
                  .reduce((acc, p) => acc + p.sentences.length, 0) + sIdx;
              return editingIdx === globalIdx ? (
                <span key={sIdx} className="inline-block align-baseline ">
                  <input
                    className="border rounded px-2 py-1 w-48"
                    value={editFrom}
                    onChange={(e) => setEditFrom(e.target.value)}
                    placeholder="English"
                    autoFocus
                  />
                  <input
                    className="border rounded px-2 py-1 mr-2 w-48"
                    value={editTo}
                    onChange={(e) => setEditTo(e.target.value)}
                    placeholder="Gloss"
                  />
                  <button
                    className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 mr-1"
                    onClick={() => handleEditSave(globalIdx)}
                  >
                    Save
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
                    onClick={() => setEditingIdx(null)}
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <span
                  key={sIdx}
                  ref={(el) => {
                    sentenceRefs.current[globalIdx] = el;
                  }}
                  className={`inline align-baseline mr-1 py-1 rounded cursor-pointer transition-colors ${
                    globalIdx === currentIdx
                      ? "bg-primary/10 border border-primary/40"
                      : "hover:bg-muted"
                  }`}
                  tabIndex={0}
                  onClick={() => setCurrentIdx(globalIdx)}
                  onDoubleClick={() => {
                    setEditingIdx(globalIdx);
                    setEditFrom(sentence.from);
                    setEditTo(sentence.to);
                  }}
                >
                  {sentence.from}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-6">
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
