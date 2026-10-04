import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, ArrowRight } from 'lucide-react';
import api from '../services/api';

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [positionFilter, setPositionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        let url = '/players';
        if (positionFilter) {
          url += `?position=${positionFilter}`;
        }
        const res = await api.get(url);
        if (res.data.success) {
          setPlayers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load players:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [positionFilter]);

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  return (
    <div className="space-y-8 pb-16">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Users className="w-4 h-4" /> Players Registry
          </div>
          <h1 className="text-3xl font-extrabold text-white">League Athletes</h1>
          <p className="text-slate-400 text-sm">Browse player biographies, jersey numbers, and transfer histories.</p>
        </div>

        {/* Position Filter */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPositionFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              positionFilter === '' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                positionFilter === pos ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {players.map((p) => (
            <Link
              key={p.player_id}
              to={`/players/${p.player_id}`}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1 shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                    {p.jersey_number ? `#${p.jersey_number}` : '—'}
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                    {p.position || 'Player'}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {p.first_name} {p.last_name}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1">
                    {p.nationality}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{p.current_team_name ? <strong>{p.current_team_name}</strong> : <em className="text-slate-500">Free Agent</em>}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Career Profile</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};

export default PlayersPage;
