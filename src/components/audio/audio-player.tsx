"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Rewind,
  FastForward,
  Gauge,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/lib/i18n";
import { saveAudioProgressAction } from "@/lib/student-actions";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export function AudioPlayer({
  src,
  lessonId,
  title,
  initialPosition = 0,
  onEnded,
  onNext,
  onPrev,
}: {
  src: string;
  lessonId: string;
  title: string;
  initialPosition?: number;
  onEnded?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(initialPosition || 0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastSaveRef = useRef(0);

  // Initialize audio
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.load();
    if (initialPosition > 0) {
      a.currentTime = initialPosition;
    }
  }, [src, initialPosition]);

  // Save progress throttled
  const saveProgress = useCallback(
    (completed = false) => {
      const now = Date.now();
      if (now - lastSaveRef.current < 3000 && !completed) return;
      lastSaveRef.current = now;
      saveAudioProgressAction({
        lessonId,
        currentTime: current,
        duration,
        completed,
      }).catch(() => {});
    },
    [lessonId, current, duration]
  );

  // Save on unmount
  useEffect(() => {
    return () => {
      saveProgress(false);
    };
  }, [saveProgress]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.play().catch(() => {});
    }
  };

  const seek = (s: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = s;
    setCurrent(s);
  };

  const skip = (delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + delta));
  };

  const changeSpeed = (s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    setMuted(v === 0);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "00:00";
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    if (s >= 3600) {
      const hh = Math.floor(s / 3600).toString().padStart(2, "0");
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <div className="glass-strong card-lux rounded-2xl p-4 sm:p-5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          setLoading(false);
          if (audioRef.current) audioRef.current.playbackRate = speed;
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          saveProgress(true);
          onEnded?.();
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
      />

      <div className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 grid place-items-center shrink-0 relative overflow-hidden">
            <motion.div
              animate={playing ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={playing ? { duration: 1, repeat: Infinity } : {}}
            >
              {playing ? (
                <AudioBars />
              ) : (
                <Play className="w-4 h-4 text-primary ms-0.5" />
              )}
            </motion.div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm truncate">{title}</h4>
            <p className="text-xs text-muted-foreground">
              {formatTime(current)} / {formatTime(duration)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground w-12 text-center">
            {formatTime(current)}
          </span>
          <Slider
            value={[current]}
            min={0}
            max={duration || 0}
            step={1}
            onValueChange={([v]) => seek(v)}
            className="flex-1"
          />
          <span className="text-xs font-mono text-muted-foreground w-12 text-center">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: speed */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full gap-1.5">
                  <Gauge className="w-4 h-4" />
                  <span className="font-mono text-xs">{speed}x</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {SPEEDS.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => changeSpeed(s)}
                    className={cn(s === speed && "bg-primary/10")}
                  >
                    {s}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: transport */}
          <div className="flex items-center gap-1">
            {onPrev && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={onPrev}
                title={t("player.prev")}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => skip(-15)}
              title={t("player.backward")}
            >
              <Rewind className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              className="rounded-full h-12 w-12 shadow-glow"
              onClick={togglePlay}
              disabled={loading}
            >
              {playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ms-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => skip(15)}
              title={t("player.forward")}
            >
              <FastForward className="w-4 h-4" />
            </Button>
            {onNext && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={onNext}
                title={t("player.next")}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Right: volume */}
          <div className="flex items-center gap-1 w-24">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={toggleMute}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[muted ? 0 : volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => changeVolume(v)}
              className="flex-1 hidden sm:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AudioBars() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-0.5 bg-primary rounded-full"
          animate={{ scaleY: [0.3, 1, 0.5, 0.8, 0.3] }}
          transition={{
            duration: 0.8 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ height: "100%", originY: 1 }}
        />
      ))}
    </div>
  );
}
