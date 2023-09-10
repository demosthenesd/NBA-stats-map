var express = require("express");
var router = express.Router();
const axios = require("axios");
//function used to get all teams from balldontlie API as region in maps
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
//function used to get stats from balldontlie API
async function getAllStats(playerId, season) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}
      &seasons[]=${season}&per_page=100`
    );
    const AllTeams = await getAllTeams();
    const results = response.data.data;
    let gameStats = [];

    //link each stats to the corresponding regions the game is played
    results.forEach((element) => {
      //grab all data from results
      const { pts, ast, reb, blk, stl } = element;
      const teamId = element.game.home_team_id;
      const date = element.game.date;
      const matchingTeam = AllTeams.find((team) => team.id === teamId); //find game played region
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
//function to grab the player ID
async function getPlayerId(player) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/players?search=${player}`
    );

    let results = response.data.data[0].id;

    return results;
  } catch (err) {
    console.log(err);
    return "Error occurred";
  }
}
// This is an Express.js route handler for a POST request.
router.post("/", async function (req, res, next) {
  try {
    // Extract player and season data from the request body.
    const { player, season } = req.body;

    // Get the player's ID using the getPlayerId function.
    const playerId = await getPlayerId(player);

    // Fetch all statistics for the specified player and season using getAllStats function.
    const results = await getAllStats(playerId, season);

    res.json(results);
  } catch (error) {
    // Handle any errors that occur during the execution of the route.
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
