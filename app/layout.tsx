import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Trip Expenses Agent',
  description: 'Track trips, expenses, participants, and settlements',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
          <div className="container py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Trip Expenses Agent</h1>
            <a className="text-sm text-slate-600 hover:text-slate-900" href="https://agentic-76f0df5c.vercel.app" target="_blank" rel="noreferrer">Open Deployed App</a>
          </div>
        </header>
        <main className="container py-8">
          {children}
        </main>
        <footer className="container py-8 text-center text-sm text-slate-500">
          Built with Next.js
        </footer>
      </body>
    </html>
  );
}
