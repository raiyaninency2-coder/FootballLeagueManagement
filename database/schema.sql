-- =============================================================================
-- FOOTBALL LEAGUE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Target Database: MySQL 8.0+
-- =============================================================================

DROP DATABASE IF EXISTS football_league_db;
CREATE DATABASE football_league_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE football_league_db;

-- -----------------------------------------------------------------------------
-- 1. ADMINS TABLE (Authentication & Role Management)
-- -----------------------------------------------------------------------------
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. LEAGUES TABLE (Permanent Competition Identity)
-- -----------------------------------------------------------------------------
CREATE TABLE leagues (
    league_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(50) NOT NULL,
    logo_url VARCHAR(255) NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. SEASONS TABLE (Specific Editions of a League)
-- -----------------------------------------------------------------------------
CREATE TABLE seasons (
    season_id INT AUTO_INCREMENT PRIMARY KEY,
    league_id INT NOT NULL,
    season_name VARCHAR(50) NOT NULL, -- e.g. "2024/2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seasons_league FOREIGN KEY (league_id) 
        REFERENCES leagues (league_id) ON DELETE RESTRICT,
    CONSTRAINT uq_league_season UNIQUE (league_id, season_name),
    CONSTRAINT chk_season_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. VENUES TABLE (Stadiums & Grounds)
-- -----------------------------------------------------------------------------
CREATE TABLE venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    capacity INT UNSIGNED NOT NULL,
    surface_type VARCHAR(50) DEFAULT 'Natural Grass',
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. COACHES TABLE (Managers & Head Coaches)
-- -----------------------------------------------------------------------------
CREATE TABLE coaches (
    coach_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    date_of_birth DATE NULL,
    license_level VARCHAR(50) DEFAULT 'UEFA Pro',
    experience_years INT UNSIGNED DEFAULT 0,
    photo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. REFEREES TABLE (Match Officials)
-- -----------------------------------------------------------------------------
CREATE TABLE referees (
    referee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    date_of_birth DATE NULL,
    badge_level VARCHAR(50) DEFAULT 'National', -- e.g. 'FIFA International'
    experience_years INT UNSIGNED DEFAULT 0,
    photo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 7. TEAMS TABLE (Clubs)
-- -----------------------------------------------------------------------------
CREATE TABLE teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    short_code VARCHAR(5) NOT NULL UNIQUE, -- e.g. "ARS", "MCI"
    city VARCHAR(50) NOT NULL,
    founded_year INT UNSIGNED NULL,
    venue_id INT NULL,
    coach_id INT NULL,
    logo_url VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teams_venue FOREIGN KEY (venue_id) 
        REFERENCES venues (venue_id) ON DELETE SET NULL,
    CONSTRAINT fk_teams_coach FOREIGN KEY (coach_id) 
        REFERENCES coaches (coach_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 8. SEASON_TEAMS (Bridge Table: Registered Teams in a Given Season)
-- -----------------------------------------------------------------------------
CREATE TABLE season_teams (
    season_team_id INT AUTO_INCREMENT PRIMARY KEY,
    season_id INT NOT NULL,
    team_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_st_season FOREIGN KEY (season_id) 
        REFERENCES seasons (season_id) ON DELETE CASCADE,
    CONSTRAINT fk_st_team FOREIGN KEY (team_id) 
        REFERENCES teams (team_id) ON DELETE RESTRICT,
    CONSTRAINT uq_season_team UNIQUE (season_id, team_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 9. PLAYERS TABLE (Athlete Permanent Bio Information)
-- -----------------------------------------------------------------------------
CREATE TABLE players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    height_cm INT UNSIGNED NULL,
    weight_kg INT UNSIGNED NULL,
    preferred_foot ENUM('Left', 'Right', 'Both') DEFAULT 'Right',
    photo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 10. TEAM_PLAYERS TABLE (Roster, Transfer History & Contracts)
-- -----------------------------------------------------------------------------
CREATE TABLE team_players (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    jersey_number INT UNSIGNED NOT NULL,
    position ENUM('Goalkeeper', 'Defender', 'Midfielder', 'Forward') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL, -- NULL means currently active with the club
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Virtual generated column allows multiple historical records with jersey #7,
    -- but prevents duplicate active players with jersey #7 on the same team!
    active_jersey_number INT GENERATED ALWAYS AS (
        CASE WHEN is_active = TRUE THEN jersey_number ELSE NULL END
    ) VIRTUAL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tp_team FOREIGN KEY (team_id) 
        REFERENCES teams (team_id) ON DELETE RESTRICT,
    CONSTRAINT fk_tp_player FOREIGN KEY (player_id) 
        REFERENCES players (player_id) ON DELETE RESTRICT,
    CONSTRAINT uq_team_active_jersey UNIQUE (team_id, active_jersey_number),
    CONSTRAINT chk_contract_dates CHECK (end_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 11. MATCHES TABLE (Fixtures & Authoritative Scoreboard)
-- -----------------------------------------------------------------------------
CREATE TABLE matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    season_id INT NOT NULL,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    venue_id INT NULL,
    referee_id INT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    round_number INT UNSIGNED DEFAULT 1,
    home_team_score INT UNSIGNED DEFAULT 0,
    away_team_score INT UNSIGNED DEFAULT 0,
    status ENUM('scheduled', 'live', 'completed', 'postponed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_matches_season FOREIGN KEY (season_id) 
        REFERENCES seasons (season_id) ON DELETE RESTRICT,
    CONSTRAINT fk_matches_hometeam FOREIGN KEY (home_team_id) 
        REFERENCES teams (team_id) ON DELETE RESTRICT,
    CONSTRAINT fk_matches_awayteam FOREIGN KEY (away_team_id) 
        REFERENCES teams (team_id) ON DELETE RESTRICT,
    CONSTRAINT fk_matches_venue FOREIGN KEY (venue_id) 
        REFERENCES venues (venue_id) ON DELETE SET NULL,
    CONSTRAINT fk_matches_referee FOREIGN KEY (referee_id) 
        REFERENCES referees (referee_id) ON DELETE SET NULL,
    CONSTRAINT chk_different_teams CHECK (home_team_id <> away_team_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 12. MATCH_GOALS TABLE (Goal Events)
-- -----------------------------------------------------------------------------
CREATE TABLE match_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    team_id INT NOT NULL, -- The team credited with the goal on the scoreboard
    player_id INT NOT NULL, -- The player who scored
    assist_player_id INT NULL, -- Optional assist provider
    minute INT UNSIGNED NOT NULL,
    goal_type ENUM('regular', 'penalty', 'own_goal', 'free_kick') DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mg_match FOREIGN KEY (match_id) 
        REFERENCES matches (match_id) ON DELETE CASCADE,
    CONSTRAINT fk_mg_team FOREIGN KEY (team_id) 
        REFERENCES teams (team_id) ON DELETE RESTRICT,
    CONSTRAINT fk_mg_player FOREIGN KEY (player_id) 
        REFERENCES players (player_id) ON DELETE RESTRICT,
    CONSTRAINT fk_mg_assist FOREIGN KEY (assist_player_id) 
        REFERENCES players (player_id) ON DELETE SET NULL,
    CONSTRAINT chk_goal_minute CHECK (minute BETWEEN 1 AND 130)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 13. MATCH_CARDS TABLE (Disciplinary Events)
-- -----------------------------------------------------------------------------
CREATE TABLE match_cards (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    minute INT UNSIGNED NOT NULL,
    card_type ENUM('yellow', 'red', 'second_yellow') NOT NULL,
    reason VARCHAR(150) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mc_match FOREIGN KEY (match_id) 
        REFERENCES matches (match_id) ON DELETE CASCADE,
    CONSTRAINT fk_mc_team FOREIGN KEY (team_id) 
        REFERENCES teams (team_id) ON DELETE RESTRICT,
    CONSTRAINT fk_mc_player FOREIGN KEY (player_id) 
        REFERENCES players (player_id) ON DELETE RESTRICT,
    CONSTRAINT chk_card_minute CHECK (minute BETWEEN 1 AND 130)
) ENGINE=InnoDB;

-- =============================================================================
-- AUTOMATED BUSINESS TRIGGERS
-- =============================================================================

DELIMITER //

-- Trigger: Ensure both teams in a match are registered in that match's season
CREATE TRIGGER trg_validate_match_teams
BEFORE INSERT ON matches
FOR EACH ROW
BEGIN
    DECLARE home_registered INT DEFAULT 0;
    DECLARE away_registered INT DEFAULT 0;

    SELECT COUNT(*) INTO home_registered 
    FROM season_teams 
    WHERE season_id = NEW.season_id AND team_id = NEW.home_team_id;

    SELECT COUNT(*) INTO away_registered 
    FROM season_teams 
    WHERE season_id = NEW.season_id AND team_id = NEW.away_team_id;

    IF home_registered = 0 OR away_registered = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Both home and away teams must be registered in the specified season.';
    END IF;
END //

-- Trigger: Validate that goals are attributed to one of the participating teams
CREATE TRIGGER trg_validate_goal_event
BEFORE INSERT ON match_goals
FOR EACH ROW
BEGIN
    DECLARE v_home_team_id INT;
    DECLARE v_away_team_id INT;

    SELECT home_team_id, away_team_id INTO v_home_team_id, v_away_team_id
    FROM matches
    WHERE match_id = NEW.match_id;

    IF NEW.team_id <> v_home_team_id AND NEW.team_id <> v_away_team_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Goal credited team must be either the home or away team of this match.';
    END IF;
END //

-- Trigger: Automatically update match score when a goal is inserted
CREATE TRIGGER trg_after_goal_insert
AFTER INSERT ON match_goals
FOR EACH ROW
BEGIN
    UPDATE matches m
    SET 
        m.home_team_score = (
            SELECT COUNT(*) FROM match_goals g 
            WHERE g.match_id = NEW.match_id AND g.team_id = m.home_team_id
        ),
        m.away_team_score = (
            SELECT COUNT(*) FROM match_goals g 
            WHERE g.match_id = NEW.match_id AND g.team_id = m.away_team_id
        )
    WHERE m.match_id = NEW.match_id;
END //

-- Trigger: Automatically recalculate match score when a goal is updated
CREATE TRIGGER trg_after_goal_update
AFTER UPDATE ON match_goals
FOR EACH ROW
BEGIN
    UPDATE matches m
    SET 
        m.home_team_score = (
            SELECT COUNT(*) FROM match_goals g 
            WHERE g.match_id = NEW.match_id AND g.team_id = m.home_team_id
        ),
        m.away_team_score = (
            SELECT COUNT(*) FROM match_goals g 
            WHERE g.match_id = NEW.match_id AND g.team_id = m.away_team_id
        )
    WHERE m.match_id = NEW.match_id;
END //

-- Trigger: Automatically recalculate match score when a goal is deleted
CREATE TRIGGER trg_after_goal_delete
AFTER DELETE ON match_goals
FOR EACH ROW
BEGIN
    UPDATE matches m
    SET 
        m.home_team_score = (
            SELECT COUNT(*) FROM match_goals g 
            WHERE g.match_id = OLD.match_id AND g.team_id = m.home_team_id
        ),
        m.away_team_score = (
            SELECT COUNT(*) FROM match_goals g 
            WHERE g.match_id = OLD.match_id AND g.team_id = m.away_team_id
        )
    WHERE m.match_id = OLD.match_id;
END //

DELIMITER ;

-- =============================================================================
-- LEAGUE STANDINGS VIEW (Includes 0-match teams & calculates automatically)
-- =============================================================================
CREATE OR REPLACE VIEW vw_season_standings AS
SELECT 
    st.season_id,
    s.season_name,
    l.league_id,
    l.name AS league_name,
    t.team_id,
    t.name AS team_name,
    t.short_code,
    t.logo_url,
    COUNT(m_res.match_id) AS played,
    COALESCE(SUM(m_res.is_win), 0) AS won,
    COALESCE(SUM(m_res.is_draw), 0) AS drawn,
    COALESCE(SUM(m_res.is_loss), 0) AS lost,
    COALESCE(SUM(m_res.goals_for), 0) AS goals_for,
    COALESCE(SUM(m_res.goals_against), 0) AS goals_against,
    COALESCE(SUM(m_res.goals_for) - SUM(m_res.goals_against), 0) AS goal_difference,
    COALESCE(SUM(m_res.points), 0) AS points
FROM season_teams st
JOIN teams t ON st.team_id = t.team_id
JOIN seasons s ON st.season_id = s.season_id
JOIN leagues l ON s.league_id = l.league_id
LEFT JOIN (
    -- Home team perspective
    SELECT 
        season_id,
        match_id,
        home_team_id AS team_id,
        home_team_score AS goals_for,
        away_team_score AS goals_against,
        CASE WHEN home_team_score > away_team_score THEN 1 ELSE 0 END AS is_win,
        CASE WHEN home_team_score = away_team_score THEN 1 ELSE 0 END AS is_draw,
        CASE WHEN home_team_score < away_team_score THEN 0 ELSE 0 END AS is_loss,
        CASE 
            WHEN home_team_score > away_team_score THEN 3 
            WHEN home_team_score = away_team_score THEN 1 
            ELSE 0 
        END AS points
    FROM matches
    WHERE status = 'completed'

    UNION ALL

    -- Away team perspective
    SELECT 
        season_id,
        match_id,
        away_team_id AS team_id,
        away_team_score AS goals_for,
        home_team_score AS goals_against,
        CASE WHEN away_team_score > home_team_score THEN 1 ELSE 0 END AS is_win,
        CASE WHEN away_team_score = home_team_score THEN 1 ELSE 0 END AS is_draw,
        CASE WHEN away_team_score < home_team_score THEN 0 ELSE 0 END AS is_loss,
        CASE 
            WHEN away_team_score > home_team_score THEN 3 
            WHEN away_team_score = home_team_score THEN 1 
            ELSE 0 
        END AS points
    FROM matches
    WHERE status = 'completed'
) AS m_res ON st.season_id = m_res.season_id AND st.team_id = m_res.team_id
GROUP BY 
    st.season_id, s.season_name, l.league_id, l.name, 
    t.team_id, t.name, t.short_code, t.logo_url
ORDER BY 
    st.season_id ASC, 
    points DESC, 
    goal_difference DESC, 
    goals_for DESC, 
    team_name ASC;
