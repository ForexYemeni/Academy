"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Save,
  Trash2,
  Loader2,
  AudioLines,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type RecorderState = "idle" | "recording" | "paused" | "stopped";

export function AudioRecorder({
  onSave,
}: {
  onSave: (data: { audioBase64: string; duration: number; size: number }) => Promise<void>;
}) {
  const { t, locale } = useI18n();
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [levels, setLevels] = useState<number[]>(Array.from({ length: 24 }, () => 0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const updateLevels = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const buckets = 24;
    const step = Math.floor(data.length / buckets);
    const next: number[] = [];
    for (let i = 0; i < buckets; i++) {
      const slice = data.slice(i * step, (i + 1) * step);
      const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
      next.push(avg / 255);
    }
    setLevels(next);
    rafRef.current = requestAnimationFrame(updateLevels);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // Audio analyser for visualization
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      updateLevels();

      // Choose the best supported mime type
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      const mimeType = mimeTypes.find((mt) => MediaRecorder.isTypeSupported(mt)) || "";

      const mr = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 128000 } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setState("recording");
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err: any) {
      toast.error(
        locale === "ar"
          ? "تعذّر الوصول إلى الميكروفون. تأكد من منح الإذن."
          : "Cannot access microphone. Please grant permission."
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setState("paused");
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setLevels(Array.from({ length: 24 }, () => 0));
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setState("recording");
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      updateLevels();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setState("stopped");
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setLevels(Array.from({ length: 24 }, () => 0));
    cleanup();
  };

  const reset = () => {
    setState("idle");
    setDuration(0);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const save = async () => {
    if (!audioBlob) return;
    setSaving(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await onSave({
          audioBase64: base64,
          duration,
          size: audioBlob.size,
        });
        setSaving(false);
        reset();
      };
      reader.readAsDataURL(audioBlob);
    } catch (err: any) {
      toast.error(err.message || "Save error");
      setSaving(false);
    }
  };

  return (
    <Card className="glass card-lux rounded-2xl p-6 sm:p-8">
      <div className="text-center">
        <h3 className="font-display font-semibold text-lg mb-1">
          {locale === "ar" ? "استوديو التسجيل" : "Recording Studio"}
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
          {locale === "ar"
            ? "سجّل دروسك الصوتية مباشرة من المتصفح بجودة احترافية"
            : "Record your audio lessons directly in your browser with pro quality"}
        </p>

        {/* Timer + Visualizer */}
        <div className="mb-6">
          <div className="font-mono text-4xl font-bold text-gradient mb-4">
            {formatTime(duration)}
          </div>
          <div className="flex items-end justify-center gap-1 h-20 max-w-full overflow-hidden">
            {levels.map((lvl, i) => (
              <motion.div
                key={i}
                className="w-1 sm:w-1.5 lg:w-2 rounded-full bg-gradient-to-t from-primary to-accent"
                style={{ height: "100%", originY: 1 }}
                animate={{
                  scaleY: state === "recording" ? Math.max(0.05, lvl) : 0.05,
                }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {state === "idle" && (
            <Button onClick={startRecording} size="lg" className="rounded-full shadow-glow">
              <Mic className="w-5 h-5 me-2" />
              {t("lessons.startRec")}
            </Button>
          )}

          {state === "recording" && (
            <>
              <Button onClick={pauseRecording} variant="outline" size="lg" className="rounded-full">
                <Pause className="w-5 h-5 me-2" />
                {t("lessons.pauseRec")}
              </Button>
              <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full">
                <Square className="w-5 h-5 me-2" />
                {t("lessons.stopRec")}
              </Button>
            </>
          )}

          {state === "paused" && (
            <>
              <Button onClick={resumeRecording} size="lg" className="rounded-full shadow-glow">
                <Play className="w-5 h-5 me-2" />
                {t("lessons.resumeRec")}
              </Button>
              <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full">
                <Square className="w-5 h-5 me-2" />
                {t("lessons.stopRec")}
              </Button>
            </>
          )}

          {state === "stopped" && audioUrl && (
            <>
              <audio src={audioUrl} controls className="w-full max-w-md" />
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Button onClick={save} disabled={saving} size="lg" className="rounded-full shadow-glow">
                  {saving ? <Loader2 className="w-5 h-5 me-2 animate-spin" /> : <Save className="w-5 h-5 me-2" />}
                  {t("lessons.saveRec")}
                </Button>
                <Button onClick={reset} variant="outline" size="lg" className="rounded-full">
                  <RotateCcw className="w-5 h-5 me-2" />
                  {t("lessons.restartRec")}
                </Button>
                <Button onClick={reset} variant="ghost" size="lg" className="rounded-full text-destructive">
                  <Trash2 className="w-5 h-5 me-2" />
                  {t("lessons.deleteRec")}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Recording indicator */}
        <AnimatePresence>
          {state === "recording" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/15 text-destructive text-xs font-medium"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-destructive opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-destructive" />
              </span>
              {t("lessons.recording")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
