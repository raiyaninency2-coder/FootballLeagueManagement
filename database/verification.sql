-- =============================================================================
-- FOOTBALL LEAGUE MANAGEMENT SYSTEM - VERIFICATION QUERIES
-- Target Database: MySQL 8.0+
-- =============================================================================

USE football_league_db;

-- =============================================================================
-- TEST 1: VERIFY AUTOMATIC SCOREBOARD UPDATED BY TRIGGERS
-- Expected Output: Arsenal (2) vs Manchester City (1) - Status: completed
-- =============================================================================
SELECT 
    m.match_id,
    ht.name AS home_team,
    m.home_team_score,
    m.away_team_score,
    at.name AS away_team,
    m.status
FROM matches m
JOIN teams ht ON m.home_team_id = ht.team_id
JOIN teams at ON m.away_team_id = at.team_id
WHERE m.match_id = 1;

-- =============================================================================
-- TEST 2: VERIFY STANDINGS VIEW (Including Chelsea with 0 Matches Played)
-- Expected Output:
-- 1. Arsenal    (P:1, W:1, D:0, L:0, GF:2, GA:1, GD:+1, PTS:3)
-- 2. Chelsea    (P:0, W:0, D:0, L:0, GF:0, GA:0, GD:0,  PTS:0)
-- 3. Liverpool  (P:0, W:0, D:0, L:0, GF:0, GA:0, GD:0,  PTS:0)
-- 4. Man City   (P:1, W:0, D:0, L:1, GF:1, GA:2, GD:-1, PTS:0)
-- =============================================================================
SELECT 
    team_name,
    played,
    won,
    drawn,
    lost,
    goals_for,
    goals_against,
    goal_difference,
    points
FROM vw_season_standings
WHERE season_id = 1;

-- =============================================================================
-- TEST 3: VERIFY TRANSFER HISTORY FOR GABRIEL JESUS
-- Expected Output: 2 distinct rows:
--   1) Man City (Inactive, #9)
--   2) Arsenal  (Active, #9)
-- =============================================================================
SELECT 
    p.first_name,
    p.last_name,
    t.name AS club,
    tp.jersey_number,
    tp.position,
    tp.start_date,
    tp.end_date,
    tp.is_active
FROM team_players tp
JOIN players p ON tp.player_id = p.player_id
JOIN teams t ON tp.team_id = t.team_id
WHERE p.player_id = 3
ORDER BY tp.start_date ASC;

-- =============================================================================
-- TEST 4: VERIFY REJECTION OF DUPLICATE ACTIVE JERSEY NUMBER
-- Expected Result: Fails with Error 'Duplicate entry ... for key uq_team_active_jersey'
-- (Because Arsenal already has an active #7: Bukayo Saka)
-- =============================================================================
-- UNCOMMENT TO TEST NEGATIVE CONSTRAINT:
-- INSERT INTO team_players (team_id, player_id, jersey_number, position, start_date, end_date, is_active)
-- VALUES (1, 2, 7, 'Forward', '2024-01-01', NULL, TRUE);

-- =============================================================================
-- TEST 5: VERIFY DELETION PROTECTION (RESTRICT)
-- Expected Result: Fails with Error: Cannot delete or update a parent row: a foreign key constraint fails
-- =============================================================================
-- UNCOMMENT TO TEST SAFE DELETE RESTRICTION:
-- DELETE FROM teams WHERE team_id = 1; -- Attempting to delete Arsenal who has played matches
