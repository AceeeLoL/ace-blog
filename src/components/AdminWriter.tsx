'use client';

import { useState } from 'react';
import { X, Send, Eye, EyeOff } from 'lucide-react';

type AdminWriterProps = {
  isOpen: boolean;
  onClose: () => void;
  onEntryCreated: () => void;
};

const SUGGESTED_PINS = ['Reflections', 'Life', 'Dev Log', 'Thoughts', 'Travel'];

export default function AdminWriter({ isOpen, onClose, onEntryCreated }: AdminWriterProps) {
  const [showLogin, setShowLogin] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [title, setTitle] = useState('');
  const [pinName, setPinName] = useState('Reflections');
  const [content, setContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLogin(false);
      } else {
        setLoginError('Invalid password.');
      }
    } catch {
      setLoginError('Something went wrong. Try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: pinName.trim() || 'General',
        }),
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        setPinName('Reflections');
        onClose();
        onEntryCreated();
      }
    } catch (err) {
      console.error('Publish failed', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleClose = () => {
    setShowLogin(true);
    setPassword('');
    setLoginError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-8 sm:pt-12 px-3 sm:px-4 overflow-y-auto pb-8 sm:pb-10"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={16} />
        </button>

        {showLogin ? (
          <div className="p-6 sm:p-8 text-center">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-1">
              Admin Access
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-5 sm:mb-6">
              Enter the password to create entries.
            </p>

            <form onSubmit={handleLogin} className="max-w-xs mx-auto">
              <div className="relative mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-lg px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-terracotta)]/30"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {loginError && (
                <p className="text-red-500 text-xs mb-3">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={!password.trim() || loggingIn}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--accent-terracotta)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loggingIn ? 'Authenticating...' : 'Unlock'}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-5 sm:p-8">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
              New Blog Entry
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Entry title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent-terracotta)]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Pin Name / Category
                </label>
                <input
                  type="text"
                  placeholder="Type a custom Pin name (e.g. Reflections, Life, Dev Log)"
                  value={pinName}
                  onChange={(e) => setPinName(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent-terracotta)]/30 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-[var(--text-secondary)] py-0.5">Quick Pins:</span>
                  {SUGGESTED_PINS.map((pin) => (
                    <button
                      key={pin}
                      type="button"
                      onClick={() => setPinName(pin)}
                      className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
                        pinName === pin
                          ? 'bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]'
                          : 'border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--accent-terracotta)]/40'
                      }`}
                    >
                      {pin}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Content
                </label>
                <textarea
                  placeholder="Write your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent-terracotta)]/30 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!title.trim() || !content.trim() || publishing}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--accent-terracotta)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send size={14} />
                  {publishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
