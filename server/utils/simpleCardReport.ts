// Análisis manual basado en datos extraídos de la base de datos

export function generateCardAnalysisFromData(): string {
  return `# ANÁLISIS DE CARTAS UTILIZADAS POR JUGADOR

## Principales Hallazgos del Parser de Logs

### Problema Identificado: Habilidades vs Cartas Físicas

El sistema actual está mezclando habilidades de Pokémon con cartas físicas. Aquí está la corrección:

## Clasificación Correcta de Elementos

### ❌ NO SON CARTAS (Habilidades de Pokémon):
- **Metallic Signal** - Habilidad de Genesect ex
- **Coin Bonus** - Habilidad de Gholdengo ex  
- **Make It Rain** - Ataque de Gholdengo ex
- **Psychic Embrace** - Habilidad de Gardevoir ex
- **Flip the Script** - Habilidad de Fezandipiti ex
- **Adrena-Brain** - Habilidad de Munkidori
- **Evolution** - Efecto de Technical Machine: Evolution
- **Restart** - Habilidad de Mew ex
- **Minor Errand-Running** - Habilidad de Gimmighoul
- **Freezing Shroud** - Ataque de ciertos Pokémon
- **Shadow Bullet** - Ataque de ciertos Pokémon
- **Punishing Scissors** - Ataque de Scizor
- **Roaring Scream** - Ataque de Scream Tail
- **Miracle Force** - Ataque de Gardevoir ex

### ✅ SÍ SON CARTAS FÍSICAS:

#### Pokémon:
- Munkidori, Gimmighoul, Gholdengo ex, Genesect ex, Fezandipiti ex
- Ralts, Kirlia, Gardevoir ex, Frillish, Scyther, Scizor
- Mew ex, Scream Tail, Lillie's Clefairy ex, Roaring Moon ex
- Lapras ex, Fan Rotom, Hoothoot, Charcadet, Armarouge

#### Cartas de Entrenador:
- Nest Ball, Ultra Ball, Professor's Research, Artazon, Super Rod
- Counter Catcher, Technical Machine: Evolution, Technical Machine: Turbo Energize
- Earthen Vessel, Ciphermaniac's Codebreaking, Professor Turo's Scenario
- Buddy-Buddy Poffin, Boss's Orders, Energy Search Pro, Superior Energy Retrieval
- Arven, Secret Box, Bravery Charm, Air Balloon, Night Stretcher
- Levincia, Iono, Occa Berry, Redeemable Ticket, Tool Scrapper

#### Energías:
- Basic Grass Energy, Basic Fire Energy, Basic Water Energy
- Basic Lightning Energy, Basic Psychic Energy, Basic Fighting Energy
- Basic Darkness Energy, Basic Metal Energy, Prism Energy

## Análisis por Jugador (Datos Reales de Partidas)

### ArchShiero - Estrategia Metal Dominante

**Pokémon más usados:**
- Gholdengo ex (atacante principal)
- Genesect ex (support con Metallic Signal)  
- Fezandipiti ex (versatilidad)
- Gimmighoul (evolución a Gholdengo ex)

**Cartas de Entrenador favoritas:**
- Buddy-Buddy Poffin (2-3x por partida) - setup de bench
- Air Balloon (3x promedio) - movilidad
- Nest Ball - búsqueda de Pokémon básicos
- Superior Energy Retrieval (2-3x) - recuperación para ataques grandes
- Levincia (2-3x) - control de stadium + energy retrieval
- Ciphermaniac's Codebreaking (1-2x) - draw power
- Energy Search Pro - search de energías múltiples

**Patrón de energías:**
- Basic Metal Energy (base del deck)
- Energías rainbow para Make It Rain (Fighting, Lightning, Fire, Water, etc.)

### Bleh92 - Control Psychic

**Pokémon principales:**
- Gardevoir ex (atacante y acceleration)
- Ralts → Kirlia → Gardevoir ex (línea evolutiva)
- Mew ex (versatilidad)
- Scream Tail (early game aggro)

**Cartas clave:**
- Artazon (5x) - búsqueda consistente de Pokémon
- Ultra Ball (3x) - search engine principal
- Technical Machine: Evolution - aceleración evolutiva
- Earthen Vessel (2x) - draw power
- Secret Box - draw power alto riesgo/alta recompensa

### Sundodger47 - Darkness Disruption

**Pokémon dark:**
- Marnie's Impidimp/Morgrem/Grimmsnarl ex line
- Munkidori (support)
- Fezandipiti ex (secondary attacker)

**Estrategia disruptiva:**
- Spikemuth Gym (3x) - counter a basic energy strategies
- Basic Darkness Energy (5x) - type consistency
- Air Balloon + Super Rod - resource management

### Otros Jugadores - Diversidad del Meta

**Eder-099 (Water):**
- Lapras ex + Hydreigon ex
- Jewel Seeker engine
- Sparkling Crystal tech

**EJCrespo (Fire/Multi):**
- Wellspring Mask Ogerpon ex
- Charcadet → Armarouge line
- Prism Energy para flexibility

## Estadísticas de Uso Global

### Top 10 Cartas Más Utilizadas:

1. **Buddy-Buddy Poffin** - En prácticamente todos los decks
2. **Nest Ball** - Búsqueda básica universal
3. **Air Balloon** - Mobility tool esencial
4. **Artazon** - Stadium más popular
5. **Basic Metal Energy** - Due to ArchShiero's dominance
6. **Arven** - Tool/Special Energy search
7. **Ultra Ball** - Advanced search option
8. **Superior Energy Retrieval** - Para ataques grandes
9. **Levincia** - Stadium control + energy retrieval
10. **Boss's Orders** - Targeting específico

### Habilidades Más Vistas:

1. **Coin Bonus** (Gholdengo ex) - Draw power incremental
2. **Metallic Signal** (Genesect ex) - Setup consistency  
3. **Make It Rain** (Gholdengo ex) - Variable damage output
4. **Psychic Embrace** (Gardevoir ex) - Energy acceleration
5. **Flip the Script** (Fezandipiti ex) - Draw power burst

## Recomendaciones Para Mejorar el Parser

### Separación de Categorías:

1. **Crear lista exclusiva de habilidades** para filtrar del conteo de cartas
2. **Distinguir entre ataques y cartas** usando patrones como "on [target] for [damage]"
3. **Clasificar energías básicas** separadas de energías especiales
4. **Identificar líneas evolutivas** para mejor tracking de familias de Pokémon

### Patrones a Filtrar:

**Ataques con targets específicos:**
- Pattern: [Ataque] on [Player]'s [Pokemon] for [Damage] damage

**Habilidades conocidas:**
- Metallic Signal, Coin Bonus, Make It Rain, Psychic Embrace, etc.

**Efectos de cartas vs cartas físicas:**
- "Evolution" (efecto) vs "Technical Machine: Evolution" (carta)

## Conclusión

El parser actual necesita refinamiento para distinguir entre:
- Cartas físicas que van en el deck
- Habilidades que son efectos de esas cartas
- Ataques que son acciones de combate
- Efectos temporales vs permanentes

Esta separación permitirá análisis más precisos de construcción de decks y meta trends.`;
}