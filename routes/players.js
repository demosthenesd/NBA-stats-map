var express = require("express");
var router = express.Router();
const axios = require("axios");

// function to query player data
async function playerQuery(player, season) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/players?search=${player}`
    );
    // Check if the response contains player data
    if (response.data.data[0] === undefined) {
      return {
        Error:
          "Please ensure that the player has played on the selected season.",
      };
    }
    // If multiple player results are found, return an error message with a list of names
    else if (response.data.data.length > 1) {
      const errorObjects = response.data.data.map((item) => ({
        Name: `${item.first_name} ${item.last_name}`,
      }));
      console.log(errorObjects);
      return {
        Error: `I'm getting multiple results with the name: ${player}. Please provide a more specific name.`,
        Names: errorObjects,
      };
    }
    // If a single player result is found, fetch player stats
    else {
      const result = await getPlayerStats(response.data.data[0].id, season);
      return result;
    }
  } catch (err) {
    console.log(err);
    return { "Catch Error": "Error occured in playerQuery function" };
  }
}
//function to get player statistics
async function getPlayerStats(playerId, season) {
  let playerData, response;
  try {
    // GET request to fetch player statistics for the specified season and player ID

    response = await axios.get(
      `https://www.balldontlie.io/api/v1/season_averages?season=${season}&player_ids[]=${playerId}`
    );
    playerData = response.data.data;
    // Check if player stats are available for the specified season
    if (playerData <= 0) {
      return {
        Error:
          "Please ensure that the player has played on the selected season.",
      };
    }

    return playerData;
  } catch (err) {
    console.log(err);

    return { "Catch Error": "Error occured in getPlayerStats function" };
  }
}
// route for handling POST requests
router.post("/", async function (req, res, next) {
  try {
    const { player, season } = req.body;

    const result = await playerQuery(player, season); // Call the function to retrieve player data and stats
    res.json(result);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
