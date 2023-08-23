var express = require("express");
var router = express.Router();
const axios = require("axios");

async function getAllTeams() {
  try {
    const response = await axios.get(`https://www.balldontlie.io/api/v1/teams`);
    const results = response.data.data;

    return results;
  } catch (err) {
    console.log(err);
    return "Error occurred";
  }
}

async function getAllStats(playerId, season) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}&seasons[]=${season}&per_page=100`
    );

    const AllTeams = await getAllTeams();

    const results = response.data.data;
    let gameStats = [];

    results.forEach((element) => {
      const { pts, ast, reb, blk, stl } = element;
      const teamId = element.game.home_team_id;
      const date = element.game.date;
      const matchingTeam = AllTeams.find((team) => team.id === teamId);

      if (matchingTeam) {
        const { id, city } = matchingTeam;
        gameStats.push({ teamId: id, date, city, pts, ast, reb, blk, stl });
      }
    });

    return gameStats;
  } catch (err) {
    console.log(err);
    return "Error occurred";
  }
}

async function getPlayerId(player) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/players?search=${player}`
    );

    let results = response.data.data[0].id;

    console.log(results);
    return results;
  } catch (err) {
    console.log(err);
    return "Error occurred";
  }
}
router.get("/", async function (req, res, next) {
  let query = "Lebron";
  try {
    const videos = await getPlayerId(query);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { player, season } = req.body;

    const playerId = await getPlayerId(player);

    const results = await getAllStats(playerId, season);

    res.json(results);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
