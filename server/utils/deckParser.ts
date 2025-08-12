export interface ParsedDeck {
  pokemonCards: string[];
  trainerCards: string[];
  energyCards: string[];
  totalCards: number;
}

export function parseDeckList(deckList: string): ParsedDeck {
  const lines = deckList.split('\n').map(line => line.trim()).filter(line => line);
  
  const pokemonCards: string[] = [];
  const trainerCards: string[] = [];
  const energyCards: string[] = [];
  let currentSection = '';
  let totalCards = 0;

  for (const line of lines) {
    // Section headers
    if (line.startsWith('Pokémon:') || line.startsWith('Pokemon:')) {
      currentSection = 'pokemon';
      continue;
    } else if (line.startsWith('Trainer:')) {
      currentSection = 'trainer';
      continue;
    } else if (line.startsWith('Energy:')) {
      currentSection = 'energy';
      continue;
    }

    // Skip section count lines like "17" or "35"
    if (/^\d+$/.test(line)) {
      continue;
    }

    // Parse card lines like "3 Marnie's Impidimp DRI 134"
    const cardMatch = line.match(/^(\d+)\s+(.+)$/);
    if (cardMatch) {
      const count = parseInt(cardMatch[1]);
      const cardName = cardMatch[2];
      const fullEntry = `${count} ${cardName}`;
      
      totalCards += count;

      switch (currentSection) {
        case 'pokemon':
          pokemonCards.push(fullEntry);
          break;
        case 'trainer':
          trainerCards.push(fullEntry);
          break;
        case 'energy':
          energyCards.push(fullEntry);
          break;
      }
    }
  }

  return {
    pokemonCards,
    trainerCards,
    energyCards,
    totalCards
  };
}

export function generateDeckListExport(pokemonUsed: string[]): string {
  // Estimate deck composition based on Pokemon used
  const estimatedDeck: string[] = [];
  
  // Add Pokemon section
  estimatedDeck.push('Pokémon: (estimado)');
  pokemonUsed.forEach(pokemon => {
    // Estimate 2-3 copies of each Pokemon
    const copies = pokemon.includes('ex') || pokemon.includes('V') ? 2 : 3;
    estimatedDeck.push(`${copies} ${pokemon}`);
  });
  
  estimatedDeck.push('');
  estimatedDeck.push('Trainer: (estimado)');
  estimatedDeck.push('4 Professor\'s Research');
  estimatedDeck.push('4 Ultra Ball');
  estimatedDeck.push('3 Nest Ball');
  estimatedDeck.push('2 Boss\'s Orders');
  estimatedDeck.push('2 Switch');
  estimatedDeck.push('// Agregar más cartas de entrenador según sea necesario');
  
  estimatedDeck.push('');
  estimatedDeck.push('Energy: (estimado)');
  estimatedDeck.push('// Ajustar tipos de energía según los Pokémon usados');
  
  return estimatedDeck.join('\n');
}

export function validateDeckList(deckList: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseDeckList(deckList);
  
  if (parsed.totalCards !== 60) {
    errors.push(`El mazo debe tener exactamente 60 cartas. Actual: ${parsed.totalCards}`);
  }
  
  if (parsed.pokemonCards.length === 0) {
    errors.push('El mazo debe incluir al menos un Pokémon');
  }
  
  if (parsed.energyCards.length === 0) {
    errors.push('El mazo debe incluir al menos una carta de energía');
  }
  
  // Check for card count limits (max 4 copies of any card except basic energy)
  const cardCounts = new Map<string, number>();
  
  [...parsed.pokemonCards, ...parsed.trainerCards, ...parsed.energyCards].forEach(cardEntry => {
    const match = cardEntry.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const count = parseInt(match[1]);
      const cardName = match[2];
      
      // Allow unlimited basic energy cards
      if (!cardName.toLowerCase().includes('basic') || !cardName.toLowerCase().includes('energy')) {
        if (count > 4) {
          errors.push(`Máximo 4 copias por carta: ${cardName} (${count} encontradas)`);
        }
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}