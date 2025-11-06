"use client";

import Link from 'next/link';
import { useTripStore } from '@/lib/store';
import { useState } from 'react';
import { generateId } from '@/lib/utils';

export default function HomePage() {
  const trips = useTripStore((s) => s.trips);
  const createTrip = useTripStore((s) => s.createTrip);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = generateId();
    createTrip({ id, name: trimmed, currency, participants: [], expenses: [], createdAt: Date.now() });
    setName("");
  }

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Create a new trip</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label">Trip name</label>
            <input className="input" placeholder="e.g. Spain 2025" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {['USD','EUR','GBP','CAD','AUD','JPY','INR'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <button className="btn w-full" onClick={handleCreate}>Create Trip</button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your trips</h2>
        {trips.length === 0 ? (
          <p className="text-slate-600">No trips yet. Create one above.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {trips.map((t) => (
              <li key={t.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-slate-600">{new Date(t.createdAt).toLocaleString()} ? {t.currency}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/trip/${t.id}`} className="btn">Open</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
