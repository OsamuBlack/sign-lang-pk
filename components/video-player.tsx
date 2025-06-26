import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface VideoSegmentPlayerProps {
  videos: {
    label: string;
    url: string;
  }[];
}

export const VideoSegmentPlayer: React.FC<VideoSegmentPlayerProps> = ({
  videos = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [videoKeys, setVideoKeys] = useState<string[]>(
    videos.map((video) => video.label)
  );
  const [videoDurations, setVideoDurations] = useState<Record<string, number>>(
    {}
  );
  const shouldAutoPlayRef = useRef(false);

  const currentKey = videoKeys[currentIndex];
  const currentUrl = videos[currentIndex]?.url;

  // Load video metadata
  const loadVideoMetadata = (url: string, key: string): void => {
    const video = document.createElement("video");
    video.src = url;
    video.addEventListener("loadedmetadata", () => {
      setVideoDurations((prev) => ({
        ...prev,
        [key]: video.duration,
      }));
    });
  };

  useEffect(() => {
    videoKeys.forEach((key, index) => {
      loadVideoMetadata(videos[index].url, key);
    });
  }, [videos, videoKeys]);

  useEffect(() => {
    setVideoKeys(videos.map((video) => video.label));
    setCurrentIndex(0);
  }, [videos]);

  // Handle video playback
  useEffect(() => {
    if (!videoRef.current || !currentUrl) return;

    const video = videoRef.current;
    const duration = videoDurations[currentKey];

    if (!duration) return;

    const startTime = 1.5;
    const playDuration = duration / 2 - 1.25;
    const endTime = startTime + playDuration;

    let hasEnded = false;

    const handleLoadedData = (): void => {
      video.currentTime = startTime;
      if (shouldAutoPlayRef.current || isPlaying) {
        video.play();
        shouldAutoPlayRef.current = false;
      }
    };

    const handleTimeUpdate = (): void => {
      if (!hasEnded && video.currentTime >= endTime) {
        hasEnded = true;
        video.pause();
        if (currentIndex < videoKeys.length - 1) {
          shouldAutoPlayRef.current = true;
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentIndex(0);
        }
      }
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [
    currentUrl,
    currentKey,
    videoDurations,
    isPlaying,
    currentIndex,
    videoKeys.length,
  ]);

  // Preload next video
  useEffect(() => {
    if (!preloadRef.current || currentIndex >= videoKeys.length - 1) return;
    // const nextKey = videoKeys[currentIndex + 1];
    const nextUrl =
      videos[currentIndex + 1]?.url || videos[currentIndex + 1]?.url || "";

    if (nextUrl) {
      preloadRef.current.src = nextUrl;
      preloadRef.current.load();
    }
  }, [currentIndex, videoKeys, videos]);

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
    setIsPlaying(true);
  };

  const handleVideoClick = (): void => {
    if (!videoRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
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
          src={currentUrl}
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
            {videoKeys.map((key, index) => (
              <Button
                key={key + index}
                onClick={() => handleKeyClick(index)}
                variant={index === currentIndex ? "default" : "secondary"}
                size="sm"
                className={`flex-shrink-0 text-xs h-7 px-2 bg-opacity-70 backdrop-blur-sm ${
                  index === currentIndex
                    ? "bg-blue-600 hover:bg-blue-700 text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                {key}
              </Button>
            ))}
          </div>
        </div>

        {/* Fullscreen subtitle */}
        {isFullscreen && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-black px-4 py-2 rounded text-lg font-medium">
            {currentKey}
          </div>
        )}
      </div>
    </div>
  );
};
