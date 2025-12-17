'use client';

import Game from '@/components/game/Game';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <ErrorBoundary>
      <Game />
    </ErrorBoundary>
  );
}
