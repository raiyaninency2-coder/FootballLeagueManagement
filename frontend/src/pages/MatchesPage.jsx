import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import api from '../services/api';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        let url = '/matches';
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }
        const res = await api.get(url);
        if (res.data.success) {
          setMatches(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [statusFilter]);

  return (
    <div className="space-y-8 pb-16">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4" /> Fixtures & Results
          </div>
          <h1 className="text-3xl font-extrabold text-white">League Matches</h1>
          <p className="text-slate-400 text-sm">Follow upcoming match dates, venues, referees, and full-time scores.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2">
          {['', 'scheduled', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status === '' ? 'All Matches' : status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-400"></div>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No matches found for this filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((m) => {
            const isCompleted = m.status === 'completed';
            return (
              <Link
                key={m.match_id}
                to={`/matches/${m.match_id}`}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all hover:-translate-y-0.5 shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80">
                  <span className="font-semibold">Round {m.round_number} • {m.season_name}</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                    isCompleted ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div className="py-5 flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex-1 text-right pr-4">
                    <div className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {m.home_team_name}
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{m.home_short_code}</span>
                  </div>

                  {/* Score or VS Badge */}
                  <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                    {isCompleted ? (
                      <span className="text-xl font-black text-white">
                        {m.home_team_score} - {m.away_team_score}
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-emerald-400">VS</span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-left pl-4">
                    <div className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {m.away_team_name}
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{m.away_short_code}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{m.venue_name || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-emerald-400">
                    <span>Match Center</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MatchesPage;
