import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { PokemonType, TrainerCategory, CardImageData } from "@/types/card";

interface CardImageProps {
  cardName: string;
  imageUrl?: string;
  largeImageUrl?: string;
  cardType?: string;
  isTrainer?: boolean;
  isPokemon?: boolean;
  isEnergy?: boolean;
  trainerCategory?: TrainerCategory;
  pokemonType?: PokemonType;
  count?: number;
  winRate?: number;
  showStats?: boolean;
  className?: string;
  size?: "small" | "medium" | "large";
}

export default function CardImage({
  cardName,
  imageUrl,
  largeImageUrl,
  cardType,
  isTrainer,
  isPokemon,
  isEnergy,
  trainerCategory,
  pokemonType,
  count,
  winRate,
  showStats = true,
  className = "",
  size = "medium"
}: CardImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showLarge, setShowLarge] = useState(false);

  const fetchCard = async () => {
    const response = await fetch(`/api/pokemon-card?name=${encodeURIComponent(cardName)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch card data");
    }
    const data = await response.json();
    return data as CardImageData;
  };

  const query = useQuery<CardImageData>({
    queryKey: ["/api/pokemon-card", cardName] as const,
    queryFn: fetchCard,
    enabled: !imageUrl && !!cardName,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const cardData = query.data;
  const isCardDataLoading = query.isLoading;
  const cardDataError = query.error;

  const finalImageUrl = imageUrl || cardData?.imageUrl;
  const finalLargeImageUrl = largeImageUrl || cardData?.largeImageUrl;

  const sizeClasses = {
    small: "w-full h-full",
    medium: "w-32 h-44",
    large: "w-40 h-56"
  };

  const getCardTypeColor = () => {
    if (isPokemon) {
      const typeColors: Record<string, string> = {
        Fire: "bg-red-500",
        Water: "bg-blue-500",
        Grass: "bg-green-500",
        Electric: "bg-yellow-500",
        Psychic: "bg-purple-500",
        Fighting: "bg-orange-500",
        Darkness: "bg-gray-800",
        Metal: "bg-gray-500",
        Fairy: "bg-pink-500",
        Dragon: "bg-indigo-500",
        Colorless: "bg-gray-400"
      };
      return typeColors[pokemonType || "Colorless"] || "bg-gray-400";
    }

    if (isTrainer) {
      const trainerColors: Record<string, string> = {
        Supporter: "bg-blue-600",
        Item: "bg-green-600",
        Stadium: "bg-purple-600",
        "Pok�mon Tool": "bg-orange-600"
      };
      return trainerColors[trainerCategory || "Item"] || "bg-gray-600";
    }

    if (isEnergy) return "bg-yellow-600";
    return "bg-gray-500";
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleCardClick = () => {
    if (finalLargeImageUrl) {
      setShowLarge(true);
    }
  };

  return (
    <>
      <Card className={`overflow-hidden ${className} hover:shadow-lg transition-shadow cursor-pointer`} onClick={handleCardClick}>
        <CardContent className="p-2">
          <div className={`relative ${sizeClasses[size]} mx-auto mb-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800`}>
            {(imageLoading || isCardDataLoading) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            )}

            {finalImageUrl && !imageError ? (
              <img
                src={finalImageUrl}
                alt={cardName}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-xs text-center px-1">{cardName}</span>
                {cardDataError && (
                  <span className="text-xs text-red-500 mt-1">Error cargando imagen</span>
                )}
              </div>
            )}

            <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${getCardTypeColor()}`} />
          </div>

          {showStats && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium truncate" title={cardName}>
                {cardName}
              </h4>

              <div className="flex flex-wrap gap-1">
                {isPokemon && pokemonType && (
                  <Badge variant="secondary" className="text-xs">
                    {pokemonType}
                  </Badge>
                )}
                {isTrainer && trainerCategory && (
                  <Badge variant="outline" className="text-xs">
                    {trainerCategory}
                  </Badge>
                )}
                {isEnergy && (
                  <Badge variant="outline" className="text-xs">
                    Energy
                  </Badge>
                )}
              </div>

              {count !== undefined && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Usado: {count} veces
                </div>
              )}

              {winRate !== undefined && (
                <div className="text-xs">
                  <span className={`${winRate >= 60 ? "text-green-600" : winRate >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                    {winRate.toFixed(1)}% victorias
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showLarge && finalLargeImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLarge(false)}
        >
          <div className="relative max-w-md max-h-[80vh]">
            <img
              src={finalLargeImageUrl}
              loading="eager"
              decoding="async"
              crossOrigin="anonymous"
              alt={cardName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg">
              <h3 className="font-medium">{cardName}</h3>
              {showStats && count !== undefined && winRate !== undefined && (
                <p className="text-sm">
                  {count} usos  {winRate.toFixed(1)}% victorias
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
