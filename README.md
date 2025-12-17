# Turt World

A whimsical, friendly platformer game where you choose from 4 adorable characters and navigate through 5 themed levels. Built with Next.js, TypeScript, a custom physics engine, and Supabase.

## Features

- **4 Unique Characters** with distinct physics properties:
  - Turtle: Slower but heavier (less air control)
  - Pig: Balanced physics with faster acceleration
  - Lemur: Lightweight, extra air control, higher jumps
  - Axolotl: Slowest movement but can float slightly longer in air

- **5 Themed Levels**: Arctic, Desert, Jungle, Seaside, and Mountain landscapes with progressive difficulty
- **Custom Physics Engine**: Smooth platforming with gravity, jumping, and air control mechanics
- **Coin Collection & Combos**: Collect coins for points with combo multipliers
- **Level Progression**: Unlock new levels by completing previous ones
- **Leaderboard System**: Submit scores and compete with others
- **Beautiful UI**: Warm, whimsical art style with smooth animations

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Physics Engine**: Custom (manual gravity, collision detection, platforming mechanics)
- **Database**: Supabase (PostgreSQL with JSONB for level layouts)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- A GitHub account
- A Vercel account (optional, for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/turt-world.git
cd turt-world
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `db/schema.sql`
   - This will create the tables and insert default characters and the first level

4. Configure environment variables:
   - Copy `.env.local` and update with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
turt-world/
├── app/                    # Next.js app directory
│   └── page.tsx           # Main entry point
├── components/
│   └── game/              # Game React components
│       ├── Game.tsx       # Main game container
│       ├── CharacterSelect.tsx  # Character selection screen
│       ├── Canvas.tsx     # Game canvas and loop
│       └── UI.tsx         # HUD and game UI
├── game/                  # Core game engine
│   ├── physics.ts         # Custom physics system
│   ├── entities.ts        # Player, Platform, Hazard, Coin classes
│   ├── input.ts           # Keyboard handling
│   ├── animation.ts       # Character animation system
│   ├── camera.ts          # Camera following logic
│   └── levels.ts          # Level loader and renderer
├── db/                    # Database layer
│   ├── supabase.ts        # Supabase client and queries
│   └── schema.sql         # Database schema
└── assets/                # Game assets (sprites, sounds)
```

## Game Controls

- **Arrow Keys** or **WASD**: Move left/right
- **Space** or **W/Up Arrow**: Jump (hold for higher jump)

## How to Add New Characters

1. Open your Supabase SQL Editor
2. Insert a new character:

```sql
INSERT INTO characters (name, speed, jump_force, mass, air_control, float_time, description) VALUES
  ('NewCharacter', 3.5, 13.5, 1.8, 0.4, 0, 'Your character description');
```

3. Update the character colors and emojis in `components/game/CharacterSelect.tsx`:

```typescript
const characterColors: Record<string, string> = {
  // ... existing characters
  NewCharacter: 'bg-purple-600 hover:bg-purple-700',
};

const characterEmojis: Record<string, string> = {
  // ... existing characters
  NewCharacter: '🦔',
};
```

4. The character will automatically appear in the character selection screen!

## How to Design New Levels

Levels are stored as JSON in the Supabase `levels` table. Here's how to add one:

1. Open your Supabase SQL Editor
2. Insert a new level:

```sql
INSERT INTO levels (name, theme, order_index, unlocked_by_default, layout) VALUES
  ('Your Level Name', 'Jungle', 2, FALSE, '{
    "background": {
      "color": "#228B22",
      "layers": [
        {"type": "sky", "color": "#87CEEB"},
        {"type": "trees", "color": "#006400", "parallax": 0.3}
      ]
    },
    "platforms": [
      {"x": 50, "y": 550, "width": 200, "height": 20, "type": "ground"},
      {"x": 300, "y": 450, "width": 150, "height": 20, "type": "wood"}
    ],
    "hazards": [
      {"x": 450, "y": 580, "width": 40, "height": 60, "type": "spike"}
    ],
    "start": {"x": 100, "y": 450},
    "goal": {"x": 1150, "y": 350, "width": 60, "height": 80}
  }');
```

### Level Layout Format

- **platforms**: Array of platform objects with position, size, and type
- **hazards**: Array of hazard objects (touching these kills the player)
- **start**: Player spawn position
- **goal**: Level completion trigger area
- **background**: Colors and parallax layers for visual depth

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel at [vercel.com](https://vercel.com)
3. Add your environment variables in Vercel's dashboard
4. Deploy!

Vercel will automatically build and deploy your game.

## Development Roadmap

- [x] 5 themed levels (Arctic, Desert, Jungle, Seaside, Mountain)
- [x] Collectible coins with combo system
- [x] Level progression and unlocking
- [x] Leaderboard with scoring
- [ ] Add sound effects and background music
- [ ] Implement mobile touch controls
- [ ] Add moving platforms and dynamic hazards
- [ ] Create level editor UI
- [ ] Enhance character animations with sprite sheets
- [ ] Add power-ups and special abilities

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License - feel free to use this project however you'd like!

## Acknowledgments

- Database by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
