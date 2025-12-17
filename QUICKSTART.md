# Turt World - Quick Start Guide

Your whimsical platformer game is ready to play! Here's how to get started:

## What's Been Built

✅ **Complete Game Engine**
- Delta-time independent game loop
- Rapier2D physics with character-specific properties
- Collision detection and response
- Variable jump height mechanics

✅ **4 Unique Characters**
- 🐢 Turtle: Heavy and slow, less air control
- 🐷 Pig: Balanced, fast acceleration
- 🦧 Lemur: Light, extra air control, high jumps
- 🦎 Axolotl: Slow but can float in air

✅ **Desert Level** - "Sandy Scramble"
- Multiple platforms
- Cactus hazards
- Goal flag
- Parallax background

✅ **Full UI System**
- Character selection screen
- In-game HUD (time, deaths, level info)
- Win screen with score submission
- Responsive controls

## Next Steps to Play

### 1. Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Once created, go to **SQL Editor** in the left sidebar
4. Copy and paste the entire contents of `db/schema.sql`
5. Click "Run" - this creates your tables and adds the characters and Desert level
6. Go to **Settings** → **API** in the left sidebar
7. Copy your **Project URL** and **anon/public** key

### 2. Configure Environment Variables

Open `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 3. Run the Game

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the character selection screen!

## How to Play

1. **Choose your character** - Each has unique physics
2. **Use Arrow Keys or WASD** to move left/right
3. **Press Space or W/Up** to jump (hold for higher jump)
4. **Avoid the cacti** - they'll send you back to the start
5. **Reach the golden flag** to win!

## Deploy to Production

### Push to GitHub

```bash
# If you haven't already created a GitHub repo:
gh repo create turt-world --public --source=. --remote=origin --push

# Or manually:
# 1. Create a new repo on GitHub
# 2. Run:
git remote add origin https://github.com/yourusername/turt-world.git
git push -u origin main
```

### Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your `turt-world` repository
4. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

Your game will be live in ~2 minutes!

## Customization Ideas

### Add New Characters

See README.md section "How to Add New Characters" - just run a SQL query and update two files!

### Create New Levels

See README.md section "How to Design New Levels" - levels are JSON objects in Supabase, easily editable!

### Modify Physics

Edit character properties directly in Supabase or in `game/physics.ts` for global physics changes.

## Troubleshooting

**Character selection screen is empty?**
- Make sure you ran the `db/schema.sql` in Supabase
- Check that your environment variables are correct

**Game won't start after selecting character?**
- Open browser console (F12) to see any errors
- Verify Supabase connection is working

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version is compatible

## What's Next?

Now that you have a working game, you can:

1. Add the other 3 levels (Jungle, Arctic, Urban)
2. Implement collectibles and power-ups
3. Add sound effects and music
4. Create an actual level editor UI
5. Add multiplayer race mode
6. Implement daily challenges

Have fun building your game! 🎮
