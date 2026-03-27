"use client";

import { useMemo } from "react";
import styles from "./QuoteWidget.module.css";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Consistency is the key to achieving and maintaining momentum.", author: "Darren Hardy" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Progress, not perfection, is what we should be asking of ourselves.", author: "Julia Cameron" },
];

interface Props {
  labels: {
    title: string;
  };
}

export function QuoteWidget({ labels }: Props) {
  const quote = useMemo(() => {
    // Use day of year as seed for daily rotation
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{labels.title}</h2>
      <blockquote className={styles.quote}>
        <p className={styles.text}>&ldquo;{quote.text}&rdquo;</p>
        <footer className={styles.author}>&mdash; {quote.author}</footer>
      </blockquote>
    </div>
  );
}
