-- =============================================================================
-- FOOTBALL LEAGUE MANAGEMENT SYSTEM - SAMPLE SEED DATA
-- Target Database: MySQL 8.0+
-- =============================================================================

USE football_league_db;

-- -----------------------------------------------------------------------------
-- 1. SEED ADMINS
-- (Password hash is for test password: 'AdminPassword123!' hashed with bcrypt)
-- -----------------------------------------------------------------------------
INSERT INTO admins (username, email, password_hash, full_name, role) VALUES
('superadmin', 'admin@football-league.com', '$2a$10$wBq6.3iZ1j78p6WqX2m.vebHj4KqI0kSgqK6o0Q9Hl0C9yJ8t0K4a', 'League Commissioner', 'superadmin');

-- -----------------------------------------------------------------------------
-- 2. SEED LEAGUES & SEASONS
-- -----------------------------------------------------------------------------
INSERT INTO leagues (name, country, description) VALUES
('Premier League', 'England', 'The top tier of the English football league system.');

INSERT INTO seasons (league_id, season_name, start_date, end_date, status) VALUES
(1, '2024/2025', '2024-08-16', '2025-05-25', 'active'),
(1, '2023/2024', '2023-08-11', '2024-05-19', 'completed');

-- -----------------------------------------------------------------------------
-- 3. SEED VENUES
-- -----------------------------------------------------------------------------
INSERT INTO venues (name, city, capacity, surface_type) VALUES
('Emirates Stadium', 'London', 60704, 'Natural Grass'),
('Etihad Stadium', 'Manchester', 53400, 'Natural Grass'),
('Anfield', 'Liverpool', 61276, 'Natural Grass'),
('Stamford Bridge', 'London', 40341, 'Natural Grass');

-- -----------------------------------------------------------------------------
-- 4. SEED COACHES
-- -----------------------------------------------------------------------------
INSERT INTO coaches (first_name, last_name, nationality, date_of_birth, license_level, experience_years) VALUES
('Mikel', 'Arteta', 'Spain', '1982-03-26', 'UEFA Pro', 5),
('Pep', 'Guardiola', 'Spain', '1971-01-18', 'UEFA Pro', 16),
('Arne', 'Slot', 'Netherlands', '1978-09-17', 'UEFA Pro', 6),
('Enzo', 'Maresca', 'Italy', '1980-02-10', 'UEFA Pro', 4);

-- -----------------------------------------------------------------------------
-- 5. SEED REFEREES
-- -----------------------------------------------------------------------------
INSERT INTO referees (first_name, last_name, nationality, date_of_birth, badge_level, experience_years) VALUES
('Michael', 'Oliver', 'England', '1985-02-20', 'FIFA International', 14),
('Anthony', 'Taylor', 'England', '1978-10-20', 'FIFA International', 15);

-- -----------------------------------------------------------------------------
-- 6. SEED TEAMS
-- -----------------------------------------------------------------------------
INSERT INTO teams (name, short_code, city, founded_year, venue_id, coach_id) VALUES
('Arsenal', 'ARS', 'London', 1886, 1, 1),
('Manchester City', 'MCI', 'Manchester', 1894, 2, 2),
('Liverpool', 'LIV', 'Liverpool', 1892, 3, 3),
('Chelsea', 'CHE', 'London', 1905, 4, 4);

-- -----------------------------------------------------------------------------
-- 7. REGISTER TEAMS IN SEASONS (season_teams)
-- Note: Arsenal, Man City, Liverpool, and Chelsea all participate in 2024/2025.
-- Chelsea will have 0 matches played initially to verify the standings view!
-- -----------------------------------------------------------------------------
INSERT INTO season_teams (season_id, team_id) VALUES
(1, 1), -- Arsenal in 2024/2025
(1, 2), -- Man City in 2024/2025
(1, 3), -- Liverpool in 2024/2025
(1, 4); -- Chelsea in 2024/2025 (0 matches test)

-- -----------------------------------------------------------------------------
-- 8. SEED PLAYERS (Permanent Biological Profiles)
-- -----------------------------------------------------------------------------
INSERT INTO players (first_name, last_name, nationality, date_of_birth, height_cm, weight_kg, preferred_foot) VALUES
('Bukayo', 'Saka', 'England', '2001-09-05', 178, 72, 'Left'),       -- player 1
('Martin', 'Odegaard', 'Norway', '1998-12-17', 178, 68, 'Left'),     -- player 2
('Gabriel', 'Jesus', 'Brazil', '1997-04-03', 175, 73, 'Right'),      -- player 3 (Has transfer history!)
('Erling', 'Haaland', 'Norway', '2000-07-21', 194, 88, 'Left'),      -- player 4
('Kevin', 'De Bruyne', 'Belgium', '1991-06-28', 181, 70, 'Right'),   -- player 5
('Mohamed', 'Salah', 'Egypt', '1992-06-15', 175, 71, 'Left'),        -- player 6
('Cole', 'Palmer', 'England', '2002-05-06', 189, 74, 'Left');        -- player 7

-- -----------------------------------------------------------------------------
-- 9. SEED TEAM_PLAYERS (Demonstrates Transfer History & Active Jersey Uniqueness)
-- -----------------------------------------------------------------------------
-- Gabriel Jesus transfer history:
-- 1. Past record: Man City (team_id: 2), wore #9, now INACTIVE
-- 2. Current record: Arsenal (team_id: 1), wears #9, ACTIVE
-- 3. Erling Haaland current record: Man City (team_id: 2), ALSO wears #9, ACTIVE
-- Both clubs can have active #9, and Man City has historical #9 without conflict.
INSERT INTO team_players (team_id, player_id, jersey_number, position, start_date, end_date, is_active) VALUES
(2, 3, 9, 'Forward', '2017-01-01', '2022-06-30', FALSE), -- Jesus at Man City (Past)
(1, 3, 9, 'Forward', '2022-07-01', NULL, TRUE),          -- Jesus at Arsenal (Current)
(1, 1, 7, 'Forward', '2019-07-01', NULL, TRUE),          -- Saka at Arsenal
(1, 2, 8, 'Midfielder', '2021-01-27', NULL, TRUE),       -- Odegaard at Arsenal
(2, 4, 9, 'Forward', '2022-07-01', NULL, TRUE),          -- Haaland at Man City (Active #9)
(2, 5, 17, 'Midfielder', '2015-08-30', NULL, TRUE),      -- De Bruyne at Man City
(3, 6, 11, 'Forward', '2017-07-01', NULL, TRUE),         -- Salah at Liverpool
(4, 7, 20, 'Midfielder', '2023-09-01', NULL, TRUE);      -- Palmer at Chelsea

-- -----------------------------------------------------------------------------
-- 10. SEED MATCHES
-- -----------------------------------------------------------------------------
-- Match 1: Arsenal vs Man City (Completed)
-- Match 2: Liverpool vs Arsenal (Scheduled)
INSERT INTO matches (season_id, home_team_id, away_team_id, venue_id, referee_id, match_date, match_time, round_number, status) VALUES
(1, 1, 2, 1, 1, '2024-09-22', '16:30:00', 1, 'completed'),
(1, 3, 1, 3, 2, '2024-10-27', '17:30:00', 2, 'scheduled');

-- -----------------------------------------------------------------------------
-- 11. SEED MATCH GOALS FOR MATCH 1
-- (Triggers will automatically compute and set Arsenal: 2, Man City: 1)
-- -----------------------------------------------------------------------------
INSERT INTO match_goals (match_id, team_id, player_id, assist_player_id, minute, goal_type) VALUES
(1, 1, 1, 2, 22, 'regular'),   -- 22' Bukayo Saka (Arsenal), Assist: Martin Odegaard
(1, 2, 4, 5, 54, 'regular'),   -- 54' Erling Haaland (Man City), Assist: Kevin De Bruyne
(1, 1, 3, NULL, 86, 'penalty'); -- 86' Gabriel Jesus (Arsenal, Penalty)

-- -----------------------------------------------------------------------------
-- 12. SEED MATCH CARDS FOR MATCH 1
-- -----------------------------------------------------------------------------
INSERT INTO match_cards (match_id, team_id, player_id, minute, card_type, reason) VALUES
(1, 2, 5, 41, 'yellow', 'Tactical foul'),
(1, 1, 1, 78, 'yellow', 'Dissent');
