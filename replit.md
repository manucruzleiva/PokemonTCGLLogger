# Overview

Pokémon Trainer Academia is a repository application for Pokémon TCG Live match logs. It enables users to store, organize, and automatically parse their match logs to extract detailed game data, including players, Pokémon, winner, turns, and comprehensive card usage. The application provides a searchable interface for viewing and filtering match history, aiming to offer strategic insights and a centralized platform for Pokémon TCG players to analyze their gameplay.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (August 11, 2025)
- ✅ **Win Condition Tracking**: Added `winCondition` database column and parser logic to extract why players won matches (Prize cards, Opponent conceded, Deck out, etc.)
- ✅ **Enhanced Match Parser**: Completely rewritten card extraction algorithm to capture ALL cards used by both players, including Pokemon, trainers, items, supporters, stadiums, and energy cards
- ✅ **Comprehensive Card Detection**: Improved pattern matching for 7 different card usage patterns (played, used, attached, evolved, searched, drew, abilities)  
- ✅ **Database Re-parsing**: Successfully re-parsed all 67 existing matches with enhanced parser, extracting significantly more card data + win conditions
- ✅ **Complete Pokemon Extraction**: Removed artificial limits on Pokemon extraction - now captures all Pokemon mentioned in match logs
- ✅ **Card Code Cleanup**: Parser now removes card codes (like sv10_185, PAL 123) from card names for cleaner data across all statistics displays
- ✅ **Pokemon Image Integration**: Added PokeAPI integration to display Pokemon images alongside names in statistics pages using official sprites
- ✅ **Pokemon Validation System**: Implemented intelligent filtering to show only authentic Pokemon in statistics (excludes trainer cards and invalid names)
- ✅ **Uploader Assignment**: Automatically assigned uploaders to all 23 matches that were missing this data based on player names
- ✅ **Home Page Reconstruction**: Converted home page to "under construction" while maintaining functional statistics page
- ✅ **Statistics Page Restoration**: Created comprehensive statistics page with player rankings, card analysis, damage records, and win condition breakdowns
- ✅ **Complete Stats Page**: Created new /stats route with full statistical analysis including top 15 players, cards, Pokemon, recent activity, and comprehensive metrics
- ✅ **Damage Metrics Removal**: Completely removed average damage and damage record metrics from both statistics pages per user request
- ✅ **Blacklist System Implementation**: Added filtering system excluding "Earthen Vessel" from Pokemon statistics and all basic energies from card statistics

# System Architecture

## Frontend
- **Framework**: React with TypeScript (Vite build tool)
- **UI/UX**: Shadcn/ui component library, Radix UI primitives, Tailwind CSS with custom Material Design-inspired theming. Features responsive design with mobile hamburger menu and desktop navigation bar.
- **State Management**: TanStack Query for server state and caching.
- **Routing**: Wouter for client-side routing.
- **Features**:
    - Automatic parsing of match logs for comprehensive data extraction (players, Pokemon, all card types, turns, winner).
    - Searchable and filterable match history by various criteria (player, date, turns, uploader).
    - Detailed match viewing with color-coded log display.
    - Statistics dashboard with player rankings, Pokémon meta-analysis, and match duration distribution.
    - AI-powered strategy insights (player patterns, card effectiveness, timing, meta trends, deck building) with priority classification.
    - User profile management for setting Pokémon TCG player names.
    - Comprehensive help system with interactive tutorial for log export and import.
    - Dark/Light mode toggle.
    - Duplicate match detection.

## Backend
- **Framework**: Express.js with TypeScript (Node.js).
- **API Design**: RESTful API for CRUD operations on match data.
- **Core Logic**: Custom match log parser, robust card classification system using specific card databases, and a comprehensive username protection system with conflict resolution.
- **Authentication**: Replit Auth integration for email/password login. Player names are mandatory.
- **Authorization**: Protected routes for authenticated users.

## Data Storage
- **Database**: PostgreSQL hosted on Neon.
- **ORM**: Drizzle ORM for type-safe schema management.
- **Schema**: `matches` table (match metadata, player info, Pokémon lists, log text) and `decks` table (detailed deck information linked to matches).
- **Validation**: Zod schemas for type-safe data validation.

# External Dependencies

- **React Ecosystem**: React 18, Vite.
- **Express.js**: Backend server.
- **UI Libraries**: Shadcn/UI, Radix UI, Tailwind CSS, Lucide React (icons).
- **Data Management**: TanStack Query, Drizzle ORM, Zod, Date-fns.
- **File Handling**: React Dropzone, React Hook Form.
- **Database**: @neondatabase/serverless, connect-pg-simple, Drizzle Kit.
- **Communication**: SendGrid (for email notifications related to identity disputes).
- **APIs**: PokeAPI (for Pokémon images, types, and name normalization), official Pokémon TCG API (for card categorization and analysis).
- **Payment**: PayPal (for donation system).