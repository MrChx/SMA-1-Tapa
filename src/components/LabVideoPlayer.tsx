"use client";

import { useEffect, useRef, useState } from "react";

type LabVideoPlayerProps = {
  title: string;
  videoUrl: string;
};

interface YouTubePlayer {
  destroy?: () => void;
  mute?: () => void;
  unMute?: () => void;
  pauseVideo?: () => void;
  playVideo?: () => void;
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
}

interface YouTubePlayerReadyEvent {
  target: YouTubePlayer;
}

interface YouTubePlayerOptions {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: YouTubePlayerReadyEvent) => void;
  };
}

interface YouTubeNamespace {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: (() => void) | undefined;
  }
}

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

let youtubeApiPromise: Promise<YouTubeNamespace> | null = null;

function getYouTubeId(url: string) {
  const match = url.match(YOUTUBE_REGEX);
  return match?.[1] ?? null;
}

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API is only available in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();

      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API loaded without Player."));
      }
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load YouTube API."));
    document.body.appendChild(script);
  });

  return youtubeApiPromise;
}

export default function LabVideoPlayer({ title, videoUrl }: LabVideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const youtubeMountRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const youtubeReadyRef = useRef(false);
  const activeRef = useRef(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  const trimmedUrl = videoUrl.trim();
  const youtubeId = getYouTubeId(trimmedUrl);

  function syncYouTubePlayback(nextShouldPlay: boolean) {
    const player = youtubePlayerRef.current;

    if (!player || !youtubeReadyRef.current) {
      return;
    }

    if (nextShouldPlay) {
      player.unMute?.();
      player.playVideo?.();
      return;
    }

    player.pauseVideo?.();
    player.seekTo?.(0, true);
  }

  useEffect(() => {
    const element = wrapperRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isActive = entry.isIntersecting && entry.intersectionRatio >= 0.45;
        activeRef.current = isActive;
        setShouldPlay(isActive);
      },
      {
        threshold: [0, 0.25, 0.45, 0.7],
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      setShouldPlay(false);
      activeRef.current = false;
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handlePageHide);
    };
  }, []);

  useEffect(() => {
    if (youtubeId || !trimmedUrl) {
      return;
    }

    const video = nativeVideoRef.current;

    if (!video) {
      return;
    }

    if (shouldPlay) {
      video.muted = false;
      video.volume = 1;
      void video.play().catch(() => {
        // Some browsers block autoplay with sound; we silently ignore that case.
      });
      return;
    }

    video.pause();
    if (video.currentTime > 0) {
      video.currentTime = 0;
    }

    return () => {
      video.pause();
      if (video.currentTime > 0) {
        video.currentTime = 0;
      }
    };
  }, [shouldPlay, trimmedUrl, youtubeId]);

  useEffect(() => {
    if (!youtubeId || !youtubeMountRef.current) {
      return;
    }

    let disposed = false;
    youtubeReadyRef.current = false;

    loadYouTubeApi()
      .then((YT) => {
        if (disposed || !youtubeMountRef.current) {
          return;
        }

        youtubePlayerRef.current = new YT.Player(youtubeMountRef.current, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event) => {
              youtubePlayerRef.current = event.target;
              youtubeReadyRef.current = true;
              syncYouTubePlayback(activeRef.current);
            },
          },
        });
      })
      .catch(() => {
        // Ignore player init failures and leave the placeholder frame empty.
      });

    return () => {
      disposed = true;
      youtubeReadyRef.current = false;
      youtubePlayerRef.current?.pauseVideo?.();
      youtubePlayerRef.current?.seekTo?.(0, true);
      youtubePlayerRef.current?.destroy?.();
      youtubePlayerRef.current = null;
    };
  }, [youtubeId]);

  useEffect(() => {
    if (!youtubeId) {
      return;
    }

    syncYouTubePlayback(shouldPlay);
  }, [shouldPlay, youtubeId]);

  if (!trimmedUrl) {
    return (
      <div ref={wrapperRef} className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-4">
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
          <span className="material-symbols-outlined text-4xl">science</span>
        </div>
        <p className="font-bold text-sm tracking-widest uppercase">Laboratorium Sekolah</p>
      </div>
    );
  }

  if (youtubeId) {
    return (
      <div ref={wrapperRef} className="w-full h-full">
        <div ref={youtubeMountRef} className="w-full h-full" aria-label={title} />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <video
        ref={nativeVideoRef}
        src={trimmedUrl}
        className="w-full h-full object-cover"
        playsInline
        preload="metadata"
      />
    </div>
  );
}
