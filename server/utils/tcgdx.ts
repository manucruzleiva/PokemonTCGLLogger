import memoize from 'memoizee';

export interface TCGdxCard {
  id: string;
  name: string;
  category: string; // "Pokemon" | "Trainer" | "Energy"
  types?: string[]; // For Pokemon cards
  subTypes?: string[]; // For detailed classification
  image?: string;
  rarity?: string;
  set?: {
    id: string;
    name: string;
  };
}

class TCGdxAPI {
  private baseUrl = 'https://api.tcgdx.dev/v2/en';
  private cache = new Map<string, TCGdxCard | null>();

  // Memoized API call with 24-hour cache
  private fetchCardInfo = memoize(
    async (cardName: string): Promise<TCGdxCard | null> => {
      try {
        console.log(`Fetching card data from TCGdx for: ${cardName}`);
        
        // Search for card by name (try different URL format)
        const searchUrl = `https://api.tcgdx.dev/v2/en/cards?q=name:${encodeURIComponent(cardName)}`;
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
          console.log(`TCGdx API error: ${response.status}`);
          return null;
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log(`No card found for: ${cardName}`);
          return null;
        }
        
        // Get the first match (most relevant)
        const card = data[0];
        
        const cardInfo: TCGdxCard = {
          id: card.id,
          name: card.name,
          category: card.category || 'Unknown',
          types: card.types || [],
          subTypes: card.subTypes || [],
          image: card.image,
          rarity: card.rarity,
          set: card.set ? {
            id: card.set.id,
            name: card.set.name
          } : undefined
        };
        
        console.log(`TCGdx card found: ${cardInfo.name} - Category: ${cardInfo.category}, SubTypes: ${cardInfo.subTypes?.join(', ')}`);
        return cardInfo;
        
      } catch (error) {
        console.error(`Error fetching from TCGdx for ${cardName}:`, error);
        return null;
      }
    },
    { 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      max: 1000,
      promise: true
    }
  );

  async getCardInfo(cardName: string): Promise<TCGdxCard | null> {
    // Clean card name for better matching
    const cleanName = cardName
      .replace(/\s*\(\d+x\)$/, '') // Remove quantity
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    return await this.fetchCardInfo(cleanName);
  }

  // Helper method to classify card based on TCGdx data
  classifyCard(cardInfo: TCGdxCard): {
    isPokemon: boolean;
    isTrainer: boolean;
    isEnergy: boolean;
    isItem: boolean;
    isTool: boolean;
    isSupporter: boolean;
    isStadium: boolean;
    isBasicEnergy: boolean;
  } {
    const category = cardInfo.category?.toLowerCase() || '';
    const subTypes = cardInfo.subTypes || [];
    const subTypesLower = subTypes.map(s => s.toLowerCase());
    
    const isPokemon = category === 'pokemon';
    const isTrainer = category === 'trainer';
    const isEnergy = category === 'energy';
    
    // Detailed trainer classification
    const isItem = isTrainer && subTypesLower.includes('item');
    const isTool = isTrainer && subTypesLower.includes('tool');
    const isSupporter = isTrainer && subTypesLower.includes('supporter');
    const isStadium = isTrainer && subTypesLower.includes('stadium');
    
    // Energy classification
    const isBasicEnergy = isEnergy && subTypesLower.includes('basic');
    
    return {
      isPokemon,
      isTrainer,
      isEnergy,
      isItem,
      isTool,
      isSupporter,
      isStadium,
      isBasicEnergy
    };
  }
}

export const tcgdxApi = new TCGdxAPI();