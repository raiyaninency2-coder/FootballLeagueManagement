import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Shield, Users, Flame, Calendar, ArrowRight, Activity, MapPin } from 'lucide-react';
import api from '../services/api';

const HomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/public/home-summary');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        setError('Could not connect to the backend server. Make sure the Node.js backend is running on port 5000.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-center">
        <h2 className="text-xl font-bold text-rose-300 mb-2">Connection Error</h2>
        <p className="text-slate-300 text-sm">{error}</p>
      </div>
    );
  }

  const { stats, topStandings, upcomingMatches, recentResults } = data;

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            Live Season 2024/2025
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            The Ultimate Football <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              League Management Hub
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Track real-time automated standings, club rosters, match fixtures, player transfer histories, and match events with relational database accuracy.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/standings"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/25"
            >
              <span>View Full Standings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/matches"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Fixtures & Results</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Quick Statistics Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Teams', value: stats.total_teams, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Registered Players', value: stats.total_players, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Matches Scheduled', value: stats.total_matches, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Goals Scored', value: stats.total_goals, icon: Flame, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4 shadow-sm hover:border-slate-700 transition-all">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{item.value}</div>
                <div className="text-xs text-slate-400 font-medium">{item.label}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Main Split Grid: Standings Preview + Match Highlights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Live League Standings */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Season Standings</h2>
            </div>
            <Link to="/standings" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Full Table <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-xs uppercase font-semibold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Club</th>
                  <th className="py-2.5 px-2 text-center">PL</th>
                  <th className="py-2.5 px-2 text-center">W</th>
                  <th className="py-2.5 px-2 text-center">D</th>
                  <th className="py-2.5 px-2 text-center">L</th>
                  <th className="py-2.5 px-2 text-center">GD</th>
                  <th className="py-2.5 px-3 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {topStandings.map((team, index) => (
                  <tr key={team.team_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-bold">{index + 1}</td>
                    <td className="py-3 px-3">
                      <Link to={`/teams/${team.team_id}`} className="flex items-center space-x-2.5 group">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                          {team.short_code}
                        </span>
                        <span className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                          {team.team_name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-center text-slate-400">{team.played}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{team.won}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{team.drawn}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{team.lost}</td>
                    <td className="py-3 px-2 text-center font-semibold text-slate-300">
                      {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-white text-base">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Column: Matches & Results Highlights */}
        <div className="space-y-6">
          
          {/* Upcoming Fixture Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> Upcoming Match
              </h3>
              <Link to="/matches" className="text-xs text-slate-400 hover:text-emerald-400">All</Link>
            </div>

            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((m) => (
                <Link
                  key={m.match_id}
                  to={`/matches/${m.match_id}`}
                  className="block bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-emerald-500/40 transition-all group"
                >
                  <div className="text-xs text-slate-400 flex items-center justify-between mb-2">
                    <span>Round {m.round_number}</span>
                    <span className="text-emerald-400 font-medium">{new Date(m.match_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {m.home_team_name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 font-bold">VS</span>
                    <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {m.away_team_name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {m.venue_name || 'TBD'}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-500">No scheduled matches.</p>
            )}
          </div>

          {/* Recent Result Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Recent Result
              </h3>
            </div>

            {recentResults.length > 0 ? (
              recentResults.map((m) => (
                <Link
                  key={m.match_id}
                  to={`/matches/${m.match_id}`}
                  className="block bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-emerald-500/40 transition-all"
                >
                  <div className="text-xs text-slate-400 mb-2">Full Time • {new Date(m.match_date).toLocaleDateString()}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 font-bold text-slate-200">{m.home_team_name}</div>
                    <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-extrabold text-emerald-400 text-sm">
                      {m.home_team_score} - {m.away_team_score}
                    </div>
                    <div className="flex-1 text-right font-bold text-slate-200">{m.away_team_name}</div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-500">No completed matches yet.</p>
            )}
          </div>

        </div>

      </section>

    </div>
  );
};

export default HomePage;
