export type PokemonType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic' | 
  'Fighting' | 'Darkness' | 'Metal' | 'Fairy' | 'Dragon' | 'Colorless';

export type TrainerCategory = 'Supporter' | 'Item' | 'Stadium' | 'Pokémon Tool';

export interface CardImageData {
  name: string;
  imageUrl: string | null;
  largeImageUrl: string | null;
  cardId: string;
  set: string | null;
  rarity: string | null;
  type: string | null;
}

export interface CardResponse {
  data: CardImageData;
}