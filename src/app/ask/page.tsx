'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Shield, Infinity, Timer, CornerDownRight, Eye, EyeOff } from 'lucide-react';
import { VisitorQuestion } from '@/types';
import { timeAgo } from '@/lib/utils';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AskPage() {
  const [questions, setQuestions] = useState<VisitorQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [retention, setRetention] = useState<'ephemeral_24h' | 'permanent'>('permanent');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [visitorReplyingTo, setVisitorReplyingTo] = useState<string | null>(null);
  const [visitorReplyText, setVisitorReplyText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);
  const [visitorId, setVisitorId] = useState<string>('');

  useEffect(() => {
    let vid = localStorage.getItem('aceblog_visitor_id');
    if (!vid) {
      vid = `v_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('aceblog_visitor_id', vid);
    }
    setVisitorId(vid);
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    } catch {
    }
  };

  useEffect(() => {
    fetchQuestions();
    checkAdmin();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoggingIn(true);
    setAdminLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminPassword('');
      } else {
        setAdminLoginError('Invalid password.');
      }
    } catch {
      setAdminLoginError('Something went wrong.');
    } finally {
      setAdminLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsAdmin(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim() || 'Anonymous',
          question: questionText.trim(),
          retention,
          visitorId,
        }),
      });
      setQuestionText('');
      setAuthorName('');
      setShowForm(false);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to submit', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await fetch(`/api/questions/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyText: replyText.trim() }),
      });
      setReplyText('');
      setReplyingTo(null);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to reply', err);
    }
  };

  const handleVisitorReply = async (id: string) => {
    if (!visitorReplyText.trim()) return;
    try {
      await fetch(`/api/questions/${id}/visitor-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyText: visitorReplyText.trim(),
          visitorId,
        }),
      });
      setVisitorReplyText('');
      setVisitorReplyingTo(null);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to post follow-up', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="py-10 sm:py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 sm:mb-8">
              Ask Me
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
              <p className="text-[var(--text-secondary)] text-sm">
                Leave a note, ask a question, or just say hello.
              </p>
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--accent-olive)] font-medium flex items-center gap-1">
                      <Shield size={12} /> Admin
                    </span>
                    <button
                      onClick={handleAdminLogout}
                      className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : showAdminLogin ? (
                  <div className="flex flex-col items-end gap-1">
                    <form onSubmit={handleAdminLogin} className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type={showAdminPw ? 'text' : 'password'}
                          placeholder="Admin password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-36 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:border-[var(--accent-terracotta)] pr-7"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPw(!showAdminPw)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                        >
                          {showAdminPw ? <EyeOff size={10} /> : <Eye size={10} />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={!adminPassword.trim() || adminLoggingIn}
                        className="px-3 py-1.5 text-xs font-medium bg-[var(--accent-terracotta)] text-white rounded-lg disabled:opacity-40"
                      >
                        {adminLoggingIn ? '...' : 'Login'}
                      </button>
                    </form>
                    {adminLoginError && (
                      <p className="text-red-500 text-[11px]">{adminLoginError}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-terracotta)] transition-colors flex items-center gap-1"
                  >
                    <Shield size={12} /> Admin
                  </button>
                )}
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="text-sm text-[var(--accent-terracotta)] hover:text-[var(--accent-terracotta)]/80 font-medium transition-colors"
                >
                  {showForm ? 'Cancel' : 'Leave a note'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="overflow-hidden mb-8"
                >
                  <div className="border border-[var(--card-border)] rounded-xl p-5">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full bg-transparent border-b border-[var(--card-border)] px-0 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:border-[var(--accent-terracotta)] mb-4"
                    />

                    <textarea
                      placeholder="Write your message..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={3}
                      className="w-full bg-transparent border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:border-[var(--accent-terracotta)] resize-none mb-4"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRetention('ephemeral_24h')}
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                            retention === 'ephemeral_24h'
                              ? 'border-[var(--accent-amber)]/40 text-[var(--accent-amber)] bg-[var(--accent-amber)]/5'
                              : 'border-[var(--card-border)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <Timer size={12} /> 24h
                        </button>
                        <button
                          type="button"
                          onClick={() => setRetention('permanent')}
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                            retention === 'permanent'
                              ? 'border-[var(--accent-terracotta)]/40 text-[var(--accent-terracotta)] bg-[var(--accent-terracotta)]/5'
                              : 'border-[var(--card-border)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <Infinity size={12} /> Forever
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !questionText.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-terracotta)] text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
                      >
                        <Send size={13} />
                        {submitting ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
             </AnimatePresence>

            {loading ? (
              <div className="text-center py-10 text-[var(--text-secondary)] text-sm">Loading...</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
                No messages yet. Be the first to leave a note.
              </div>
            ) : (
              <div className="space-y-0">
                {questions.map((q, i) => {
                  const isMyQuestion = visitorId && q.visitorId === visitorId;

                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="py-5 border-b border-[var(--card-border)] last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{q.authorName}</span>
                          <span className="text-xs text-[var(--text-secondary)]/50">·</span>
                          <span className="text-xs text-[var(--text-secondary)]">{timeAgo(q.createdAt)}</span>
                        </div>
                        {q.retention === 'permanent' && (
                          <span className="text-[10px] text-[var(--accent-terracotta)] font-medium">Forever</span>
                        )}
                      </div>

                      <p className="text-[15px] text-[var(--text-primary)] leading-relaxed mb-2">{q.question}</p>

                      {q.visitorReply && (
                        <div className="ml-4 mt-2 border-l-2 border-[var(--accent-clay)]/20 pl-3 py-1">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1">
                            <CornerDownRight size={11} /> Follow-up by {q.authorName}
                            {q.visitorReplyAt && <span className="text-[var(--text-secondary)]/40">· {timeAgo(q.visitorReplyAt)}</span>}
                          </div>
                          <p className="text-sm text-[var(--text-primary)]">{q.visitorReply}</p>
                        </div>
                      )}

                      {q.adminReply && (
                        <div className="ml-4 mt-3 border-l-2 border-[var(--accent-terracotta)]/40 pl-3 py-1">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--accent-terracotta)] font-semibold mb-1">
                            <Shield size={11} /> Admin
                            {q.repliedAt && <span className="text-[var(--text-secondary)]/40 font-normal">· {timeAgo(q.repliedAt)}</span>}
                          </div>
                          <p className="text-sm text-[var(--text-primary)]">{q.adminReply}</p>
                        </div>
                      )}

                      {isMyQuestion && !q.visitorReply && !isAdmin && (
                        <div className="mt-3">
                          {visitorReplyingTo === q.id ? (
                            <div className="ml-4 flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a follow-up note..."
                                value={visitorReplyText}
                                onChange={(e) => setVisitorReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleVisitorReply(q.id)}
                                className="flex-1 bg-transparent border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:border-[var(--accent-terracotta)]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleVisitorReply(q.id)}
                                disabled={!visitorReplyText.trim()}
                                className="px-3 py-1.5 text-xs font-medium bg-[var(--accent-terracotta)] text-white rounded-lg disabled:opacity-40"
                              >
                                Send
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setVisitorReplyingTo(q.id); setVisitorReplyText(''); }}
                              className="text-xs text-[var(--accent-terracotta)] hover:underline flex items-center gap-1 font-medium"
                            >
                              <CornerDownRight size={11} /> Add a follow-up note
                            </button>
                          )}
                        </div>
                      )}

                      {isAdmin && (
                        <div className="mt-2">
                          {replyingTo === q.id ? (
                            <div className="ml-4 flex gap-2">
                              <input
                                type="text"
                                placeholder="Admin reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdminReply(q.id)}
                                className="flex-1 bg-transparent border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:border-[var(--accent-terracotta)]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleAdminReply(q.id)}
                                disabled={!replyText.trim()}
                                className="px-3 py-1.5 text-xs font-medium bg-[var(--accent-terracotta)] text-white rounded-lg disabled:opacity-40"
                              >
                                Send
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReplyingTo(q.id); setReplyText(''); }}
                              className="text-xs text-[var(--accent-olive)] hover:underline font-medium"
                            >
                              Admin Reply
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
