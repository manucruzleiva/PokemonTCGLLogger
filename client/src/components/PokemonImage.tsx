import { useState, useEffect } from 'react';
import { fetchPokemon, getPokemonImageUrl, getPokemonTypeColor, type Pokemon } from '../services/pokeapi';

interface PokemonImageProps {
  pokemonName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showFallback?: boolean;
}

export default function PokemonImage({ 
  pokemonName, 
  size = 'md', 
  className = '', 
  showFallback = true 
}: PokemonImageProps) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  useEffect(() => {
    if (!pokemonName) {
      setIsLoading(false);
      return;
    }

    const loadPokemon = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const pokemonData = await fetchPokemon(pokemonName);
        setPokemon(pokemonData);
        
        if (!pokemonData) {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error loading Pokemon:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadPokemon();
  }, [pokemonName]);

  const imageUrl = getPokemonImageUrl(pokemon);
  const typeColor = getPokemonTypeColor(pokemon);

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex items-center justify-center`}>
        <div className="text-xs">⚡</div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    if (!showFallback) return null;
    
    return (
      <div className={`${sizeClasses[size]} ${className} ${typeColor} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
        {pokemonName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <img
        src={imageUrl}
        alt={pokemonName}
        className="w-full h-full object-contain rounded-full bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600"
        onError={() => setHasError(true)}
        title={pokemonName}
      />
      {/* Type indicator dot */}
      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${typeColor} rounded-full border-2 border-white dark:border-gray-800`}></div>
    </div>
  );
}