var express = require("express");
var router = express.Router();
const axios = require("axios");

async function playerQuery(player, season) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/players?search=${player}`
    );
    if (response.data.data[0] === undefined) {
      return "This player is either injured or hasn't played yet!";
    } else if (response.data.data.length > 1) {
      return "Please specify the name more!";
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
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/season_averages?season=${season}&player_ids[]=${playerId}`
    );
    const playerData = response.data.data;
    return playerData;
  } catch (err) {
    console.log(err);
    return "An error occurred.";
  }
}

router.get("/", async function (req, res, next) {
  try {
    const player = await playerQuery("Giannis A", 2022);
    res.json(player);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { player, season } = req.body;

    const result = await playerQuery(player, season);
    console.log(result);
    res.json(result);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
