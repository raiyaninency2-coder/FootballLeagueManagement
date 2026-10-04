import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../services/api';

const StandingsPage = () => {
  const [standings, setStandings] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await api.get('/seasons');
        if (res.data.success && res.data.data.length > 0) {
          setSeasons(res.data.data);
          setSelectedSeason(res.data.data[0].season_id);
        }
      } catch (err) {
        console.error('Error fetching seasons:', err);
      }
    };
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/seasons/${selectedSeason}/standings`);
        if (res.data.success) {
          setStandings(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching standings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, [selectedSeason]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header & Season Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Trophy className="w-4 h-4" /> Official League Table
          </div>
          <h1 className="text-3xl font-extrabold text-white">Standings & Form Guide</h1>
          <p className="text-slate-400 text-sm">Calculated automatically in real-time from completed fixtures.</p>
        </div>

        {/* Season Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-medium">Season:</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-emerald-400 transition-colors"
          >
            {seasons.map((s) => (
              <option key={s.season_id} value={s.season_id}>
                {s.league_name} ({s.season_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-400"></div>
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No teams registered for this season yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 text-center w-12">Pos</th>
                  <th className="py-3.5 px-4">Club</th>
                  <th className="py-3.5 px-3 text-center">Played</th>
                  <th className="py-3.5 px-3 text-center">Won</th>
                  <th className="py-3.5 px-3 text-center">Drawn</th>
                  <th className="py-3.5 px-3 text-center">Lost</th>
                  <th className="py-3.5 px-3 text-center">GF</th>
                  <th className="py-3.5 px-3 text-center">GA</th>
                  <th className="py-3.5 px-3 text-center">GD</th>
                  <th className="py-3.5 px-5 text-right font-extrabold text-white">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {standings.map((team, index) => {
                  const isTop4 = index < 4;
                  return (
                    <tr
                      key={team.team_id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${
                          index === 0 ? 'bg-amber-400/20 text-amber-400 font-extrabold' : isTop4 ? 'bg-emerald-400/10 text-emerald-400' : 'text-slate-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link to={`/teams/${team.team_id}`} className="flex items-center space-x-3 group">
                          <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                            {team.short_code}
                          </span>
                          <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                            {team.team_name}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{team.played}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{team.won}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{team.drawn}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{team.lost}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{team.goals_for}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">{team.goals_against}</td>
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-200">
                        {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                      </td>
                      <td className="py-3.5 px-5 text-right font-extrabold text-white text-base">
                        {team.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default StandingsPage;
