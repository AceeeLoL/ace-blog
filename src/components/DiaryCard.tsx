'use client';

import { motion } from 'framer-motion';
import { DiaryEntry } from '@/types';
import { formatDate } from '@/lib/utils';

type DiaryCardProps = {
  entry: DiaryEntry;
  index: number;
  onSelect: (entry: DiaryEntry) => void;
};

export default function DiaryCard({ entry, index, onSelect }: DiaryCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group cursor-pointer rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 hover:shadow-md hover:border-[var(--accent-terracotta)]/40 transition-all duration-200"
      onClick={() => onSelect(entry)}
    >
      <div className="flex items-center justify-between mb-3">
        <time className="text-xs text-[var(--text-secondary)] tracking-wide">
          {formatDate(entry.date)}
        </time>
        <span className="text-xs font-semibold text-[var(--accent-terracotta)] bg-[var(--accent-terracotta)]/10 px-2.5 py-0.5 rounded-full">
          {entry.category || 'General'}
        </span>
      </div>

      <h2 className="font-serif text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-terracotta)] transition-colors">
        {entry.title}
      </h2>

      <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2">
        {entry.excerpt}
      </p>
    </motion.article>
  );
}
