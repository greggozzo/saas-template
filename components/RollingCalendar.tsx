// components/RollingCalendar.tsx
'use client';

import { useMemo } from 'react';

interface Show {
  tmdb_id: number;
  service: string;
  window: { primarySubscribe: string };
  favorite: boolean;
}

interface Props {
  shows: Show[];
  onAffiliateClick?: (service: string, month: string) => void;
}

// Convert "February 2026" → "Feb 2026"
const normalizeMonth = (fullMonth: string): string => {
  if (!fullMonth || fullMonth === 'TBD') return 'TBD';
  const [monthName, year] = fullMonth.split(' ');
  const short = monthName.slice(0, 3);
  return `${short} ${year}`;
};

const getNext12Months = () => {
  const months: string[] = [];
  let date = new Date();
  for (let i = 0; i < 12; i++) {
    months.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
    date.setMonth(date.getMonth() + 1);
  }
  return months;
};

export default function RollingCalendar({ shows, onAffiliateClick }: Props) {
  const months = useMemo(() => getNext12Months(), []);

  const calendar: Record<string, Show> = {};

  // Group by normalized preferred month
  const byMonth: Record<string, Show[]> = {};
  shows.forEach(show => {
    const normalized = normalizeMonth(show.window.primarySubscribe);
    if (!byMonth[normalized]) byMonth[normalized] = [];
    byMonth[normalized].push(show);
  });

  // Process each month in order
  months.forEach(month => {
    const contenders = byMonth[month] || [];

    if (contenders.length === 0) return;

    if (contenders.length === 1) {
      calendar[month] = contenders[0];
    } else {
      // Conflict → favorite wins
      const favorite = contenders.find(s => s.favorite);
      const winner = favorite || contenders[0];
      calendar[month] = winner;

      // Push losers forward
      const losers = contenders.filter(s => s !== winner);
      let nextIdx = months.indexOf(month) + 1;

      losers.forEach(loser => {
        let pushMonth = months[nextIdx];
        while (calendar[pushMonth] && nextIdx < months.length) {
          nextIdx++;
          pushMonth = months[nextIdx];
        }
        if (pushMonth) calendar[pushMonth] = loser;
        nextIdx++;
      });
    }
  });

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold mb-6">Your Rolling Plan</h2>
      <div className="bg-zinc-900 rounded-3xl p-8 grid grid-cols-12 gap-3">
        {months.map(month => {
          const entry = calendar[month];
          return (
            <div key={month} className="text-center">
              <div className="text-xs text-zinc-500 mb-2 font-mono">{month}</div>
              {entry ? (
                <button
                  onClick={() => onAffiliateClick?.(entry.service, month)}
                  className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-4 px-5 rounded-2xl transition-all active:scale-95"
                >
                  {entry.service}
                </button>
              ) : (
                <div className="text-zinc-600 text-sm py-4 border border-dashed border-zinc-700 rounded-2xl">
                  Open
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}