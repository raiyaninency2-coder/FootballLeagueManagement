import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, User, ArrowRight } from 'lucide-react';
import api from '../services/api';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get('/teams');
        if (res.data.success) {
          setTeams(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <Shield className="w-4 h-4" /> Clubs Directory
        </div>
        <h1 className="text-3xl font-extrabold text-white">Football League Clubs</h1>
        <p className="text-slate-400 text-sm">Explore official squads, stadiums, managers, and fixtures.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link
              key={team.team_id}
              to={`/teams/${team.team_id}`}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-extrabold text-xl text-emerald-400 shadow-inner group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                    {team.short_code}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                    Est. {team.founded_year || 'N/A'}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {team.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{team.city}</span>
                    {team.venue_name && <span>• {team.venue_name}</span>}
                  </div>
                </div>

                {team.coach_name && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Manager: <strong className="text-white">{team.coach_name}</strong></span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-400 pt-3 border-t border-slate-800/60">
                <span>View Full Profile & Squad</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};

export default TeamsPage;
