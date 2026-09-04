'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="py-10 sm:py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8">
              About Me
            </h1>

            <div className="flex flex-col sm:flex-row gap-8 sm:gap-10">
              <div className="w-full sm:w-48 md:w-56 flex-shrink-0">
                <div className="w-full aspect-square max-w-[200px] sm:max-w-none rounded-xl border border-[var(--card-border)] overflow-hidden relative">
                  <Image
                    src="/profile.jpg"
                    alt="Profile photo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 200px, 224px"
                    priority
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary)] leading-[1.8] mb-4 text-[15px] sm:text-base">
                  Hi, I&apos;m <strong>Luigi Ace A. Losa</strong>. You can call me Ace!. I&apos;m a 3rd year Computer Science Student. Besides from programming, I mostly enjoy playing the guitar, reading some books, and now writing.
                </p>
                <p className="text-[var(--text-primary)] leading-[1.8] mb-4 text-[15px] sm:text-base">
                  This blog is a place where I share my thoughts, experiences, life lessons and learnings. 
                  I made this blog primarily to improve my writing skills, and to share a piece of my mind or life and hopefully you will find it useful or relatable. I also want to use this blog as a way to document my journey in life, and to look back on it in the future.
                </p>
                <p className="text-[var(--text-primary)] leading-[1.8] text-[15px] sm:text-base">
                  If you&apos;d like to reach out, head to the{' '}
                  <a href="/ask" className="text-[var(--accent-terracotta)] hover:underline font-medium">
                    Ask Me
                  </a>{' '}
                  page. I read every note. If it doesn&apos;t work for some reason, I&apos;ll fix it as soon as I can.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
