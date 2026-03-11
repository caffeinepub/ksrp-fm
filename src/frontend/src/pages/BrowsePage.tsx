import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Genre } from "../backend.d";
import VideoCard, { SkeletonCards } from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import { useListVideosByGenre } from "../hooks/useQueries";

const GENRES = [Genre.Romance, Genre.Thriller, Genre.Action];

export default function BrowsePage() {
  const { genre } = useParams({ from: "/layout/browse/$genre" });
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  const activeGenre = (
    GENRES.includes(genre as Genre) ? genre : Genre.Romance
  ) as Genre;
  const { data: videos, isLoading } = useListVideosByGenre(activeGenre);

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <h1 className="font-display font-bold text-2xl md:text-3xl mb-6">
          Browse Films
        </h1>

        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {GENRES.map((g) => (
            <Button
              key={g}
              variant={activeGenre === g ? "default" : "outline"}
              size="sm"
              onClick={() =>
                navigate({ to: "/browse/$genre", params: { genre: g } })
              }
              data-ocid="browse.genre_tab"
              className={`whitespace-nowrap ${
                activeGenre === g
                  ? "bg-crimson hover:bg-crimson/90 text-white border-crimson"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-wrap gap-4">
            <SkeletonCards count={12} />
          </div>
        ) : videos && videos.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {videos.map((video, i) => (
              <motion.div
                key={video.id.toString()}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="w-full"
              >
                <VideoCard
                  video={video}
                  isPremium={isPremium}
                  ocid={`browse.video_card.${i + 1}`}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="browse.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <span className="text-3xl">🎬</span>
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              No films yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Check back soon for {activeGenre} content.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
