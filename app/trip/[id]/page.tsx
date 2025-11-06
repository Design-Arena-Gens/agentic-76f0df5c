"use client";

import { useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { computeSettlements, formatCurrency } from '@/lib/utils';

export default function TripPage() {
  const params = useParams();
  const id = params?.id as string;
  const trip = useTripStore((s) => s.trips.find((t) => t.id === id));
  const updateTrip = useTripStore((s) => s.updateTrip);
  const removeTrip = useTripStore((s) => s.removeTrip);

  const [participantName, setParticipantName] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<string>("");
  const [payerId, setPayerId] = useState<string>("");

  const totals = useMemo(() => {
    if (!trip) return { byPerson: {}, total: 0 };
    const byPerson: Record<string, number> = {};
    for (const p of trip.participants) byPerson[p.id] = 0;
    for (const e of trip.expenses) {
      byPerson[e.payerId] = (byPerson[e.payerId] ?? 0) + e.amount;
    }
    const total = trip.expenses.reduce((s, e) => s + e.amount, 0);
    return { byPerson, total };
  }, [trip]);

  if (!trip) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Trip not found.</p>
        <Link href="/" className="btn">Back home</Link>
      </div>
    );
  }

  const settlements = computeSettlements(trip.participants, trip.expenses);

  function addParticipant() {
    const name = participantName.trim();
    if (!name) return;
    updateTrip(trip.id, {
      participants: [
        ...trip.participants,
        { id: crypto.randomUUID(), name }
      ]
    });
    setParticipantName("");
  }

  function removeParticipant(pid: string) {
    const remaining = trip.participants.filter((p) => p.id !== pid);
    const remainingIds = new Set(remaining.map((p) => p.id));
    const filteredExpenses = trip.expenses.filter((e) => e.payerId === pid ? false : e.consumerIds.every((cid) => remainingIds.has(cid)));
    updateTrip(trip.id, { participants: remaining, expenses: filteredExpenses });
  }

  function addExpense() {
    const amount = Number(expenseAmount);
    if (!expenseDesc.trim() || !amount || amount <= 0 || !payerId) return;
    if (trip.participants.length === 0) return;
    const consumers = trip.participants.map((p) => p.id);
    updateTrip(trip.id, {
      expenses: [
        ...trip.expenses,
        {
          id: crypto.randomUUID(),
          description: expenseDesc.trim(),
          amount,
          payerId,
          consumerIds: consumers,
          createdAt: Date.now()
        }
      ]
    });
    setExpenseDesc("");
    setExpenseAmount("");
  }

  function deleteExpense(expenseId: string) {
    updateTrip(trip.id, { expenses: trip.expenses.filter((e) => e.id !== expenseId) });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{trip.name}</h2>
          <div className="text-sm text-slate-600">Currency: {trip.currency}</div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn">All Trips</Link>
          <button className="btn bg-red-600 hover:bg-red-700" onClick={() => { removeTrip(trip.id); }}>Delete Trip</button>
        </div>
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold">Participants</h3>
          <div className="flex gap-2">
            <input className="input" placeholder="Name" value={participantName} onChange={(e) => setParticipantName(e.target.value)} />
            <button className="btn" onClick={addParticipant}>Add</button>
          </div>
          {trip.participants.length === 0 ? (
            <p className="text-sm text-slate-600">No participants yet.</p>
          ) : (
            <ul className="space-y-2">
              {trip.participants.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <button className="text-red-600 hover:underline" onClick={() => removeParticipant(p.id)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-semibold">Add Expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input className="input" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} placeholder="e.g. Dinner" />
            </div>
            <div>
              <label className="label">Amount ({trip.currency})</label>
              <input className="input" type="number" min="0" step="0.01" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
            </div>
            <div>
              <label className="label">Payer</label>
              <select className="input" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
                <option value="">Select</option>
                {trip.participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <button className="btn" onClick={addExpense} disabled={!payerId}>Add Expense</button>
          </div>
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h3 className="font-semibold">Expenses</h3>
        {trip.expenses.length === 0 ? (
          <p className="text-sm text-slate-600">No expenses yet.</p>
        ) : (
          <ul className="divide-y">
            {trip.expenses.map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{e.description}</div>
                  <div className="text-sm text-slate-600">
                    {formatCurrency(e.amount, trip.currency)} paid by {trip.participants.find((p) => p.id === e.payerId)?.name}
                  </div>
                </div>
                <button className="text-red-600 hover:underline" onClick={() => deleteExpense(e.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-2">
          <h3 className="font-semibold">Totals</h3>
          <div className="text-sm text-slate-700">Trip total: {formatCurrency(totals.total, trip.currency)}</div>
          <ul className="text-sm text-slate-600">
            {trip.participants.map((p) => (
              <li key={p.id}>{p.name}: {formatCurrency(totals.byPerson[p.id] ?? 0, trip.currency)}</li>
            ))}
          </ul>
        </div>
        <div className="card p-5 space-y-2">
          <h3 className="font-semibold">Settlements</h3>
          {settlements.length === 0 ? (
            <p className="text-sm text-slate-600">Everyone is settled up.</p>
          ) : (
            <ul className="text-sm text-slate-700 space-y-1">
              {settlements.map((s, idx) => (
                <li key={idx}>{s.from} pays {s.to} {formatCurrency(s.amount, trip.currency)}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
