'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { DiaryEntry } from '@/types';

import Navbar from '@/components/Navbar';
import DiaryCard from '@/components/DiaryCard';
import EntryModal from '@/components/EntryModal';
import AdminWriter from '@/components/AdminWriter';
import Footer from '@/components/Footer';

export default function BlogPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [showWriter, setShowWriter] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setEditingEntry(null);
        setShowWriter(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const uniquePinNames = useMemo(() => {
    const names = entries
      .map((e) => e.category)
      .filter((c): c is string => !!c && c.trim().length > 0);
    return [...new Set(names)];
  }, [entries]);

  const displayedEntries = filter === 'all'
    ? entries
    : entries.filter((e) => e.category === filter);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="py-10 sm:py-12 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 sm:mb-8">
              Blog
            </h1>

            <div className="flex items-center gap-2 mb-6 sm:mb-8 flex-wrap overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setFilter('all')}
                className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-[13px] sm:text-sm font-medium border transition-colors ${
                  filter === 'all'
                    ? 'bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]'
                    : 'border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--accent-terracotta)]/30'
                }`}
              >
                All
              </button>
              {uniquePinNames.map((pin) => (
                <button
                  key={pin}
                  onClick={() => setFilter(pin)}
                  className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-[13px] sm:text-sm font-medium border transition-colors ${
                    filter === pin
                      ? 'bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]'
                      : 'border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--accent-terracotta)]/30'
                  }`}
                >
                  {pin}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-[var(--accent-terracotta)]/30 border-t-[var(--accent-terracotta)] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
              </div>
            ) : displayedEntries.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen size={32} className="mx-auto mb-3 text-[var(--text-secondary)]/30" />
                <p className="text-[var(--text-secondary)]">
                  {filter === 'all'
                    ? 'No entries yet.'
                    : `No entries in "${filter}".`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedEntries.map((entry, i) => (
                  <DiaryCard
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onSelect={setSelectedEntry}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <EntryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setShowWriter(true);
        }}
        onDelete={() => {
          fetchEntries();
        }}
      />

      <AdminWriter
        isOpen={showWriter}
        editingEntry={editingEntry}
        onClose={() => {
          setShowWriter(false);
          setEditingEntry(null);
        }}
        onEntryCreated={() => {
          fetchEntries();
          setShowWriter(false);
          setEditingEntry(null);
        }}
      />
    </div>
  );
}
