"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import videosData from "@/lib/sign_videos.json";

interface Video {
  letter: string;
  src: string;
}

// const videos: Video[] = Object.entries(videosData).map(([letter, src]) => ({
//   letter,
//   src,
// }));

export function VideoPopup({
  // letterIndexes,
  children,
}: {
  // letterIndexes: number[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos: Video[] = [
    {
      letter: "ICE-CREAM",
      src: "https://api.aajkaadin.com/video?session=session&file=/storage/videos/i/720p/ice_cream_1621163694_94076.mp4",
    },
    {
      letter: "I",
      src: "https://api.aajkaadin.com/video?session=session&file=/storage/videos/i/720p/I_1622611454_42066.mp4",
    },
    {
      letter: "LIKE",
      src: "https://api.aajkaadin.com/video?session=session&file=/storage/videos/l/720p/like_1623254748_63942.mp4",
    },
  ];

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
      setCurrentVideoIndex(0);
    }
  }, [isOpen]);

  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setIsOpen(false);
      setCurrentVideoIndex(0);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const halfDuration = videoRef.current.duration * 0.4;
      videoRef.current.currentTime = 0.8;
      videoRef.current.play();
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
          handleVideoEnd();
        }
      }, halfDuration * 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sign Feed</DialogTitle>
        </DialogHeader>
        <div className="mt-4 aspect-video bg-black">
          <video
            ref={videoRef}
            src={videos[currentVideoIndex].src}
            onEnded={handleVideoEnd}
            onLoadedMetadata={handleVideoLoadedMetadata}
            className="w-full"
            controls={false}
            muted
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
