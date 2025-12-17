import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Character {
  id: string;
  name: string;
  speed: number;
  jump_force: number;
  mass: number;
  air_control: number;
  float_time: number;
  description: string;
}

export interface Level {
  id: string;
  name: string;
  theme: string;
  order_index: number;
  layout: LevelLayout;
  unlocked_by_default: boolean;
}

export interface LevelLayout {
  background: {
    color: string;
    layers: Array<{
      type: string;
      color: string;
      parallax?: number;
    }>;
  };
  platforms: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
  }>;
  hazards: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
  }>;
  start: {
    x: number;
    y: number;
  };
  goal: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  collectibles?: Array<{
    x: number;
    y: number;
  }>;
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  character_name: string;
  level_id: string;
  completion_time: number;
  deaths: number;
  points: number;
  coins_collected: number;
  combo_max: number;
  created_at: string;
}

// Database queries
export async function getCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching characters:', error);
    return [];
  }

  return data || [];
}

export async function getLevels(): Promise<Level[]> {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('order_index');

  if (error) {
    console.error('Error fetching levels:', error);
    return [];
  }

  return data || [];
}

export async function getLeaderboard(levelId: string, limit = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('level_id', levelId)
    .order('completion_time', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}

export async function getTopScores(limit = 5): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('points', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top scores:', error);
    return [];
  }

  return data || [];
}

export async function submitScore(
  playerName: string,
  characterName: string,
  levelId: string,
  completionTime: number,
  deaths: number,
  points: number,
  coinsCollected: number,
  comboMax: number
): Promise<boolean> {
  const { error } = await supabase
    .from('leaderboard')
    .insert({
      player_name: playerName,
      character_name: characterName,
      level_id: levelId,
      completion_time: completionTime,
      deaths: deaths,
      points: points,
      coins_collected: coinsCollected,
      combo_max: comboMax,
    });

  if (error) {
    console.error('Error submitting score:', error);
    return false;
  }

  return true;
}
