var express = require("express");
var router = express.Router();
const axios = require("axios");

async function playerQuery(player, season) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/players?search=${player}`
    );
    console.log(response.data.data);
    if (response.data.data[0] === undefined) {
      return {
        Error:
          "Please ensure that the player has played on the selected season.",
      };
    } else if (response.data.data.length > 1) {
      return {
        Error: `I'm getting multiple results with the name: ${player}. Please provide a more specific name.`,
      };
    } else {
      const result = await getPlayerStats(response.data.data[0].id, season);
      return result;
    }
  } catch (err) {
    console.log(err);
    return "An error occurred.";
  }
}

async function getPlayerStats(playerId, season) {
  let playerData, response;
  try {
    response = await axios.get(
      `https://www.balldontlie.io/api/v1/season_averages?season=${season}&player_ids[]=${playerId}`
    );
    playerData = response.data.data;

    if (playerData <= 0) {
      return {
        Error:
          "Please ensure that the player has played on the selected season.",
      };
    }

    return playerData;
  } catch (err) {
    console.log(err);

    return "Error occured";
  }
}

router.post("/", async function (req, res, next) {
  try {
    const { player, season } = req.body;

    const result = await playerQuery(player, season);
    res.json(result);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
