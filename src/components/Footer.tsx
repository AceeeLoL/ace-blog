'use client';

import { Key } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between gap-6">
          <span className="font-serif text-base font-semibold text-[var(--text-primary)]">
            aceblog
          </span>

          <div className="flex items-center gap-2 text-[var(--text-secondary)]/40 text-xs">
            <Key size={10} />
            <span>{new Date().getFullYear()} · aceblog</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
