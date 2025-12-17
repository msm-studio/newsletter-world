require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCoins() {
  // Get all levels
  const { data: levels, error: fetchError } = await supabase
    .from('levels')
    .select('*')
    .order('order_index');

  if (fetchError) {
    console.error('Error fetching levels:', fetchError);
    return;
  }

  console.log(`Found ${levels.length} levels to update\n`);

  for (const level of levels) {
    console.log(`Updating ${level.name} (${level.theme})...`);

    const layout = level.layout;
    const targetCoins = level.order_index * 10 + 20; // Level 1 = 30, Level 2 = 40, etc.
    const currentCoins = layout.collectibles?.length || 0;

    console.log(`  Current coins: ${currentCoins}, Target coins: ${targetCoins}`);

    if (currentCoins >= targetCoins) {
      console.log(`  ✓ Already has enough coins\n`);
      continue;
    }

    const coinsToAdd = targetCoins - currentCoins;
    console.log(`  Adding ${coinsToAdd} more coins...`);

    // Generate new coin positions between platforms
    const newCoins = [];
    const platforms = layout.platforms || [];

    // Add coins between platforms at various heights
    for (let i = 0; i < coinsToAdd; i++) {
      // Pick a platform to place coin near
      const platformIndex = i % (platforms.length - 1);
      const platform = platforms[platformIndex];
      const nextPlatform = platforms[platformIndex + 1];

      if (platform && nextPlatform) {
        // Place coin between platforms, above them
        const midX = (platform.x + nextPlatform.x) / 2;
        const avgY = (platform.y + nextPlatform.y) / 2;
        const coinY = avgY - 40 - (i % 3) * 30; // Various heights above platforms

        newCoins.push({
          x: Math.round(midX),
          y: Math.round(coinY)
        });
      }
    }

    // Merge with existing coins
    const updatedCollectibles = [...(layout.collectibles || []), ...newCoins];

    // Update the level
    const updatedLayout = {
      ...layout,
      collectibles: updatedCollectibles
    };

    const { error: updateError } = await supabase
      .from('levels')
      .update({ layout: updatedLayout })
      .eq('id', level.id);

    if (updateError) {
      console.error(`  ✗ Error updating ${level.name}:`, updateError);
    } else {
      console.log(`  ✓ Updated! Now has ${updatedCollectibles.length} coins\n`);
    }
  }

  console.log('Coin update complete! Verifying...\n');

  // Verify
  const { data: updatedLevels } = await supabase
    .from('levels')
    .select('name, order_index, layout')
    .order('order_index');

  updatedLevels.forEach(level => {
    const coinCount = level.layout.collectibles?.length || 0;
    const target = level.order_index * 10 + 20;
    const status = coinCount >= target ? '✓' : '✗';
    console.log(`${status} ${level.name}: ${coinCount} coins (target: ${target})`);
  });
}

updateCoins();
