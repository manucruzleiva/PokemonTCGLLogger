interface PokemonTCGCard {
  id: string;
  name: string;
  supertype: "Pokémon" | "Trainer" | "Energy";
  subtypes?: string[];
  types?: string[];
  hp?: string;
  attacks?: Array<{
    name: string;
    cost: string[];
    damage: string;
    text?: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  resistances?: Array<{
    type: string;
    value: string;
  }>;
  retreatCost?: string[];
  rarity?: string;
  set?: {
    id: string;
    name: string;
  };
  images?: {
    small: string;
    large: string;
  };
}

interface CardInfo {
  name: string;
  supertype: "Pokémon" | "Trainer" | "Energy" | "Unknown";
  subtype?: string;
  pokemonType?: string;
  isTrainer: boolean;
  isPokemon: boolean;
  isEnergy: boolean;
  trainerCategory?: "Item" | "Supporter" | "Stadium" | "Pokémon Tool" | "ACE SPEC";
  energyType?: string;
  description?: string;
  imageUrl?: string;
  largeImageUrl?: string;
  cardId?: string;
}

export class CardDatabase {
  private cardCache = new Map<string, CardInfo>();
  private lastCacheUpdate = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly API_BASE = "https://api.pokemontcg.io/v2";

  /**
   * Get card information from the Pokemon TCG API
   */
  async getCardInfo(cardName: string): Promise<CardInfo> {
    const normalizedName = this.normalizeCardName(cardName);
    
    // Check cache first
    if (this.cardCache.has(normalizedName)) {
      return this.cardCache.get(normalizedName)!;
    }

    try {
      // Search for the card in the Pokemon TCG API
      const searchUrl = `${this.API_BASE}/cards?q=name:"${encodeURIComponent(normalizedName)}"&pageSize=1`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        console.warn(`Failed to fetch card data for ${cardName}: ${response.status}`);
        return this.createUnknownCardInfo(cardName);
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const card: PokemonTCGCard = data.data[0];
        const cardInfo = this.processCardData(card);
        this.cardCache.set(normalizedName, cardInfo);
        return cardInfo;
      } else {
        // Try fuzzy search if exact match fails
        return await this.fuzzySearchCard(cardName);
      }
    } catch (error) {
      console.error(`Error fetching card data for ${cardName}:`, error);
      return this.createUnknownCardInfo(cardName);
    }
  }

  /**
   * Batch process multiple cards
   */
  async getMultipleCardInfo(cardNames: string[]): Promise<Map<string, CardInfo>> {
    const results = new Map<string, CardInfo>();
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < cardNames.length; i += batchSize) {
      const batch = cardNames.slice(i, i + batchSize);
      const promises = batch.map(name => this.getCardInfo(name));
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.set(batch[index], result.value);
        } else {
          results.set(batch[index], this.createUnknownCardInfo(batch[index]));
        }
      });
      
      // Small delay between batches to be respectful to the API
      if (i + batchSize < cardNames.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  private async fuzzySearchCard(cardName: string): Promise<CardInfo> {
    try {
      // Remove common suffixes and try again
      const cleanName = cardName
        .replace(/\s+(ex|EX|gx|GX|v|V|vmax|VMAX|vstar|VSTAR)$/i, '')
        .replace(/\s+\d+$/, '') // Remove numbers at the end
        .trim();

      if (cleanName !== cardName) {
        const searchUrl = `${this.API_BASE}/cards?q=name:"${encodeURIComponent(cleanName)}"&pageSize=1`;
        const response = await fetch(searchUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const card: PokemonTCGCard = data.data[0];
            const cardInfo = this.processCardData(card);
            this.cardCache.set(this.normalizeCardName(cardName), cardInfo);
            return cardInfo;
          }
        }
      }
    } catch (error) {
      console.error(`Error in fuzzy search for ${cardName}:`, error);
    }

    return this.createUnknownCardInfo(cardName);
  }

  private processCardData(card: PokemonTCGCard): CardInfo {
    const cardInfo: CardInfo = {
      name: card.name,
      supertype: card.supertype,
      isPokemon: card.supertype === "Pokémon",
      isTrainer: card.supertype === "Trainer",
      isEnergy: card.supertype === "Energy",
      cardId: card.id,
      imageUrl: card.images?.small,
      largeImageUrl: card.images?.large
    };

    // Add Pokemon-specific info
    if (card.supertype === "Pokémon") {
      cardInfo.pokemonType = card.types?.[0] || "Colorless";
      cardInfo.subtype = card.subtypes?.[0];
    }

    // Add Trainer-specific info
    if (card.supertype === "Trainer") {
      if (card.subtypes) {
        const subtype = card.subtypes[0];
        if (["Item", "Supporter", "Stadium", "Pokémon Tool", "ACE SPEC"].includes(subtype)) {
          cardInfo.trainerCategory = subtype as CardInfo["trainerCategory"];
        }
      }
    }

    // Add Energy-specific info
    if (card.supertype === "Energy") {
      cardInfo.energyType = card.subtypes?.[0] || "Basic";
    }

    return cardInfo;
  }

  private createUnknownCardInfo(cardName: string): CardInfo {
    // Try to infer card type from name patterns
    const lowerName = cardName.toLowerCase();
    
    // Common trainer card patterns
    if (lowerName.includes("professor") || 
        lowerName.includes("researcher") ||
        lowerName.includes("sycamore") ||
        lowerName.includes("juniper") ||
        lowerName.includes("oak") ||
        lowerName.includes("cynthia") ||
        lowerName.includes("marnie") ||
        lowerName.includes("n ")) {
      return {
        name: cardName,
        supertype: "Trainer",
        isPokemon: false,
        isTrainer: true,
        isEnergy: false,
        trainerCategory: "Supporter"
      };
    }

    // Common item patterns
    if (lowerName.includes("ball") ||
        lowerName.includes("potion") ||
        lowerName.includes("vessel") ||
        lowerName.includes("device") ||
        lowerName.includes("machine") ||
        lowerName.includes("tool") ||
        lowerName.includes("switch")) {
      return {
        name: cardName,
        supertype: "Trainer",
        isPokemon: false,
        isTrainer: true,
        isEnergy: false,
        trainerCategory: "Item"
      };
    }

    // Energy patterns
    if (lowerName.includes("energy")) {
      return {
        name: cardName,
        supertype: "Energy",
        isPokemon: false,
        isTrainer: false,
        isEnergy: true,
        energyType: "Basic"
      };
    }

    // Default to Unknown if we can't determine
    return {
      name: cardName,
      supertype: "Unknown",
      isPokemon: false,
      isTrainer: false,
      isEnergy: false
    };
  }

  private normalizeCardName(name: string): string {
    return name
      .replace(/^\([a-zA-Z0-9_]+\)\s*/, '') // Remove card codes like (sv7_28) at the beginning
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Categorize cards for enhanced analysis
   */
  categorizeCards(cardInfoMap: Map<string, CardInfo>) {
    const categories = {
      pokemon: [] as Array<{name: string, type?: string}>,
      trainers: {
        supporters: [] as string[],
        items: [] as string[],
        stadiums: [] as string[],
        tools: [] as string[]
      },
      energy: {
        basic: [] as string[],
        special: [] as string[]
      },
      unknown: [] as string[]
    };

    for (const [name, info] of Array.from(cardInfoMap.entries())) {
      if (info.isPokemon) {
        categories.pokemon.push({
          name,
          type: info.pokemonType
        });
      } else if (info.isTrainer) {
        switch (info.trainerCategory) {
          case "Supporter":
            categories.trainers.supporters.push(name);
            break;
          case "Item":
            categories.trainers.items.push(name);
            break;
          case "Stadium":
            categories.trainers.stadiums.push(name);
            break;
          case "Pokémon Tool":
            categories.trainers.tools.push(name);
            break;
          default:
            categories.trainers.items.push(name); // Default trainers to items
        }
      } else if (info.isEnergy) {
        if (info.energyType === "Basic") {
          categories.energy.basic.push(name);
        } else {
          categories.energy.special.push(name);
        }
      } else {
        categories.unknown.push(name);
      }
    }

    return categories;
  }
}

export const cardDatabase = new CardDatabase();