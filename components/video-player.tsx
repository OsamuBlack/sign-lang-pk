"use client"

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface VideoSegmentPlayerProps {
  videos: (
    | { label: string; url: string }
    | { label: string; group: string[]; urls: string[] }
  )[];
  onEnded?: () => void;
}

export const VideoSegmentPlayer: React.FC<VideoSegmentPlayerProps> = ({
  videos = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeLetterIdx, setActiveLetterIdx] = useState<number>(0);
  const [videoDurations, setVideoDurations] = useState<Record<number, number>>({});
  const shouldAutoPlayRef = useRef(false);

  // Load video metadata for all video segments
  useEffect(() => {
    videos.forEach((item, idx) => {
      if ('url' in item) {
        const video = document.createElement('video');
        video.src = item.url;
        video.addEventListener('loadedmetadata', () => {
          setVideoDurations((prev) => ({ ...prev, [idx]: video.duration }));
        });
      } else if ('urls' in item) {
        // Only load first url for duration (assume all letters similar duration)
        const video = document.createElement('video');
        video.src = item.urls[0];
        video.addEventListener('loadedmetadata', () => {
          setVideoDurations((prev) => ({ ...prev, [idx]: video.duration }));
        });
      }
    });
  }, [videos]);

  useEffect(() => {
    setCurrentIndex(0);
    setActiveLetterIdx(0);
  }, [videos]);

  useEffect(() => {
    setActiveLetterIdx(0);
  }, [currentIndex]);

  // Handle video playback for group
  useEffect(() => {
    const getCurrentUrl = () => {
      const item = videos[currentIndex];
      if ('url' in item) return item.url;
      if ('urls' in item) return item.urls[activeLetterIdx] || item.urls[0];
      return '';
    };
    if (!videoRef.current || !getCurrentUrl()) return;
    const video = videoRef.current;
    let hasEnded = false;
    const handleLoadedData = (): void => {
      video.currentTime = 1.5;
      if (shouldAutoPlayRef.current || isPlaying) {
        video.play();
        shouldAutoPlayRef.current = false;
      }
    };
    const handleTimeUpdate = (): void => {
      const duration = videoDurations[currentIndex] || video.duration;
      const startTime = 1.5;
      const playDuration = duration / 2 - 1.25;
      const endTime = startTime + playDuration;
      if (!hasEnded && video.currentTime >= endTime) {
        hasEnded = true;
        video.pause();
        // If group, move to next letter in group
        const item = videos[currentIndex];
        if ('group' in item && activeLetterIdx < item.group.length - 1) {
          setActiveLetterIdx((idx) => idx + 1);
          shouldAutoPlayRef.current = true;
        } else if (currentIndex < videos.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setActiveLetterIdx(0);
          shouldAutoPlayRef.current = true;
        } else {
          setIsPlaying(false);
          setCurrentIndex(0);
          setActiveLetterIdx(0);
        }
      }
    };
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentIndex, activeLetterIdx, isPlaying, videos, videoDurations]);

  // Preload next video
  useEffect(() => {
    if (!preloadRef.current || currentIndex >= videos.length - 1) return;
    const nextItem = videos[currentIndex + 1];
    let nextUrl = '';
    if (nextItem) {
      if ('url' in nextItem) nextUrl = nextItem.url;
      else if ('urls' in nextItem) nextUrl = nextItem.urls[0];
    }
    if (nextUrl) {
      preloadRef.current.src = nextUrl;
      preloadRef.current.load();
    }
  }, [currentIndex, videos]);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePlay = (): void => setIsPlaying(true);
  const handlePause = (): void => setIsPlaying(false);
  const handleKeyClick = (index: number): void => {
    setCurrentIndex(index);
    setActiveLetterIdx(0);
    setIsPlaying(true);
  };

  const handleVideoClick = (): void => {
    if (!videoRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
  };

  // Helper to get current video URL
  const getCurrentUrl = () => {
    const item = videos[currentIndex];
    if (!item) return '';
    if ('url' in item) return item.url;
    if ('urls' in item) return item.urls[activeLetterIdx] || item.urls[0];
    return '';
  };

  // Helper to get current label (for fullscreen subtitle)
  const getCurrentLabel = () => {
    const item = videos[currentIndex];
    if (!item) return '';
    if ('group' in item) {
      return item.group.map((char, i) =>
        i === activeLetterIdx ? <b key={i} style={{textDecoration:'underline'}}>{char}</b> : char
      );
    }
    return item.label;
  };

  if (videos.length === 0) {
    return (
      <div className="max-w-4xl mx-auto ">
        <div className="relative bg-black rounded-lg overflow-hidden w-full min-h-[45vh] flex items-center justify-center">
          <div className="text-white font-bold text-center">
            Please enter gloss for video.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center"
        style={!isFullscreen ? { height: "45vh" } : {}}
      >
        <video
          ref={videoRef}
          src={getCurrentUrl()}
          className="w-full h-full object-contain"
          onPlay={handlePlay}
          onPause={handlePause}
          preload="metadata"
          controls={false}
          onClick={handleVideoClick}
          style={{ background: "black" }}
        />

        <video ref={preloadRef} className="hidden" preload="auto" muted />

        {/* Custom Play Button */}
        {!isPlaying && !shouldAutoPlayRef.current && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleVideoClick}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4 transition-all duration-200"
            >
              <Play size={48} fill="white" />
            </button>
          </div>
        )}

        {/* Compact scrollable segments inside video frame */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {videos.map((item, index) => (
              <Button
                key={String('label' in item ? item.label : index) + '-' + index}
                onClick={() => handleKeyClick(index)}
                variant={index === currentIndex ? "default" : "secondary"}
                size="sm"
                className={`flex-shrink-0 text-xs h-7 px-2 bg-opacity-70 backdrop-blur-sm ${
                  index === currentIndex
                    ? "bg-primary hover:bg-primary/90 text-foreground"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                {('group' in item && index === currentIndex) ? (
                  item.group.map((char, i) => (
                    <span
                      key={char + i}
                      style={{ fontWeight: i === activeLetterIdx ? 'bold' : 'normal', textDecoration: i === activeLetterIdx ? 'underline' : 'none' }}
                    >
                      {char}
                    </span>
                  ))
                ) : (
                  item.label
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Fullscreen subtitle */}
        {isFullscreen && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-black px-4 py-2 rounded text-lg font-medium">
            {getCurrentLabel()}
          </div>
        )}
      </div>
    </div>
  );
};
