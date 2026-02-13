"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Volume2, VolumeX, Play, Pause, Maximize } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function ProductDemoSection() {
  const t = useTranslations("landing");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-play when in viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Track progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      if (v > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
      if (v === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * video.duration;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 2500);
  };

  return (
    <section id="demo" className="px-4 py-20">
      <div className="container mx-auto">
        <FadeIn className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("demoTitle")}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("demoSubtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-12">
          <div
            ref={containerRef}
            className="group relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-border/40 bg-black shadow-2xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Video */}
            <video
              ref={videoRef}
              src="/video/marketing.mp4"
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full cursor-pointer"
              onClick={togglePlay}
            />

            {/* Play overlay (when paused) */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
                aria-label="Play"
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                  <Play className="ml-1 size-7 text-black" fill="black" />
                </div>
              </button>
            )}

            {/* Bottom controls */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300",
                showControls || !isPlaying ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Progress bar */}
              <div
                className="mb-3 h-1 cursor-pointer rounded-full bg-white/30"
                onClick={handleSeek}
              >
                <div
                  className="h-full rounded-full bg-[#E8882D] transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="text-white/90 transition-colors hover:text-white"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
                </button>

                {/* Mute/Unmute */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-white/90 transition-colors hover:text-white"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                </button>

                {/* Volume slider */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-20 cursor-pointer accent-[#E8882D]"
                  aria-label="Volume"
                />

                <div className="flex-1" />

                {/* Fullscreen */}
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="text-white/90 transition-colors hover:text-white"
                  aria-label="Fullscreen"
                >
                  <Maximize className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4} className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-lg font-medium text-[#2B6B93] transition-colors hover:text-[#E8882D]"
          >
            {t("demoCta")}
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
