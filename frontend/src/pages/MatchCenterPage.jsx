import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, UserCheck, Flame, AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import api from '../services/api';

const MatchCenterPage = () => {
  const { id } = useParams();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/matches/${id}`);
        if (res.data.success) {
          setMatchData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load match details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!matchData) {
    return <div className="text-center py-16 text-slate-400">Match not found.</div>;
  }

  const {
    home_team_id, home_team_name, home_short_code, home_team_score,
    away_team_id, away_team_name, away_short_code, away_team_score,
    match_date, match_time, round_number, status, season_name, league_name,
    venue_name, venue_city, capacity,
    ref_first_name, ref_last_name, ref_badge,
    goals, cards, home_squad, away_squad
  } = matchData;

  const isCompleted = status === 'completed';

  return (
    <div className="space-y-10 pb-16">
      
      {/* Back link */}
      <Link to="/matches" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Matches
      </Link>

      {/* Main Scoreboard Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700/60 pb-3">
          <span>{league_name} • {season_name} • Round {round_number}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            isCompleted ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 py-4">
          
          {/* Home Club */}
          <Link to={`/teams/${home_team_id}`} className="flex-1 text-center group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl sm:text-2xl font-black text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shadow-md">
              {home_short_code}
            </div>
            <div className="mt-3 font-extrabold text-base sm:text-xl text-white group-hover:text-emerald-400 transition-colors">
              {home_team_name}
            </div>
          </Link>

          {/* Big Score Box */}
          <div className="px-6 py-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center shrink-0 shadow-inner">
            {isCompleted ? (
              <div className="text-3xl sm:text-5xl font-black text-white tracking-wider">
                {home_team_score} - {away_team_score}
              </div>
            ) : (
              <div className="text-xl sm:text-3xl font-black text-emerald-400">VS</div>
            )}
            <div className="text-xs text-slate-400 mt-2 font-medium">
              {new Date(match_date).toLocaleDateString()} • {match_time}
            </div>
          </div>

          {/* Away Club */}
          <Link to={`/teams/${away_team_id}`} className="flex-1 text-center group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl sm:text-2xl font-black text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shadow-md">
              {away_short_code}
            </div>
            <div className="mt-3 font-extrabold text-base sm:text-xl text-white group-hover:text-emerald-400 transition-colors">
              {away_team_name}
            </div>
          </Link>

        </div>

        {/* Stadium & Referee Details Bar */}
        <div className="pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          {venue_name && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Venue: <strong className="text-slate-200">{venue_name} ({venue_city})</strong>
            </span>
          )}
          {ref_first_name && (
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Referee: <strong className="text-slate-200">{ref_first_name} {ref_last_name} ({ref_badge})</strong>
            </span>
          )}
        </div>
      </div>

      {/* Match Events Split (Goals & Disciplinary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Goals Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Flame className="w-4 h-4 text-emerald-400" /> Match Goals
          </h2>
          {goals?.length > 0 ? (
            <div className="space-y-3">
              {goals.map((g) => (
                <div key={g.goal_id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-extrabold text-emerald-400 mr-2">{g.minute}'</span>
                    <strong className="text-slate-100">{g.scorer_name}</strong>
                    <span className="text-xs text-slate-400 ml-2 font-medium">({g.credited_team_code})</span>
                    {g.assist_name && (
                      <div className="text-xs text-slate-400 mt-0.5">Assist: {g.assist_name}</div>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 capitalize font-medium">
                    {g.goal_type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-3">No goals recorded in this match.</p>
          )}
        </div>

        {/* Cards Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Disciplinary Bookings
          </h2>
          {cards?.length > 0 ? (
            <div className="space-y-3">
              {cards.map((c) => (
                <div key={c.card_id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-extrabold text-slate-400 mr-2">{c.minute}'</span>
                    <strong className="text-slate-100">{c.player_name}</strong>
                    <span className="text-xs text-slate-400 ml-2">({c.team_code})</span>
                    {c.reason && (
                      <div className="text-xs text-slate-400 mt-0.5">{c.reason}</div>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                    c.card_type === 'red' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {c.card_type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-3">Clean game! No cards awarded.</p>
          )}
        </div>

      </div>

      {/* Team Lineups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Home Lineup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> {home_team_name} Squad
          </h3>
          <div className="space-y-2">
            {home_squad?.map((p) => (
              <Link key={p.player_id} to={`/players/${p.player_id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/40 text-xs">
                <span className="font-bold text-emerald-400 w-8">#{p.jersey_number}</span>
                <span className="flex-1 font-semibold text-slate-200">{p.first_name} {p.last_name}</span>
                <span className="text-slate-400">{p.position}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Away Lineup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> {away_team_name} Squad
          </h3>
          <div className="space-y-2">
            {away_squad?.map((p) => (
              <Link key={p.player_id} to={`/players/${p.player_id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/40 text-xs">
                <span className="font-bold text-emerald-400 w-8">#{p.jersey_number}</span>
                <span className="flex-1 font-semibold text-slate-200">{p.first_name} {p.last_name}</span>
                <span className="text-slate-400">{p.position}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default MatchCenterPage;
