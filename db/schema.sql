-- Turt World Database Schema
-- Run this in your Supabase SQL editor

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  speed DECIMAL NOT NULL,
  jump_force DECIMAL NOT NULL,
  mass DECIMAL NOT NULL,
  air_control DECIMAL NOT NULL,
  float_time DECIMAL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  layout JSONB NOT NULL,
  unlocked_by_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  character_name TEXT NOT NULL,
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  completion_time DECIMAL NOT NULL,
  deaths INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  coins_collected INTEGER DEFAULT 0,
  combo_max INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default characters
INSERT INTO characters (name, speed, jump_force, mass, air_control, float_time, description) VALUES
  ('Turtle', 3.0, 13.2, 2.0, 0.3, 0, 'Slower but heavier with less air control'),
  ('Pig', 4.5, 13.0, 1.5, 0.5, 0, 'Balanced physics with faster acceleration'),
  ('Lemur', 4.0, 15.0, 1.0, 0.8, 0, 'Lightweight with extra air control and higher jumps'),
  ('Axolotl', 2.5, 12.0, 1.2, 0.6, 0.3, 'Slowest movement but can float slightly longer in air')
ON CONFLICT (name) DO NOTHING;

-- Insert Desert level (Extended 5x length)
INSERT INTO levels (name, theme, order_index, unlocked_by_default, layout) VALUES
  ('Sandy Scramble', 'Desert', 1, TRUE, '{
    "background": {
      "color": "#F4A460",
      "layers": [
        {"type": "sky", "color": "#87CEEB"},
        {"type": "dunes", "color": "#DEB887", "parallax": 0.3}
      ]
    },
    "platforms": [
      {"x": 50, "y": 550, "width": 200, "height": 20, "type": "ground"},
      {"x": 300, "y": 450, "width": 150, "height": 20, "type": "sand"},
      {"x": 500, "y": 350, "width": 120, "height": 20, "type": "sand"},
      {"x": 700, "y": 280, "width": 100, "height": 20, "type": "sand"},
      {"x": 900, "y": 350, "width": 150, "height": 20, "type": "sand"},
      {"x": 1100, "y": 450, "width": 200, "height": 20, "type": "ground"},
      {"x": 1350, "y": 380, "width": 130, "height": 20, "type": "sand"},
      {"x": 1550, "y": 300, "width": 100, "height": 20, "type": "sand"},
      {"x": 1750, "y": 400, "width": 150, "height": 20, "type": "sand"},
      {"x": 1950, "y": 320, "width": 120, "height": 20, "type": "sand"},
      {"x": 2150, "y": 450, "width": 180, "height": 20, "type": "ground"},
      {"x": 2400, "y": 360, "width": 140, "height": 20, "type": "sand"},
      {"x": 2600, "y": 280, "width": 110, "height": 20, "type": "sand"},
      {"x": 2800, "y": 380, "width": 160, "height": 20, "type": "sand"},
      {"x": 3000, "y": 480, "width": 200, "height": 20, "type": "ground"},
      {"x": 3250, "y": 400, "width": 130, "height": 20, "type": "sand"},
      {"x": 3450, "y": 320, "width": 100, "height": 20, "type": "sand"},
      {"x": 3650, "y": 250, "width": 120, "height": 20, "type": "sand"},
      {"x": 3850, "y": 350, "width": 150, "height": 20, "type": "sand"},
      {"x": 4050, "y": 450, "width": 180, "height": 20, "type": "ground"},
      {"x": 4300, "y": 370, "width": 140, "height": 20, "type": "sand"},
      {"x": 4500, "y": 290, "width": 110, "height": 20, "type": "sand"},
      {"x": 4700, "y": 390, "width": 160, "height": 20, "type": "sand"},
      {"x": 4900, "y": 320, "width": 130, "height": 20, "type": "sand"},
      {"x": 5100, "y": 420, "width": 150, "height": 20, "type": "sand"},
      {"x": 5300, "y": 350, "width": 200, "height": 20, "type": "ground"},
      {"x": 5550, "y": 450, "width": 250, "height": 20, "type": "ground"}
    ],
    "hazards": [
      {"x": 450, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 850, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 1250, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 1650, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 2050, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 2450, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 2850, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 3250, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 3650, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 4050, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 4450, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 4850, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 5250, "y": 580, "width": 40, "height": 60, "type": "cactus"}
    ],
    "start": {"x": 100, "y": 450},
    "goal": {"x": 5600, "y": 350, "width": 60, "height": 80}
  }')
ON CONFLICT (name, theme, order_index) DO UPDATE SET layout = EXCLUDED.layout;

-- Insert Arctic level
INSERT INTO levels (name, theme, order_index, unlocked_by_default, layout) VALUES
  ('Frozen Frontier', 'Arctic', 2, FALSE, '{
    "background": {
      "color": "#B0E0E6",
      "layers": [
        {"type": "sky", "color": "#87CEEB"},
        {"type": "mountains", "color": "#E0F2F7", "parallax": 0.3}
      ]
    },
    "platforms": [
      {"x": 50, "y": 550, "width": 200, "height": 20, "type": "ice"},
      {"x": 300, "y": 460, "width": 140, "height": 20, "type": "ice"},
      {"x": 500, "y": 370, "width": 110, "height": 20, "type": "ice"},
      {"x": 680, "y": 290, "width": 100, "height": 20, "type": "ice"},
      {"x": 850, "y": 220, "width": 90, "height": 20, "type": "ice"},
      {"x": 1020, "y": 300, "width": 120, "height": 20, "type": "ice"},
      {"x": 1200, "y": 400, "width": 150, "height": 20, "type": "ice"},
      {"x": 1400, "y": 320, "width": 130, "height": 20, "type": "ice"},
      {"x": 1600, "y": 240, "width": 100, "height": 20, "type": "ice"},
      {"x": 1780, "y": 340, "width": 140, "height": 20, "type": "ice"},
      {"x": 1980, "y": 440, "width": 160, "height": 20, "type": "ice"},
      {"x": 2200, "y": 360, "width": 120, "height": 20, "type": "ice"},
      {"x": 2380, "y": 280, "width": 100, "height": 20, "type": "ice"},
      {"x": 2550, "y": 200, "width": 90, "height": 20, "type": "ice"},
      {"x": 2710, "y": 280, "width": 110, "height": 20, "type": "ice"},
      {"x": 2880, "y": 360, "width": 130, "height": 20, "type": "ice"},
      {"x": 3070, "y": 460, "width": 150, "height": 20, "type": "ice"},
      {"x": 3280, "y": 380, "width": 120, "height": 20, "type": "ice"},
      {"x": 3460, "y": 300, "width": 100, "height": 20, "type": "ice"},
      {"x": 3630, "y": 220, "width": 90, "height": 20, "type": "ice"},
      {"x": 3790, "y": 300, "width": 110, "height": 20, "type": "ice"},
      {"x": 3960, "y": 380, "width": 130, "height": 20, "type": "ice"},
      {"x": 4150, "y": 480, "width": 160, "height": 20, "type": "ice"},
      {"x": 4370, "y": 400, "width": 120, "height": 20, "type": "ice"},
      {"x": 4550, "y": 320, "width": 100, "height": 20, "type": "ice"},
      {"x": 4720, "y": 240, "width": 90, "height": 20, "type": "ice"},
      {"x": 4880, "y": 320, "width": 110, "height": 20, "type": "ice"},
      {"x": 5050, "y": 400, "width": 130, "height": 20, "type": "ice"},
      {"x": 5240, "y": 500, "width": 180, "height": 20, "type": "ice"},
      {"x": 5480, "y": 420, "width": 200, "height": 20, "type": "ice"},
      {"x": 5730, "y": 500, "width": 250, "height": 20, "type": "ice"}
    ],
    "hazards": [
      {"x": 450, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 900, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 1350, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 1800, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 2250, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 2700, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 3150, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 3600, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 4050, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 4500, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 4950, "y": 570, "width": 40, "height": 50, "type": "ice_spike"},
      {"x": 5400, "y": 570, "width": 40, "height": 50, "type": "ice_spike"}
    ],
    "collectibles": [
      {"x": 350, "y": 420},
      {"x": 550, "y": 330},
      {"x": 730, "y": 250},
      {"x": 1070, "y": 260},
      {"x": 1450, "y": 280},
      {"x": 1830, "y": 300},
      {"x": 2250, "y": 320},
      {"x": 2600, "y": 160},
      {"x": 2930, "y": 320},
      {"x": 3330, "y": 340},
      {"x": 3680, "y": 180},
      {"x": 4010, "y": 340},
      {"x": 4420, "y": 360},
      {"x": 4770, "y": 200},
      {"x": 5100, "y": 360},
      {"x": 5530, "y": 380}
    ],
    "start": {"x": 100, "y": 450},
    "goal": {"x": 5850, "y": 400, "width": 60, "height": 80}
  }')
ON CONFLICT (name, theme, order_index) DO UPDATE SET layout = EXCLUDED.layout;

-- Insert Jungle level
INSERT INTO levels (name, theme, order_index, unlocked_by_default, layout) VALUES
  ('Jungle Jump', 'Jungle', 3, FALSE, '{
    "background": {
      "color": "#2D5016",
      "layers": [
        {"type": "sky", "color": "#87CEEB"},
        {"type": "trees", "color": "#1F3A12", "parallax": 0.3}
      ]
    },
    "platforms": [
      {"x": 50, "y": 550, "width": 200, "height": 20, "type": "wood"},
      {"x": 280, "y": 470, "width": 130, "height": 20, "type": "vine"},
      {"x": 450, "y": 390, "width": 110, "height": 20, "type": "wood"},
      {"x": 610, "y": 310, "width": 100, "height": 20, "type": "vine"},
      {"x": 760, "y": 390, "width": 120, "height": 20, "type": "wood"},
      {"x": 930, "y": 470, "width": 140, "height": 20, "type": "vine"},
      {"x": 1120, "y": 380, "width": 130, "height": 20, "type": "wood"},
      {"x": 1300, "y": 290, "width": 100, "height": 20, "type": "vine"},
      {"x": 1450, "y": 370, "width": 120, "height": 20, "type": "wood"},
      {"x": 1620, "y": 460, "width": 150, "height": 20, "type": "vine"},
      {"x": 1820, "y": 370, "width": 130, "height": 20, "type": "wood"},
      {"x": 2000, "y": 280, "width": 110, "height": 20, "type": "vine"},
      {"x": 2160, "y": 360, "width": 140, "height": 20, "type": "wood"},
      {"x": 2350, "y": 450, "width": 160, "height": 20, "type": "vine"},
      {"x": 2560, "y": 350, "width": 120, "height": 20, "type": "wood"},
      {"x": 2730, "y": 260, "width": 100, "height": 20, "type": "vine"},
      {"x": 2880, "y": 340, "width": 130, "height": 20, "type": "wood"},
      {"x": 3060, "y": 430, "width": 150, "height": 20, "type": "vine"},
      {"x": 3260, "y": 340, "width": 120, "height": 20, "type": "wood"},
      {"x": 3430, "y": 250, "width": 100, "height": 20, "type": "vine"},
      {"x": 3580, "y": 330, "width": 130, "height": 20, "type": "wood"},
      {"x": 3760, "y": 420, "width": 140, "height": 20, "type": "vine"},
      {"x": 3950, "y": 330, "width": 120, "height": 20, "type": "wood"},
      {"x": 4120, "y": 240, "width": 100, "height": 20, "type": "vine"},
      {"x": 4270, "y": 320, "width": 130, "height": 20, "type": "wood"},
      {"x": 4450, "y": 410, "width": 150, "height": 20, "type": "vine"},
      {"x": 4650, "y": 500, "width": 180, "height": 20, "type": "wood"},
      {"x": 4880, "y": 420, "width": 200, "height": 20, "type": "wood"},
      {"x": 5130, "y": 500, "width": 250, "height": 20, "type": "wood"}
    ],
    "hazards": [
      {"x": 400, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 800, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 1200, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 1600, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 2000, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 2400, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 2800, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 3200, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 3600, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 4000, "y": 570, "width": 35, "height": 45, "type": "thorn"},
      {"x": 4400, "y": 570, "width": 35, "height": 45, "type": "thorn"}
    ],
    "collectibles": [
      {"x": 330, "y": 430},
      {"x": 500, "y": 350},
      {"x": 660, "y": 270},
      {"x": 810, "y": 350},
      {"x": 1170, "y": 340},
      {"x": 1350, "y": 250},
      {"x": 1500, "y": 330},
      {"x": 1870, "y": 330},
      {"x": 2050, "y": 240},
      {"x": 2210, "y": 320},
      {"x": 2610, "y": 310},
      {"x": 2780, "y": 220},
      {"x": 2930, "y": 300},
      {"x": 3310, "y": 300},
      {"x": 3480, "y": 210},
      {"x": 3630, "y": 290},
      {"x": 4000, "y": 290},
      {"x": 4170, "y": 200},
      {"x": 4320, "y": 280},
      {"x": 4700, "y": 460},
      {"x": 4930, "y": 380}
    ],
    "start": {"x": 100, "y": 450},
    "goal": {"x": 5250, "y": 400, "width": 60, "height": 80}
  }')
ON CONFLICT (name, theme, order_index) DO UPDATE SET layout = EXCLUDED.layout;

-- Insert Seaside level
INSERT INTO levels (name, theme, order_index, unlocked_by_default, layout) VALUES
  ('Seaside Sprint', 'Seaside', 4, FALSE, '{
    "background": {
      "color": "#87CEEB",
      "layers": [
        {"type": "sky", "color": "#87CEEB"},
        {"type": "ocean", "color": "#4A90A4", "parallax": 0.3}
      ]
    },
    "platforms": [
      {"x": 50, "y": 550, "width": 200, "height": 20, "type": "sand"},
      {"x": 300, "y": 480, "width": 140, "height": 20, "type": "wood"},
      {"x": 490, "y": 400, "width": 120, "height": 20, "type": "wood"},
      {"x": 660, "y": 320, "width": 100, "height": 20, "type": "wood"},
      {"x": 810, "y": 400, "width": 130, "height": 20, "type": "sand"},
      {"x": 990, "y": 480, "width": 150, "height": 20, "type": "wood"},
      {"x": 1190, "y": 390, "width": 130, "height": 20, "type": "wood"},
      {"x": 1370, "y": 300, "width": 110, "height": 20, "type": "wood"},
      {"x": 1530, "y": 380, "width": 140, "height": 20, "type": "sand"},
      {"x": 1720, "y": 470, "width": 160, "height": 20, "type": "wood"},
      {"x": 1930, "y": 380, "width": 130, "height": 20, "type": "wood"},
      {"x": 2110, "y": 290, "width": 100, "height": 20, "type": "wood"},
      {"x": 2260, "y": 370, "width": 140, "height": 20, "type": "sand"},
      {"x": 2450, "y": 460, "width": 150, "height": 20, "type": "wood"},
      {"x": 2650, "y": 360, "width": 120, "height": 20, "type": "wood"},
      {"x": 2820, "y": 270, "width": 100, "height": 20, "type": "wood"},
      {"x": 2970, "y": 350, "width": 130, "height": 20, "type": "sand"},
      {"x": 3150, "y": 440, "width": 150, "height": 20, "type": "wood"},
      {"x": 3350, "y": 350, "width": 120, "height": 20, "type": "wood"},
      {"x": 3520, "y": 260, "width": 100, "height": 20, "type": "wood"},
      {"x": 3670, "y": 340, "width": 130, "height": 20, "type": "sand"},
      {"x": 3850, "y": 430, "width": 140, "height": 20, "type": "wood"},
      {"x": 4040, "y": 340, "width": 120, "height": 20, "type": "wood"},
      {"x": 4210, "y": 250, "width": 100, "height": 20, "type": "wood"},
      {"x": 4360, "y": 330, "width": 130, "height": 20, "type": "sand"},
      {"x": 4540, "y": 420, "width": 150, "height": 20, "type": "wood"},
      {"x": 4740, "y": 510, "width": 180, "height": 20, "type": "sand"},
      {"x": 4970, "y": 430, "width": 200, "height": 20, "type": "sand"},
      {"x": 5220, "y": 510, "width": 250, "height": 20, "type": "sand"}
    ],
    "hazards": [
      {"x": 450, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 900, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 1350, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 1800, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 2250, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 2700, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 3150, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 3600, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 4050, "y": 570, "width": 30, "height": 40, "type": "crab"},
      {"x": 4500, "y": 570, "width": 30, "height": 40, "type": "crab"}
    ],
    "collectibles": [
      {"x": 350, "y": 440},
      {"x": 540, "y": 360},
      {"x": 710, "y": 280},
      {"x": 860, "y": 360},
      {"x": 1240, "y": 350},
      {"x": 1420, "y": 260},
      {"x": 1580, "y": 340},
      {"x": 1980, "y": 340},
      {"x": 2160, "y": 250},
      {"x": 2310, "y": 330},
      {"x": 2700, "y": 320},
      {"x": 2870, "y": 230},
      {"x": 3020, "y": 310},
      {"x": 3400, "y": 310},
      {"x": 3570, "y": 220},
      {"x": 3720, "y": 300},
      {"x": 4090, "y": 300},
      {"x": 4260, "y": 210},
      {"x": 4410, "y": 290},
      {"x": 4790, "y": 470},
      {"x": 5020, "y": 390},
      {"x": 5270, "y": 470}
    ],
    "start": {"x": 100, "y": 450},
    "goal": {"x": 5350, "y": 410, "width": 60, "height": 80}
  }')
ON CONFLICT (name, theme, order_index) DO UPDATE SET layout = EXCLUDED.layout;

-- Insert Mountain level
INSERT INTO levels (name, theme, order_index, unlocked_by_default, layout) VALUES
  ('Mountain Madness', 'Mountain', 5, FALSE, '{
    "background": {
      "color": "#8B7355",
      "layers": [
        {"type": "sky", "color": "#87CEEB"},
        {"type": "mountains", "color": "#5D4E37", "parallax": 0.3}
      ]
    },
    "platforms": [
      {"x": 50, "y": 550, "width": 200, "height": 20, "type": "stone"},
      {"x": 280, "y": 460, "width": 130, "height": 20, "type": "stone"},
      {"x": 450, "y": 370, "width": 110, "height": 20, "type": "stone"},
      {"x": 600, "y": 280, "width": 100, "height": 20, "type": "stone"},
      {"x": 750, "y": 190, "width": 90, "height": 20, "type": "stone"},
      {"x": 900, "y": 270, "width": 120, "height": 20, "type": "stone"},
      {"x": 1070, "y": 360, "width": 130, "height": 20, "type": "stone"},
      {"x": 1250, "y": 270, "width": 110, "height": 20, "type": "stone"},
      {"x": 1410, "y": 180, "width": 100, "height": 20, "type": "stone"},
      {"x": 1560, "y": 260, "width": 120, "height": 20, "type": "stone"},
      {"x": 1730, "y": 350, "width": 140, "height": 20, "type": "stone"},
      {"x": 1920, "y": 440, "width": 150, "height": 20, "type": "stone"},
      {"x": 2120, "y": 350, "width": 120, "height": 20, "type": "stone"},
      {"x": 2290, "y": 260, "width": 100, "height": 20, "type": "stone"},
      {"x": 2440, "y": 170, "width": 90, "height": 20, "type": "stone"},
      {"x": 2580, "y": 250, "width": 110, "height": 20, "type": "stone"},
      {"x": 2740, "y": 340, "width": 130, "height": 20, "type": "stone"},
      {"x": 2920, "y": 430, "width": 140, "height": 20, "type": "stone"},
      {"x": 3110, "y": 340, "width": 120, "height": 20, "type": "stone"},
      {"x": 3280, "y": 250, "width": 100, "height": 20, "type": "stone"},
      {"x": 3430, "y": 160, "width": 90, "height": 20, "type": "stone"},
      {"x": 3570, "y": 240, "width": 110, "height": 20, "type": "stone"},
      {"x": 3730, "y": 330, "width": 130, "height": 20, "type": "stone"},
      {"x": 3910, "y": 420, "width": 140, "height": 20, "type": "stone"},
      {"x": 4100, "y": 510, "width": 160, "height": 20, "type": "stone"},
      {"x": 4310, "y": 420, "width": 130, "height": 20, "type": "stone"},
      {"x": 4490, "y": 330, "width": 110, "height": 20, "type": "stone"},
      {"x": 4650, "y": 240, "width": 100, "height": 20, "type": "stone"},
      {"x": 4800, "y": 330, "width": 130, "height": 20, "type": "stone"},
      {"x": 4980, "y": 420, "width": 150, "height": 20, "type": "stone"},
      {"x": 5180, "y": 510, "width": 200, "height": 20, "type": "stone"},
      {"x": 5430, "y": 520, "width": 250, "height": 20, "type": "stone"}
    ],
    "hazards": [
      {"x": 400, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 850, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 1300, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 1750, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 2200, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 2650, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 3100, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 3550, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 4000, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 4450, "y": 570, "width": 40, "height": 50, "type": "rock"},
      {"x": 4900, "y": 570, "width": 40, "height": 50, "type": "rock"}
    ],
    "collectibles": [
      {"x": 330, "y": 420},
      {"x": 500, "y": 330},
      {"x": 650, "y": 240},
      {"x": 800, "y": 150},
      {"x": 950, "y": 230},
      {"x": 1120, "y": 320},
      {"x": 1300, "y": 230},
      {"x": 1460, "y": 140},
      {"x": 1610, "y": 220},
      {"x": 1780, "y": 310},
      {"x": 1970, "y": 400},
      {"x": 2170, "y": 310},
      {"x": 2340, "y": 220},
      {"x": 2490, "y": 130},
      {"x": 2630, "y": 210},
      {"x": 2790, "y": 300},
      {"x": 2970, "y": 390},
      {"x": 3160, "y": 300},
      {"x": 3330, "y": 210},
      {"x": 3480, "y": 120},
      {"x": 3620, "y": 200},
      {"x": 3780, "y": 290},
      {"x": 3960, "y": 380},
      {"x": 4150, "y": 470},
      {"x": 4360, "y": 380},
      {"x": 4540, "y": 290}
    ],
    "start": {"x": 100, "y": 450},
    "goal": {"x": 5550, "y": 420, "width": 60, "height": 80}
  }')
ON CONFLICT (name, theme, order_index) DO UPDATE SET layout = EXCLUDED.layout;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_level ON leaderboard(level_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_time ON leaderboard(completion_time);
CREATE INDEX IF NOT EXISTS idx_levels_order ON levels(order_index);
