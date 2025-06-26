import React, { useState, useRef, useEffect } from "react";

interface VideoSegmentPlayerProps {
  videos: Record<string, string>;
}

export const VideoSegmentPlayer: React.FC<VideoSegmentPlayerProps> = ({
  videos = {},
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [videoKeys] = useState<string[]>(Object.keys(videos));
  const [videoDurations, setVideoDurations] = useState<Record<string, number>>(
    {}
  );

  const currentKey = videoKeys[currentIndex];
  const currentUrl = videos[currentKey];

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
    videoKeys.forEach((key) => {
      loadVideoMetadata(videos[key], key);
    });
  }, [videos, videoKeys]);

  // Handle video playback
  useEffect(() => {
    if (!videoRef.current || !currentUrl) return;

    const video = videoRef.current;
    const duration = videoDurations[currentKey];

    if (!duration) return;

    const startTime = 1;
    const playDuration = duration / 2 - 1;
    const endTime = startTime + playDuration;

    const handleLoadedData = (): void => {
      video.currentTime = startTime;
      if (isPlaying) {
        video.play();
      }
    };

    const handleTimeUpdate = (): void => {
      if (video.currentTime >= endTime) {
        video.pause();
        if (currentIndex < videoKeys.length - 1) {
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
    const nextKey = videoKeys[currentIndex + 1];
    const nextUrl = videos[nextKey];

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

  if (videoKeys.length === 0) {
    return <div className="p-4 text-center">No videos provided</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={currentUrl}
          className="w-full h-auto"
          onPlay={handlePlay}
          onPause={handlePause}
          preload="metadata"
          controls={false}
          onClick={handleVideoClick}
        />

        <video ref={preloadRef} className="hidden" preload="auto" muted />

        {/* Fullscreen subtitle */}
        {isFullscreen && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded text-lg font-medium">
            {currentKey}
          </div>
        )}
      </div>

      {/* Compact scrollable segments */}
      <div className="mt-3">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {videoKeys.map((key, index) => (
            <button
              key={key}
              onClick={() => handleKeyClick(index)}
              className={`flex-shrink-0 px-3 py-1 text-sm rounded transition-all duration-200 ${
                index === currentIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
