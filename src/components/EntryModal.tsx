'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Pencil, Trash2 } from 'lucide-react';
import { DiaryEntry } from '@/types';
import { formatDate } from '@/lib/utils';

type EntryModalProps = {
  entry: DiaryEntry | null;
  onClose: () => void;
  onEdit?: (entry: DiaryEntry) => void;
  onDelete?: (id: string) => void;
};

export default function EntryModal({ entry, onClose, onEdit, onDelete }: EntryModalProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (entry) {
      fetch('/api/auth')
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    }
  }, [entry]);

  if (!entry) return null;

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let listItems: string[] = [];
    let inBlockquote = false;
    let blockquoteLines: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-1.5 my-4 ml-4">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[var(--text-primary)]">
                <span className="text-[var(--accent-terracotta)] mt-1.5 text-xs">–</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushBlockquote = () => {
      if (blockquoteLines.length > 0) {
        elements.push(
          <blockquote
            key={`bq-${elements.length}`}
            className="border-l-2 border-[var(--accent-clay)] pl-4 my-5 text-[var(--text-secondary)] italic"
          >
            {blockquoteLines.map((l, i) => (
              <span key={i}>
                {l.replace(/^>\s*/, '')}
                {i < blockquoteLines.length - 1 && <br />}
              </span>
            ))}
          </blockquote>
        );
        blockquoteLines = [];
        inBlockquote = false;
      }
    };

    const formatInline = (text: string) => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--text-primary)]">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--accent-terracotta)] text-sm font-mono">$1</code>');
    };

    lines.forEach((line) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${elements.length}`} className="bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-lg p-4 my-5 overflow-x-auto text-sm font-mono text-[var(--text-primary)]">
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          flushList();
          flushBlockquote();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      if (line.trim().startsWith('>')) {
        flushList();
        inBlockquote = true;
        blockquoteLines.push(line);
        return;
      } else {
        flushBlockquote();
      }

      if (/^\s*[\-\*]\s/.test(line)) {
        listItems.push(line.replace(/^\s*[\-\*]\s/, ''));
        return;
      } else {
        flushList();
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${elements.length}`} className="font-serif text-lg font-bold text-[var(--text-primary)] mt-8 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${elements.length}`} className="font-serif text-xl font-bold text-[var(--text-primary)] mt-10 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }

      if (line.trim() === '') {
        elements.push(<div key={`sp-${elements.length}`} className="h-2" />);
        return;
      }

      elements.push(
        <p
          key={`p-${elements.length}`}
          className="text-[var(--text-primary)] leading-[1.8] mb-3"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    });

    flushList();
    flushBlockquote();
    return elements;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/30 flex items-start justify-center pt-12 sm:pt-20 px-4 overflow-y-auto pb-16"
        onClick={onClose}
      >
        <motion.article
          key="modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl bg-[var(--card-bg)] rounded-xl shadow-xl border border-[var(--card-border)] overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {isAdmin && onEdit && (
              <button
                onClick={() => {
                  onEdit(entry);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)]/20 transition-all"
                title="Edit entry"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}
            {isAdmin && onDelete && (
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this entry?')) {
                    const res = await fetch(`/api/entries/${entry.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      onDelete(entry.id);
                      onClose();
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                title="Delete entry"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-[var(--text-secondary)] mb-3 sm:mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(entry.date)}
              </div>
              <span>·</span>
              <span className="text-[var(--accent-terracotta)] font-medium">{entry.category}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-snug">
              {entry.title}
            </h1>
          </div>

          <div className="px-5 sm:px-8 py-6 sm:py-8 text-[14px] sm:text-[15px]">
            {renderContent(entry.content)}
          </div>
        </motion.article>
      </motion.div>
    </AnimatePresence>
  );
}
