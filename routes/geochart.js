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

async function getPoints(playerId, season) {
  try {
    const response = await axios.get(
      `https://www.balldontlie.io/api/v1/stats?player_ids[]=${playerId}&seasons[]=${season}`
    );
    const playerData = response.data.data;

    if (playerData.length <= 0) {
      return {
        Error:
          "Please ensure that the player has played on the selected season.",
      };
    }

    return playerData;
  } catch (err) {
    console.log(err);
    return "Error occurred";
  }
}

// Callback function to draw the heatmap
function drawHeatmap(playerStats) {
  const data = new google.visualization.DataTable();
  data.addColumn("string", "Country");
  data.addColumn("number", "Points"); // Use "Points" column for values

  // Extract points and team city from playerStats and add to data
  playerStats.forEach((stat) => {
    const points = stat.pts;
    const teamCity = stat.team.city;
    data.addRow([teamCity, points]);
  });

  const options = {
    region: "world", // Change this to your desired region
    displayMode: "regions",
    colorAxis: { colors: ["green", "yellow", "red"] }, // Define your color scale
    resolution: "countries", // 'provinces', 'metros', etc.
  };

  const chart = new google.visualization.GeoChart(
    document.getElementById("heatmap")
  );
  chart.draw(data, options);
}

router.get("/", async function (req, res, next) {
  try {
    // const { player } = req.body;

    const player = "Lebron";
    const season = 2022;
    const playerStats = await getMapStats(player, season);

    // Using the map function
    const pointsAndTeamsCity = playerStats.map((stat) => ({
      points: stat.pts,
      teamCity: stat.team.city,
    }));

    res.json(pointsAndTeamsCity);
  } catch (error) {
    res.status(500).send("An error occurred HEre.");
  }
  // res.render("index", { title: "Express" });
});

router.post("/", async function (req, res, next) {
  try {
    const { player } = req.body;

    const playerStats = await getMapStats(player);
    if (Array.isArray(playerStats)) {
      drawHeatmap(playerStats); // Draw heatmap if playerStats is an array
      res.json(playerStats);
    } else {
      res.json({ error: playerStats });
    }
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
