import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Clock, Lock, Play } from "lucide-react";
import { motion } from "motion/react";
import type { Video, WatchProgress } from "../backend.d";

const GENRE_COLORS: Record<string, string> = {
  Romance: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Thriller: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Action: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

interface VideoCardProps {
  video: Video;
  progress?: WatchProgress;
  isPremium?: boolean;
  ocid?: string;
}

function formatDuration(seconds: bigint): string {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export default function VideoCard({
  video,
  progress,
  isPremium = false,
  ocid,
}: VideoCardProps) {
  const isLocked = video.isPremiumOnly && !isPremium;
  const watchedPct = progress
    ? Math.min(
        100,
        (Number(progress.watchedSeconds) / Number(video.durationSeconds)) * 100,
      )
    : 0;
  const thumbUrl = `https://picsum.photos/seed/${video.id}/400/225`;
  const videoPath = `/video/${video.id.toString()}` as "/video/$id";

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex-shrink-0 w-52 md:w-60"
      data-ocid={ocid}
    >
      <Link to={videoPath} params={{ id: video.id.toString() }}>
        <div className="relative rounded-lg overflow-hidden bg-secondary aspect-video group cursor-pointer">
          <img
            src={thumbUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            {isLocked ? (
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-crimson flex items-center justify-center shadow-crimson">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            )}
          </div>
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            <Badge
              className={`text-[10px] px-1.5 py-0 border ${GENRE_COLORS[video.genre] ?? ""}`}
            >
              {video.genre}
            </Badge>
            {video.isPremiumOnly && (
              <Badge className="text-[10px] px-1.5 py-0 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                Premium
              </Badge>
            )}
          </div>
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {formatDuration(video.durationSeconds)}
            </span>
          </div>
          {progress && !progress.completed && watchedPct > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-crimson transition-all"
                style={{ width: `${watchedPct}%` }}
              />
            </div>
          )}
        </div>
        <div className="mt-2 px-0.5">
          <p className="text-sm font-medium text-foreground line-clamp-1">
            {video.title}
          </p>
          {progress && !progress.completed && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {Math.round(watchedPct)}% watched
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable identity
        <div key={i} className="flex-shrink-0 w-52 md:w-60">
          <div className="aspect-video rounded-lg bg-secondary animate-pulse" />
          <div className="mt-2 h-4 w-3/4 rounded bg-secondary animate-pulse" />
        </div>
      ))}
    </>
  );
}
