import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, PlusCircle, Calendar, Flame, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminDashboardPage = () => {
  const { admin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('match-recorder');
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Selected match for event recorder
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [matchDetails, setMatchDetails] = useState(null);

  // Goal Form State
  const [goalTeamId, setGoalTeamId] = useState('');
  const [goalPlayerId, setGoalPlayerId] = useState('');
  const [goalMinute, setGoalMinute] = useState('');
  const [goalType, setGoalType] = useState('regular');

  // Card Form State
  const [cardTeamId, setCardTeamId] = useState('');
  const [cardPlayerId, setCardPlayerId] = useState('');
  const [cardMinute, setCardMinute] = useState('');
  const [cardType, setCardType] = useState('yellow');
  const [cardReason, setCardReason] = useState('');

  // New Team Form State
  const [newTeam, setNewTeam] = useState({ name: '', short_code: '', city: '', founded_year: '' });

  // New Match Schedule State
  const [newMatch, setNewMatch] = useState({
    season_id: 1, home_team_id: '', away_team_id: '', venue_id: '', referee_id: '', match_date: '', match_time: '', round_number: 1
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [mRes, tRes, pRes, vRes, rRes] = await Promise.all([
        api.get('/matches'),
        api.get('/teams'),
        api.get('/players'),
        api.get('/venues'),
        api.get('/referees')
      ]);
      if (mRes.data.success) {
        setMatches(mRes.data.data);
        if (mRes.data.data.length > 0 && !selectedMatchId) {
          setSelectedMatchId(mRes.data.data[0].match_id);
        }
      }
      if (tRes.data.success) setTeams(tRes.data.data);
      if (pRes.data.success) setPlayers(pRes.data.data);
      if (vRes.data.success) setVenues(vRes.data.data);
      if (rRes.data.success) setReferees(rRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load detailed match info when selected match changes
  useEffect(() => {
    if (!selectedMatchId) return;
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/matches/${selectedMatchId}`);
        if (res.data.success) {
          setMatchDetails(res.data.data);
          setGoalTeamId(res.data.data.home_team_id);
          setCardTeamId(res.data.data.home_team_id);
        }
      } catch (err) {
        console.error('Failed to load match:', err);
      }
    };
    fetchMatch();
  }, [selectedMatchId]);

  // Handlers for Match Events
  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/matches/${selectedMatchId}/goals`, {
        team_id: goalTeamId,
        player_id: goalPlayerId,
        minute: parseInt(goalMinute),
        goal_type: goalType
      });
      if (res.data.success) {
        setStatusMsg('⚽ Goal added! Scoreboard recalculated automatically.');
        // Refresh match
        const mRes = await api.get(`/matches/${selectedMatchId}`);
        setMatchDetails(mRes.data.data);
        setGoalMinute('');
      }
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await api.delete(`/matches/goals/${goalId}`);
      setStatusMsg('Goal removed and match score updated.');
      const mRes = await api.get(`/matches/${selectedMatchId}`);
      setMatchDetails(mRes.data.data);
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.message}`);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/matches/${selectedMatchId}/cards`, {
        team_id: cardTeamId,
        player_id: cardPlayerId,
        minute: parseInt(cardMinute),
        card_type: cardType,
        reason: cardReason
      });
      if (res.data.success) {
        setStatusMsg('Card event booked.');
        const mRes = await api.get(`/matches/${selectedMatchId}`);
        setMatchDetails(mRes.data.data);
        setCardMinute('');
        setCardReason('');
      }
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/matches/${selectedMatchId}/status`, { status: newStatus });
      setStatusMsg(`Match status changed to ${newStatus}. Standings updated!`);
      const mRes = await api.get(`/matches/${selectedMatchId}`);
      setMatchDetails(mRes.data.data);
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.message}`);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/teams', newTeam);
      if (res.data.success) {
        setStatusMsg(`Team ${newTeam.name} created successfully!`);
        setNewTeam({ name: '', short_code: '', city: '', founded_year: '' });
        loadData();
      }
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleScheduleMatch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/matches', newMatch);
      if (res.data.success) {
        setStatusMsg('Match scheduled successfully!');
        loadData();
      }
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  // Filter players for goal/card dropdown based on selected team
  const availableSquad = goalTeamId === matchDetails?.home_team_id
    ? matchDetails?.home_squad
    : matchDetails?.away_squad;

  const cardSquad = cardTeamId === matchDetails?.home_team_id
    ? matchDetails?.home_squad
    : matchDetails?.away_squad;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Protected Admin Management
          </span>
          <h1 className="text-3xl font-black text-white">League Control Center</h1>
          <p className="text-xs text-slate-400">
            Logged in as: <strong className="text-emerald-400">{admin?.full_name} ({admin?.username})</strong>
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'match-recorder', label: 'Match Event Recorder', icon: Flame },
            { id: 'schedule-match', label: 'Schedule Fixture', icon: Calendar },
            { id: 'add-team', label: 'Add Club', icon: Shield }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === t.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. MATCH EVENT RECORDER TAB */}
      {activeTab === 'match-recorder' && (
        <div className="space-y-8">
          
          {/* Match Picker Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-300">Select Match:</label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-400 flex-1"
              >
                {matches.map((m) => (
                  <option key={m.match_id} value={m.match_id}>
                    Match #{m.match_id}: {m.home_team_name} vs {m.away_team_name} ({m.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Change Status Buttons */}
            {matchDetails && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                {['scheduled', 'live', 'completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      matchDetails.status === st
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {matchDetails && (
            <>
              {/* Scoreboard Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-xl font-black text-white">{matchDetails.home_team_name}</div>
                  <div className="text-xs text-slate-400">{matchDetails.home_short_code}</div>
                </div>
                <div className="px-6 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-3xl font-black text-emerald-400">
                    {matchDetails.home_team_score} - {matchDetails.away_team_score}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">
                    Auto-Calculated by Trigger
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xl font-black text-white">{matchDetails.away_team_name}</div>
                  <div className="text-xs text-slate-400">{matchDetails.away_short_code}</div>
                </div>
              </div>

              {/* Event Logging Forms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Log Goal Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Flame className="w-4 h-4 text-emerald-400" /> Log Goal Event
                  </h3>
                  <form onSubmit={handleAddGoal} className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Beneficiary Team (Score +1)</label>
                      <select
                        value={goalTeamId}
                        onChange={(e) => {
                          setGoalTeamId(parseInt(e.target.value));
                          setGoalPlayerId('');
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value={matchDetails.home_team_id}>{matchDetails.home_team_name}</option>
                        <option value={matchDetails.away_team_id}>{matchDetails.away_team_name}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Scorer</label>
                      <select
                        required
                        value={goalPlayerId}
                        onChange={(e) => setGoalPlayerId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="">Select Scorer</option>
                        {availableSquad?.map((p) => (
                          <option key={p.player_id} value={p.player_id}>
                            #{p.jersey_number} {p.first_name} {p.last_name} ({p.position})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Minute (1-120)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="120"
                          value={goalMinute}
                          onChange={(e) => setGoalMinute(e.target.value)}
                          placeholder="e.g. 24"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Goal Type</label>
                        <select
                          value={goalType}
                          onChange={(e) => setGoalType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        >
                          <option value="regular">Regular</option>
                          <option value="penalty">Penalty</option>
                          <option value="own_goal">Own Goal</option>
                          <option value="free_kick">Free Kick</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
                    >
                      Record Goal
                    </button>
                  </form>

                  {/* Existing Goals List with Delete */}
                  {matchDetails.goals?.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-slate-400">Current Match Goals:</div>
                      {matchDetails.goals.map((g) => (
                        <div key={g.goal_id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                          <span>{g.minute}' <strong>{g.scorer_name}</strong> ({g.credited_team_code})</span>
                          <button
                            onClick={() => handleDeleteGoal(g.goal_id)}
                            className="text-rose-400 hover:text-rose-300 font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Log Card Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Book Disciplinary Card
                  </h3>
                  <form onSubmit={handleAddCard} className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Team</label>
                      <select
                        value={cardTeamId}
                        onChange={(e) => {
                          setCardTeamId(parseInt(e.target.value));
                          setCardPlayerId('');
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value={matchDetails.home_team_id}>{matchDetails.home_team_name}</option>
                        <option value={matchDetails.away_team_id}>{matchDetails.away_team_name}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Player</label>
                      <select
                        required
                        value={cardPlayerId}
                        onChange={(e) => setCardPlayerId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="">Select Player</option>
                        {cardSquad?.map((p) => (
                          <option key={p.player_id} value={p.player_id}>
                            #{p.jersey_number} {p.first_name} {p.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Minute</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="120"
                          value={cardMinute}
                          onChange={(e) => setCardMinute(e.target.value)}
                          placeholder="e.g. 65"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Card Type</label>
                        <select
                          value={cardType}
                          onChange={(e) => setCardType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        >
                          <option value="yellow">Yellow Card</option>
                          <option value="red">Red Card</option>
                          <option value="second_yellow">Second Yellow</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Reason (Optional)</label>
                      <input
                        type="text"
                        value={cardReason}
                        onChange={(e) => setCardReason(e.target.value)}
                        placeholder="e.g. Tactical foul / Dissent"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                    >
                      Book Card
                    </button>
                  </form>
                </div>

              </div>
            </>
          )}

        </div>
      )}

      {/* 2. SCHEDULE MATCH TAB */}
      {activeTab === 'schedule-match' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-emerald-400" /> Schedule New Match
          </h2>
          <form onSubmit={handleScheduleMatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Home Team</label>
                <select
                  required
                  value={newMatch.home_team_id}
                  onChange={(e) => setNewMatch({ ...newMatch, home_team_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Select Home Club</option>
                  {teams.map((t) => (
                    <option key={t.team_id} value={t.team_id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Away Team</label>
                <select
                  required
                  value={newMatch.away_team_id}
                  onChange={(e) => setNewMatch({ ...newMatch, away_team_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Select Away Club</option>
                  {teams.map((t) => (
                    <option key={t.team_id} value={t.team_id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newMatch.match_date}
                  onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Kickoff Time</label>
                <input
                  type="time"
                  required
                  value={newMatch.match_time}
                  onChange={(e) => setNewMatch({ ...newMatch, match_time: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Stadium Venue</label>
                <select
                  value={newMatch.venue_id}
                  onChange={(e) => setNewMatch({ ...newMatch, venue_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Select Venue (Optional)</option>
                  {venues.map((v) => (
                    <option key={v.venue_id} value={v.venue_id}>{v.name} ({v.city})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Referee</label>
                <select
                  value={newMatch.referee_id}
                  onChange={(e) => setNewMatch({ ...newMatch, referee_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Select Referee (Optional)</option>
                  {referees.map((r) => (
                    <option key={r.referee_id} value={r.referee_id}>{r.first_name} {r.last_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Confirm Match Schedule
            </button>
          </form>
        </div>
      )}

      {/* 3. ADD CLUB TAB */}
      {activeTab === 'add-team' && (
        <div className="max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" /> Register New Football Club
          </h2>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Club Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Tottenham Hotspur"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Short Code (3-4 chars)</label>
                <input
                  type="text"
                  required
                  maxLength="5"
                  placeholder="TOT"
                  value={newTeam.short_code}
                  onChange={(e) => setNewTeam({ ...newTeam, short_code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white uppercase"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="London"
                  value={newTeam.city}
                  onChange={(e) => setNewTeam({ ...newTeam, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Founded Year</label>
              <input
                type="number"
                placeholder="1882"
                value={newTeam.founded_year}
                onChange={(e) => setNewTeam({ ...newTeam, founded_year: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Create Club
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
