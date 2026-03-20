import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Crown, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useGetVideoById,
  useRecordProgress,
  useWatchProgress,
} from "../hooks/useQueries";

const GENRE_COLORS: Record<string, string> = {
  Romance: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Thriller: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Action: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    // Handle youtu.be short links
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
    }
    // Handle youtube.com/watch?v=
    const longMatch = url.match(/[?&]v=([^&]+)/);
    if (longMatch) {
      return `https://www.youtube.com/embed/${longMatch[1]}?autoplay=1&rel=0`;
    }
    // Handle youtube.com/embed/ already
    if (url.includes("youtube.com/embed/")) {
      return url;
    }
  } catch {
    // ignore
  }
  return null;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export default function VideoPage() {
  const { id } = useParams({ from: "/layout/video/$id" });
  const videoId = BigInt(id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastRecordedRef = useRef(0);
  const { isPremium } = useAuth();

  const { data: video, isLoading: videoLoading } = useGetVideoById(videoId);
  const { data: progress } = useWatchProgress(videoId);
  const { mutate: recordProgress } = useRecordProgress();

  const [progressRestored, setProgressRestored] = useState(false);

  useEffect(() => {
    if (progress && videoRef.current && !progressRestored && video) {
      const watched = Number(progress.watchedSeconds);
      const duration = Number(video.durationSeconds);
      if (watched > 0 && watched < duration * 0.95) {
        videoRef.current.currentTime = watched;
      }
      setProgressRestored(true);
    }
  }, [progress, video, progressRestored]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const handleTimeUpdate = () => {
      const current = Math.floor(videoEl.currentTime);
      if (current - lastRecordedRef.current >= 10) {
        lastRecordedRef.current = current;
        recordProgress({ videoId, watchedSeconds: BigInt(current) });
      }
    };
    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    return () => videoEl.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoId, recordProgress]);

  if (videoLoading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="aspect-video w-full rounded-xl mb-4" />
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </main>
    );
  }

  if (!video) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Video not found</p>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isLocked = video.isPremiumOnly && !isPremium;
  const videoUrl = video.videoUrl || "";
  const youtubeEmbed = isYouTubeUrl(videoUrl)
    ? getYouTubeEmbedUrl(videoUrl)
    : null;

  return (
    <main className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-xl overflow-hidden bg-black aspect-video mb-6"
          data-ocid="video.player"
        >
          {isLocked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Lock className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="font-display font-semibold text-lg mb-1">
                  Premium Content
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Subscribe to unlock this film
                </p>
                <Link to="/premium">
                  <Button className="bg-crimson hover:bg-crimson/90 text-white gap-2">
                    <Crown className="w-4 h-4" /> Get Premium
                  </Button>
                </Link>
              </div>
            </div>
          ) : youtubeEmbed ? (
            <iframe
              src={youtubeEmbed}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            // biome-ignore lint/a11y/useMediaCaption: short films without captions available
            <video
              ref={videoRef}
              src={videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
              controls
              className="w-full h-full"
              poster={`https://picsum.photos/seed/${video.id}/800/450`}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex flex-wrap items-start gap-3 mb-3">
            <h1 className="font-display font-bold text-xl md:text-2xl flex-1">
              {video.title}
            </h1>
            <div className="flex gap-2 flex-shrink-0">
              <Badge className={`border ${GENRE_COLORS[video.genre] ?? ""}`}>
                {video.genre}
              </Badge>
              {video.isPremiumOnly && (
                <Badge className="border bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  Premium
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {video.description}
          </p>

          {progress && !progress.completed && (
            <div className="mt-4" data-ocid="video.progress_bar">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Your progress</span>
                <span>
                  {Math.round(
                    (Number(progress.watchedSeconds) /
                      Number(video.durationSeconds)) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-crimson rounded-full"
                  style={{
                    width: `${Math.min(100, (Number(progress.watchedSeconds) / Number(video.durationSeconds)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
