import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, MapPin, User, Calendar, Trophy, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const TeamProfilePage = () => {
  const { id } = useParams();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamProfile = async () => {
      try {
        const res = await api.get(`/teams/${id}`);
        if (res.data.success) {
          setTeamData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch team profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="text-center py-16 text-slate-400">
        Team profile not found.
      </div>
    );
  }

  const { name, short_code, city, founded_year, venue_name, capacity, surface_type, coach_first_name, coach_last_name, coach_license, squad, recentMatches, upcomingMatches } = teamData;

  return (
    <div className="space-y-10 pb-16">
      
      {/* Back button */}
      <Link to="/teams" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Teams Directory
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-extrabold text-3xl text-emerald-400 shrink-0 shadow-lg">
          {short_code}
        </div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-white">{name}</h1>
            <span className="px-3 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 font-bold border border-slate-700">
              Est. {founded_year || 'N/A'}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-400" /> {city}</span>
            {venue_name && <span className="flex items-center gap-1.5">• Stadium: <strong className="text-slate-200">{venue_name} ({capacity?.toLocaleString()} seats)</strong></span>}
            {coach_first_name && <span className="flex items-center gap-1.5">• Manager: <strong className="text-slate-200">{coach_first_name} {coach_last_name}</strong></span>}
          </div>
        </div>
      </div>

      {/* Squad Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" /> Active Squad Roster
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {squad?.length || 0} Players
          </span>
        </div>

        {squad?.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No active players assigned to this club.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {squad.map((player) => (
              <Link
                key={player.player_id}
                to={`/players/${player.player_id}`}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 hover:border-emerald-500/40 hover:bg-slate-950 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
                  #{player.jersey_number}
                </div>
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors text-sm">
                    {player.first_name} {player.last_name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {player.position} • {player.nationality}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Match History & Upcoming Fixtures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Results */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" /> Recent Results
          </h3>
          {recentMatches?.length > 0 ? (
            recentMatches.map((m) => (
              <Link key={m.match_id} to={`/matches/${m.match_id}`} className="block bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all">
                <div className="text-xs text-slate-400 mb-1">{new Date(m.match_date).toLocaleDateString()}</div>
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className={m.home_team_id === parseInt(id) ? 'text-emerald-400' : 'text-slate-300'}>{m.home_team_name}</span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 text-white font-extrabold">{m.home_team_score} - {m.away_team_score}</span>
                  <span className={m.away_team_id === parseInt(id) ? 'text-emerald-400' : 'text-slate-300'}>{m.away_team_name}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-500">No completed matches yet.</p>
          )}
        </div>

        {/* Upcoming Fixtures */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" /> Scheduled Fixtures
          </h3>
          {upcomingMatches?.length > 0 ? (
            upcomingMatches.map((m) => (
              <Link key={m.match_id} to={`/matches/${m.match_id}`} className="block bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all">
                <div className="text-xs text-emerald-400 mb-1 font-semibold">{new Date(m.match_date).toLocaleDateString()} at {m.match_time}</div>
                <div className="flex items-center justify-between text-sm font-bold text-slate-200">
                  <span>{m.home_team_name}</span>
                  <span className="text-xs text-slate-500 font-semibold">VS</span>
                  <span>{m.away_team_name}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-500">No upcoming fixtures scheduled.</p>
          )}
        </div>

      </div>

    </div>
  );
};

export default TeamProfilePage;
