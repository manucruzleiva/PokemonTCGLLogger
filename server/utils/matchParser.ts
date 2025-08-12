export interface AttackData {
  pokemon: string;
  attack: string;
  damage: number;
  turn: number;
  player: string;
}

export interface ParsedMatch {
  player1: string;
  player2: string;
  winner: string;
  firstPlayer: string;
  turns: number;
  player1Pokemon: string[];
  player2Pokemon: string[];
  player1Cards: string[];
  player2Cards: string[];
  player1Prizes: number;
  player2Prizes: number;
  // New damage tracking fields
  player1TotalDamage: number;
  player2TotalDamage: number;
  attacksUsed: AttackData[];
  winCondition: string;
}

export function parseMatchLog(logText: string): ParsedMatch {
  if (!logText || typeof logText !== 'string') {
    // Return default values for invalid/empty log text
    return {
      player1: 'Player 1',
      player2: 'Player 2', 
      winner: 'Unknown',
      firstPlayer: 'Player 1',
      turns: 1,
      player1Pokemon: [],
      player2Pokemon: [],
      player1Cards: [],
      player2Cards: [],
      player1Prizes: 0,
      player2Prizes: 0,
      player1TotalDamage: 0,
      player2TotalDamage: 0,
      attacksUsed: [],
      winCondition: 'Prize cards'
    };
  }
  
  const lines = logText.split('\n').map(line => line.trim()).filter(line => line);
  
  let player1 = '';
  let player2 = '';
  let winner = '';
  let firstPlayer = '';
  let turns = 0;
  let player1Prizes = 0;
  let player2Prizes = 0;
  let player1TotalDamage = 0;
  let player2TotalDamage = 0;
  const attacksUsed: AttackData[] = [];
  const player1Pokemon = new Set<string>();
  const player2Pokemon = new Set<string>();
  const player1Cards = new Map<string, number>();
  const player2Cards = new Map<string, number>();
  let winCondition = '';

  // Extract players from setup section
  for (const line of lines) {
    // Get player names from coin flip or initial actions
    if (line.includes('chose heads for the opening coin flip')) {
      player1 = line.split(' chose heads')[0];
    } else if (line.includes('won the coin toss') && !player1) {
      player1 = line.split(' won the coin toss')[0];
    } else if (line.includes('drew 7 cards for the opening hand') && !player2) {
      const match = line.match(/^(\w+) drew 7 cards/);
      if (match && match[1] !== player1) {
        player2 = match[1];
      }
    }
    
    // Detect who went first - multiple patterns for better accuracy
    if (line.includes('decided to go first')) {
      const firstPlayerMatch = line.match(/(\w+) decided to go first/);
      if (firstPlayerMatch) {
        firstPlayer = firstPlayerMatch[1];
      }
    } else if (line.includes('chose to go first')) {
      firstPlayer = line.split(' chose to go first')[0];
    } else if (line.match(/^Turn # 1 - (\w+)'s Turn/)) {
      // Pattern: "Turn # 1 - PlayerName's Turn"
      const turnMatch = line.match(/^Turn # 1 - (\w+)'s Turn/);
      if (turnMatch && !firstPlayer) {
        firstPlayer = turnMatch[1];
      }
    } else if (line.match(/^Turn 1 \((\w+)\):/)) {
      const turnMatch = line.match(/^Turn 1 \((\w+)\):/);
      if (turnMatch && !firstPlayer) {
        firstPlayer = turnMatch[1];
      }
    }

    // Count turns
    if (line.match(/^Turn # (\d+)/)) {
      const turnMatch = line.match(/^Turn # (\d+)/);
      if (turnMatch) {
        turns = Math.max(turns, parseInt(turnMatch[1]));
      }
    }

    // Enhanced card extraction - captures ALL cards used by both players
    const currentPlayer = line.startsWith(player1) ? 'player1' : line.startsWith(player2) ? 'player2' : null;
    
    if (currentPlayer) {
      let cardName = '';
      let isPokemon = false;

      // Pattern 1: Pokemon played/summoned
      if (line.includes('played ') && (line.includes(' ex') || line.includes(' V') || line.includes('GX') || line.includes('VMAX') || line.includes('VStar') || line.includes('TAG TEAM'))) {
        const pokemonMatch = line.match(/played ([^.]+?)(?:\s+to|\.|$)/);
        if (pokemonMatch) {
          cardName = pokemonMatch[1].trim();
          isPokemon = true;
        }
      }
      
      // Pattern 2: Pokemon mentioned in attacks or abilities
      if (line.includes("'s ") && (line.includes(' used ') || line.includes(' ability '))) {
        const pokemonMatch = line.match(/(\w+)'s ([^.]+?) used/);
        if (pokemonMatch) {
          cardName = pokemonMatch[2].trim();
          isPokemon = true;
        }
      }

      // Pattern 3: Trainer cards, Items, Supporters, Stadiums
      if (line.includes('played ') && !isPokemon) {
        const cardMatch = line.match(/played ([^.]+?)(?:\s+(?:to|from|on|\.|$))/);
        if (cardMatch) {
          cardName = cardMatch[1].trim();
        }
      }

      // Pattern 4: Energy cards attached
      if (line.includes('attached ')) {
        const energyMatch = line.match(/attached ([^.]+?)(?:\s+(?:to|from|on|\.|$))/);
        if (energyMatch) {
          cardName = energyMatch[1].trim();
        }
      }

      // Pattern 5: Cards used (items, supporters, abilities)
      if (line.includes('used ') && !line.includes(' for ') && !line.includes(' damage')) {
        const usedMatch = line.match(/used ([^.]+?)(?:\s+(?:to|from|on|\.|$))/);
        if (usedMatch) {
          cardName = usedMatch[1].trim();
        }
      }

      // Pattern 6: Cards drawn or searched
      if (line.includes('drew ') || line.includes('searched ') || line.includes('put ')) {
        const drawMatch = line.match(/(?:drew|searched for|put) ([^.]+?)(?:\s+(?:from|into|to|\.|$))/);
        if (drawMatch) {
          cardName = drawMatch[1].trim();
        }
      }

      // Pattern 7: Evolution cards
      if (line.includes('evolved ') || line.includes('evolving ')) {
        const evolveMatch = line.match(/(?:evolved|evolving) ([^.]+?)(?:\s+(?:into|from|to|\.|$))/);
        if (evolveMatch) {
          cardName = evolveMatch[1].trim();
          isPokemon = true;
        }
      }

      // Clean up and validate card name
      if (cardName) {
        // Remove common suffixes and clarifications
        cardName = cardName.replace(/\s+from their hand$/, '');
        cardName = cardName.replace(/\s+to the Active Spot$/, '');
        cardName = cardName.replace(/\s+to the Bench$/, '');
        cardName = cardName.replace(/\s+from their deck$/, '');
        cardName = cardName.replace(/\s+into their hand$/, '');
        cardName = cardName.replace(/\s+on top of their deck$/, '');
        cardName = cardName.replace(/\s+in play$/, '');
        cardName = cardName.replace(/\(\d+x?\)$/, ''); // Remove count indicators
        
        // Remove card codes (e.g., sv10_185, PAL_123, etc.)
        cardName = cardName.replace(/\s+[a-z0-9]+_\d+$/i, ''); // Remove codes like sv10_185
        cardName = cardName.replace(/\s+[A-Z]{2,4}\s+\d+$/, ''); // Remove codes like PAL 123
        
        // Skip generic actions, numbers, or very short names
        const skipPatterns = [
          'Prize card', 'prize card', 'cards', 'card', 'damage', 'turn', 'hand',
          'deck', 'discard pile', 'bench', 'active', 'knocked out', 'ko',
          /^\d+$/, /^[a-z]{1,2}$/i
        ];
        
        const shouldSkip = skipPatterns.some(pattern => 
          typeof pattern === 'string' ? cardName.includes(pattern) : pattern.test(cardName)
        );
        
        if (!shouldSkip && cardName.length > 2) {
          if (isPokemon) {
            if (currentPlayer === 'player1') {
              player1Pokemon.add(cardName);
            } else {
              player2Pokemon.add(cardName);
            }
          }
          
          // Add to general cards list regardless of type
          if (currentPlayer === 'player1') {
            player1Cards.set(cardName, (player1Cards.get(cardName) || 0) + 1);
          } else {
            player2Cards.set(cardName, (player2Cards.get(cardName) || 0) + 1);
          }
        }
      }
    }

    // Extract winner
    if (line.includes('wins.')) {
      const winnerMatch = line.match(/(\w+) wins\./);
      if (winnerMatch) {
        winner = winnerMatch[1];
      }
    }

    // Parse attacks and damage dealt
    if (line.includes('used ') && (line.includes(' for ') || line.includes(' and did ') || line.includes('damage'))) {
      const currentTurn = Math.max(1, turns);
      
      // Pattern: "PlayerName used AttackName for 120 damage" or "PlayerName's Pokemon used AttackName for 120 damage"
      let damageMatch = line.match(/(\w+)'s (.+?) used (.+?) for (\d+) damage/);
      let attacker, pokemon, attackName, damage;
      
      if (damageMatch) {
        attacker = damageMatch[1];
        pokemon = damageMatch[2].trim();
        attackName = damageMatch[3].trim();
        damage = parseInt(damageMatch[4]);
      } else {
        // Fallback pattern: "PlayerName used AttackName for 120 damage"
        const simpleDamageMatch = line.match(/(\w+) used ([^.]+?) for (\d+) damage/);
        if (simpleDamageMatch) {
          attacker = simpleDamageMatch[1];
          attackName = simpleDamageMatch[2].trim();
          damage = parseInt(simpleDamageMatch[3]);
          pokemon = 'Unknown Pokemon';
        }
      }
      
      if (attacker && attackName && damage && pokemon) {
        
        attacksUsed.push({
          pokemon,
          attack: attackName,
          damage,
          turn: currentTurn,
          player: attacker === player1 ? 'player1' : 'player2'
        });
        
        if (attacker === player1) {
          player1TotalDamage += damage;
        } else if (attacker === player2) {
          player2TotalDamage += damage;
        }
      }
    }

    // Count prizes taken
    if (line.includes('took a Prize card') || line.includes('took 2 Prize cards') || line.includes('took 3 Prize cards')) {
      const prizeMatch = line.match(/(\w+) took (\d+|\w+) Prize cards?/);
      if (prizeMatch) {
        const playerName = prizeMatch[1];
        let prizeCount = 1; // Default to 1 if not specified
        
        if (prizeMatch[2] === 'a') {
          prizeCount = 1;
        } else if (prizeMatch[2] === '2' || prizeMatch[2] === 'two') {
          prizeCount = 2;
        } else if (prizeMatch[2] === '3' || prizeMatch[2] === 'three') {
          prizeCount = 3;
        }

        if (playerName === player1) {
          player1Prizes += prizeCount;
        } else if (playerName === player2) {
          player2Prizes += prizeCount;
        }
      }
    }
  }

  // Extract win condition and find winner if not already found
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check for the 4 main win conditions in priority order (most specific first)
    if (lowerLine.includes('deck ran out of cards') || lowerLine.includes('ran out of cards') || lowerLine.includes('no cards left')) {
      winCondition = 'Deck out';
      const winnerMatch = line.match(/(\w+) wins\./);
      if (winnerMatch) {
        winner = winnerMatch[1];
      }
    } else if (lowerLine.includes('conceded') || lowerLine.includes('concede')) {
      winCondition = 'Concede';
      
      // Handle "Opponent conceded. PlayerName wins." pattern
      if (lowerLine.includes('opponent conceded')) {
        const winnerMatch = line.match(/(\w+) wins\./i);
        if (winnerMatch) {
          winner = winnerMatch[1];
        }
      } else {
        // Handle "PlayerName conceded" pattern
        const concededMatch = line.match(/(\w+) (?:conceded|has conceded|concedes)/i);
        if (concededMatch) {
          // The player who conceded loses, so winner is the other player
          const concedingPlayer = concededMatch[1];
          if (concedingPlayer === player1) {
            winner = player2;
          } else if (concedingPlayer === player2) {
            winner = player1;
          }
        }
      }
    } else if (lowerLine.includes('ran out of pokemon') || lowerLine.includes('no pokemon left') || lowerLine.includes('all pokemon knocked out')) {
      winCondition = 'Ran out of pokemon in bench';
      const winnerMatch = line.match(/(\w+) wins\./);
      if (winnerMatch) {
        winner = winnerMatch[1];
      }
    } else if (lowerLine.includes('all prize cards taken') || lowerLine.includes('6 prize cards') || lowerLine.includes('game completed')) {
      winCondition = 'Prize cards';
      const winnerMatch = line.match(/(\w+) wins\./);
      if (winnerMatch) {
        winner = winnerMatch[1];
      }
    }
    
    // Extract winner from direct win statements
    if (line.includes('wins.') && !winner) {
      const winnerMatch = line.match(/(\w+) wins\./);
      if (winnerMatch) {
        winner = winnerMatch[1];
      }
    }
  }
  
  // If no specific win condition found but we have a winner, default to prize cards
  if (!winCondition && winner) {
    winCondition = 'Prize cards';
  }
  
  // Default win condition if still not found
  if (!winCondition) {
    winCondition = 'Prize cards';
  }

  // Convert card maps to arrays with counts
  const player1CardsArray = Array.from(player1Cards.entries())
    .map(([card, count]) => `${card} (${count}x)`)
    .slice(0, 20); // Limit to top 20 most used cards
    
  const player2CardsArray = Array.from(player2Cards.entries())
    .map(([card, count]) => `${card} (${count}x)`)
    .slice(0, 20);

  return {
    player1: player1 || 'Player 1',
    player2: player2 || 'Player 2',
    winner: winner || player1 || 'Unknown',
    firstPlayer: firstPlayer || player1 || 'Player 1',
    turns: turns || 1,
    player1Pokemon: Array.from(player1Pokemon), // Include ALL Pokemon (no limit)
    player2Pokemon: Array.from(player2Pokemon), // Include ALL Pokemon (no limit)
    player1Cards: player1CardsArray,
    player2Cards: player2CardsArray,
    player1Prizes,
    player2Prizes,
    player1TotalDamage,
    player2TotalDamage,
    attacksUsed,
    winCondition: winCondition || 'Unknown',
  };
}

export function generateMatchTitle(parsed: ParsedMatch, timestamp: number): string {
  return `${parsed.player1} vs ${parsed.player2} - Partida #${timestamp}`;
}