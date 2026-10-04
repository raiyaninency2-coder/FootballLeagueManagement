import React, { useEffect, useState } from 'react';
import { UserCheck, Award, MapPin } from 'lucide-react';
import api from '../services/api';

const OfficialsPage = () => {
  const [tab, setTab] = useState('coaches');
  const [coaches, setCoaches] = useState([]);
  const [referees, setReferees] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, rRes, vRes] = await Promise.all([
          api.get('/coaches'),
          api.get('/referees'),
          api.get('/venues')
        ]);
        if (cRes.data.success) setCoaches(cRes.data.data);
        if (rRes.data.success) setReferees(rRes.data.data);
        if (vRes.data.success) setVenues(vRes.data.data);
      } catch (err) {
        console.error('Failed to load officials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <UserCheck className="w-4 h-4" /> League Personnel & Grounds
          </div>
          <h1 className="text-3xl font-extrabold text-white">Officials & Venues</h1>
          <p className="text-slate-400 text-sm">Certified managers, match referees, and official stadium grounds.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          {[
            { id: 'coaches', label: 'Managers', count: coaches.length },
            { id: 'referees', label: 'Referees', count: referees.length },
            { id: 'venues', label: 'Stadiums', count: venues.length }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === t.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-400"></div>
        </div>
      ) : (
        <div>
          {/* 1. Coaches Tab */}
          {tab === 'coaches' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {coaches.map((c) => (
                <div key={c.coach_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xl text-emerald-400">
                      👔
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      {c.license_level}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{c.first_name} {c.last_name}</h2>
                    <div className="text-xs text-slate-400 mt-1">{c.nationality} • {c.experience_years} yrs exp</div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-300">
                    Club: <strong className="text-white">{c.current_team_name || 'Unattached'}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Referees Tab */}
          {tab === 'referees' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {referees.map((r) => (
                <div key={r.referee_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xl text-emerald-400">
                      ⏱️
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                      {r.badge_level}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{r.first_name} {r.last_name}</h2>
                    <div className="text-xs text-slate-400 mt-1">{r.nationality} • {r.experience_years} yrs exp</div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-300">
                    Matches Officiated: <strong className="text-emerald-400 font-bold">{r.total_matches_officiated || 0}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Venues Tab */}
          {tab === 'venues' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {venues.map((v) => (
                <div key={v.venue_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xl text-emerald-400">
                      🏟️
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {v.surface_type}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{v.name}</h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{v.city}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>Capacity: <strong className="text-white font-bold">{v.capacity?.toLocaleString()}</strong></span>
                    {v.tenant_team_name && <span className="text-emerald-400 font-medium">{v.tenant_team_name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default OfficialsPage;
