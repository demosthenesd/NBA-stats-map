var express = require("express");
var router = express.Router();
const axios = require("axios");
const google = require("google-charts");

// Load the Google Charts API

// Function to fetch data from your API or source
async function getMapStats(player, season) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/players?search=${player}`
    );
    if (response.data.data[0] === undefined) {
      return "This player is either injured or hasn't played yet!";
    } else if (response.data.data.length > 1) {
      return "Please specify the name more!";
    } else {
      const playerId = response.data.data[0].id;
      const playerStats = await getPoints(playerId, season);
      return playerStats;
    }
  } catch (err) {
    console.log(err);
    return "An error occurred.";
  }
}

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

      const matchingTeam = AllTeams.find((team) => team.id === teamId);

      if (matchingTeam) {
        const { id, city } = matchingTeam;
        gameStats.push({ teamId: id, city, pts, ast, reb, blk, stl });
      }
    });
    console.log(gameStats.length);
    return gameStats;
  } catch (err) {
    console.log(err);
    return "Error occurred";
  }
}

// router.get("/", async function (req, res, next) {
//   try {
//     const results = await getAllStats(237, 2022);
//     // const results = await getAllTeams();

//     res.json(results);
//   } catch (error) {
//     res.status(500).send("An error occurred.");
//   }
// });

router.post("/", async function (req, res, next) {
  try {
    const { player, season } = req.body;

    const results = await getAllStats(237, season);

    res.json(results);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
