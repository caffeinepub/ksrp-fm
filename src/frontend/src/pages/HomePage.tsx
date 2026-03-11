import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Play, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Genre } from "../backend.d";
import VideoCard, { SkeletonCards } from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import {
  useContinueWatching,
  useListAllVideos,
  useListVideosByGenre,
} from "../hooks/useQueries";

function AdBanner() {
  return (
    <div className="w-full bg-secondary/60 border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
      <span className="text-xs uppercase tracking-widest text-muted-foreground/60">
        Advertisement
      </span>
      <p className="mt-1">
        🎬 Discover premium short films —{" "}
        <Link to="/premium" className="text-crimson hover:underline">
          Go Premium
        </Link>{" "}
        for an ad-free experience
      </p>
    </div>
  );
}

function GenreRow({ genre, isPremium }: { genre: Genre; isPremium: boolean }) {
  const { data: videos, isLoading } = useListVideosByGenre(genre);
  if (!isLoading && (!videos || videos.length === 0)) return null;
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <span
            className={`w-1 h-5 rounded-full ${
              genre === Genre.Romance
                ? "bg-pink-500"
                : genre === Genre.Thriller
                  ? "bg-amber-500"
                  : "bg-blue-500"
            }`}
          />
          {genre}
        </h2>
        <Link
          to="/browse/$genre"
          params={{ genre }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-crimson transition-colors"
        >
          See all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-2">
        {isLoading ? (
          <SkeletonCards count={5} />
        ) : (
          videos?.map((video, i) => (
            <VideoCard
              key={video.id.toString()}
              video={video}
              isPremium={isPremium}
              ocid={`home.video_card.${i + 1}`}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { isPremium } = useAuth();
  const { data: continueWatching, isLoading: cwLoading } =
    useContinueWatching();
  const { data: allVideos } = useListAllVideos();

  const heroVideo = useMemo(() => {
    if (!allVideos || allVideos.length === 0) return null;
    return allVideos.find((v) => !v.isPremiumOnly) ?? allVideos[0];
  }, [allVideos]);

  return (
    <main className="min-h-screen pb-16">
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        {heroVideo ? (
          <img
            src={`https://picsum.photos/seed/${heroVideo.id}/1200/500`}
            alt={heroVideo.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        {heroVideo && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-8 left-4 md:left-8 max-w-md"
          >
            <p className="text-xs text-crimson font-semibold uppercase tracking-widest mb-2">
              Featured Film
            </p>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight mb-3">
              {heroVideo.title}
            </h1>
            <p className="text-sm text-white/70 line-clamp-2 mb-4 hidden md:block">
              {heroVideo.description}
            </p>
            <Link to="/video/$id" params={{ id: heroVideo.id.toString() }}>
              <Button className="bg-crimson hover:bg-crimson/90 text-white gap-2 shadow-crimson">
                <Play className="w-4 h-4 fill-white" />
                Watch Now
              </Button>
            </Link>
          </motion.div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-0 md:px-8 mt-6">
        {!isPremium && (
          <div className="px-4 md:px-0 mb-6">
            <AdBanner />
          </div>
        )}

        {(cwLoading || (continueWatching && continueWatching.length > 0)) && (
          <section className="mt-2" data-ocid="home.continue_watching_section">
            <div className="flex items-center justify-between mb-4 px-4 md:px-0">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-crimson" />
                Continue Watching
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-2">
              {cwLoading ? (
                <SkeletonCards count={4} />
              ) : (
                continueWatching?.map((wp, i) => {
                  const video = allVideos?.find((v) => v.id === wp.videoId);
                  if (!video) return null;
                  return (
                    <VideoCard
                      key={wp.videoId.toString()}
                      video={video}
                      progress={wp}
                      isPremium={isPremium}
                      ocid={`home.video_card.${i + 1}`}
                    />
                  );
                })
              )}
            </div>
          </section>
        )}

        {[Genre.Romance, Genre.Thriller, Genre.Action].map((genre) => (
          <GenreRow key={genre} genre={genre} isPremium={isPremium} />
        ))}

        {!isPremium && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 mx-4 md:mx-0 rounded-2xl overflow-hidden relative"
          >
            <div className="bg-gradient-to-r from-crimson/20 via-crimson/10 to-transparent border border-crimson/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="text-xs font-semibold text-gold uppercase tracking-widest">
                    Premium
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">
                  Unlock Everything
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  No ads, unlimited access to all premium films, exclusive
                  content. Starting at just ₹100/month.
                </p>
              </div>
              <Link to="/premium">
                <Button className="bg-crimson hover:bg-crimson/90 text-white px-8 shadow-crimson whitespace-nowrap">
                  Get Premium
                </Button>
              </Link>
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
