'use client';

import { useState } from 'react';
import { Character, Level } from '@/db/supabase';

interface EmailGateProps {
  character: Character;
  level: Level;
  score: number;
  onSubmit: (name: string, email: string) => Promise<void>;
}

export default function EmailGate({ character, level, score, onSubmit }: EmailGateProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Validate name
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Please enter a valid name');
      return;
    }

    // Validate email
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address (e.g., name@example.com)');
      return;
    }

    // Check for common typos in email domains
    const commonTypos = ['gmail.con', 'gmail.cm', 'yahoo.con', 'hotmail.con'];
    if (commonTypos.some(typo => trimmedEmail.includes(typo))) {
      setError('Please check your email address for typos');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(trimmedName, trimmedEmail);
    } catch (err) {
      console.error('Email submission error:', err);
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Get theme color based on current level
  const getThemeColors = () => {
    switch (level.theme.toLowerCase()) {
      case 'desert':
        return { from: 'from-orange-500', to: 'to-yellow-600', accent: 'bg-orange-600 hover:bg-orange-700' };
      case 'arctic':
        return { from: 'from-blue-400', to: 'to-cyan-600', accent: 'bg-blue-500 hover:bg-blue-600' };
      case 'jungle':
        return { from: 'from-green-500', to: 'to-emerald-700', accent: 'bg-green-600 hover:bg-green-700' };
      case 'seaside':
        return { from: 'from-cyan-400', to: 'to-blue-500', accent: 'bg-cyan-500 hover:bg-cyan-600' };
      case 'mountain':
        return { from: 'from-stone-500', to: 'to-slate-700', accent: 'bg-stone-600 hover:bg-stone-700' };
      default:
        return { from: 'from-purple-500', to: 'to-indigo-700', accent: 'bg-purple-600 hover:bg-purple-700' };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-b ${colors.from} ${colors.to} rounded-2xl p-8 max-w-md w-full shadow-2xl transform animate-pulse-slow`}>
        <div className="text-center">
          {/* Trophy icon */}
          <div className="text-6xl mb-4">🏆</div>

          <h1 className="text-3xl font-bold text-white mb-2">Level 1 Complete!</h1>
          <p className="text-white/80 mb-2">
            You scored <span className="font-bold text-yellow-300">{score.toLocaleString()}</span> points as {character.name}!
          </p>
          <p className="text-white/90 mb-6">Enter your info to unlock all remaining levels</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg text-gray-800 bg-white/95 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full px-4 py-3 rounded-lg text-gray-800 bg-white/95 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-red-200 text-sm bg-red-900/30 py-2 px-3 rounded">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${colors.accent} disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Unlocking...
                </span>
              ) : (
                'Unlock All Levels'
              )}
            </button>
          </form>

          <p className="text-white/50 text-xs mt-4">
            We&apos;ll send you newsletter tips & updates. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
