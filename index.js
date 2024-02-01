import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.use(express.static('public'));

// API SECTION
const yourX_Auth_Token = "07dd4b2c6f5647af80e312ca4661bde9";
const config = {
  headers: { 'X-Auth-Token': yourX_Auth_Token },
};

app.use(bodyParser.urlencoded({ extended: true }));

// Function to fetch standings
async function getStandings(leagueCode) {
  try {
    const result = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/standings`, config);
    return result.data.standings[0].table.map(team => ({
      position: team.position,
      teamName: team.team.name,
      gamesPlayed: team.playedGames,
      points: team.points,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst
    }));
  } catch (error) {
    console.error(`Error fetching standings for ${leagueCode}:`, error);
    throw error;
  }
}

// Function to fetch top scorers
async function getTopScorers(leagueCode) {
  try {
    const result = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/scorers`, config);
    return result.data.scorers.map(scorer => ({
      playerName: scorer.player.name,
      teamName: scorer.team.name,
      playedMatches: scorer.playedMatches,
      goals: scorer.goals,
      assists: scorer.assists || 0
    }));
  } catch (error) {
    console.error(`Error fetching top scorers for ${leagueCode}:`, error);
    throw error;
  }
}

// Function to fetch matches
async function getMatches(leagueCode) {
  try {
    const result = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/matches`, config);
    const matches = [];
    result.data.matches.forEach(match => {
      const matchday = match.matchday;
      const currentMatchday = match.season.currentMatchday;
      if (matchday === currentMatchday) {
        matches.push({
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeScore: match.score.fullTime.home || '0', // Set default value to an empty string
            awayScore: match.score.fullTime.away || '0', // Set default value to an empty string
        });
      }
    });
    return matches;
  } catch (error) {
    console.error(`Error fetching matches for ${leagueCode}:`, error);
    throw error;
  }
}

// Route handler for each league
async function handleLeagueRoute(req, res, leagueCode) {
  try {
    const data = await getStandings(leagueCode);
    const goals = await getTopScorers(leagueCode);
    const matches = await getMatches(leagueCode);


    res.render("index.ejs", { data, goals, matches });
  } catch (error) {
    console.error('Error:', error);
    res.render("index.ejs", { error });
  }
}

// Route definitions
app.get("/", (req, res) => {
  const data = [];
  const goals = [];
  const matches = [];
  res.render("index.ejs", { data, goals, matches });
});

app.get("/england", async (req, res) => {
  await handleLeagueRoute(req, res, "PL");
});

app.get("/spain", async (req, res) => {
  await handleLeagueRoute(req, res, "PD");
});

app.get("/germany", async (req, res) => {
  await handleLeagueRoute(req, res, "BL1");
});

app.get("/italy", async (req, res) => {
  await handleLeagueRoute(req, res, "SA");
});

app.get("/france", async (req, res) => {
  await handleLeagueRoute(req, res, "FL1");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
