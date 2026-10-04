import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Shield, ArrowLeft, Flame, AlertTriangle, Calendar, Award } from 'lucide-react';
import api from '../services/api';

const PlayerProfilePage = () => {
  const { id } = useParams();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/players/${id}`);
        if (res.data.success) {
          setPlayerData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch player profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="text-center py-16 text-slate-400">
        Player profile not found.
      </div>
    );
  }

  const { first_name, last_name, nationality, date_of_birth, height_cm, weight_kg, preferred_foot, current_club, career_history, stats, goals, cards } = playerData;

  return (
    <div className="space-y-10 pb-16">
      
      {/* Back button */}
      <Link to="/players" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Players
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-3xl text-emerald-400 shrink-0 shadow-lg">
          {current_club?.jersey_number ? `#${current_club.jersey_number}` : '⚽'}
        </div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-white">{first_name} {last_name}</h1>
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              {current_club?.position || 'Forward'}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <span>Nationality: <strong className="text-slate-200">{nationality}</strong></span>
            <span>• DOB: <strong className="text-slate-200">{new Date(date_of_birth).toLocaleDateString()}</strong></span>
            {height_cm && <span>• Height: <strong className="text-slate-200">{height_cm} cm</strong></span>}
            {preferred_foot && <span>• Foot: <strong className="text-slate-200">{preferred_foot}</strong></span>}
            {current_club && (
              <span>• Club: <strong className="text-emerald-400">{current_club.team_name}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Career Statistics Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.total_goals}</div>
            <div className="text-xs text-slate-400">Goals Scored</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.total_yellow_cards}</div>
            <div className="text-xs text-slate-400">Yellow Cards</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-900/30 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.total_red_cards}</div>
            <div className="text-xs text-slate-400">Red Cards</div>
          </div>
        </div>
      </div>

      {/* Career Clubs & Transfer History Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calendar className="w-4 h-4 text-emerald-400" /> Club Transfer & Membership History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-xs uppercase font-semibold">
                <th className="py-2.5 px-3">Club</th>
                <th className="py-2.5 px-3 text-center">Jersey #</th>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Joined</th>
                <th className="py-2.5 px-3">Left</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {career_history.map((record) => (
                <tr key={record.membership_id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <Link to={`/teams/${record.team_id}`} className="font-bold text-slate-200 hover:text-emerald-400 transition-colors">
                      {record.team_name}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-400">#{record.jersey_number}</td>
                  <td className="py-3 px-3 text-slate-300">{record.position}</td>
                  <td className="py-3 px-3 text-slate-400">{new Date(record.start_date).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-slate-400">
                    {record.end_date ? new Date(record.end_date).toLocaleDateString() : 'Present'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      record.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {record.is_active ? 'Active' : 'Past Club'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goal Events History */}
      {goals.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Flame className="w-4 h-4 text-emerald-400" /> Recorded Match Goals
          </h2>
          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.goal_id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-emerald-400 mr-2">{g.minute}'</span>
                  <span className="text-slate-200 font-semibold">{g.goal_type?.toUpperCase()} Goal</span>
                  <span className="text-slate-400 text-xs ml-2">for {g.credited_team_name}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(g.match_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PlayerProfilePage;
