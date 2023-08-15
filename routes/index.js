var express = require("express");
var router = express.Router();
const axios = require("axios");

// axios
//   .get(
//     "https://www.balldontlie.io/api/v1/stats?seasons[]=2023&seasons[]=2022&player_ids[]=61?per_page=100"
//   )
//   .then((res) => {
//     // if (
//     //   res.data.data.player.last_name === "Bridges" ||
//     //   res.data.data.player.first_name === "Mikal"
//     // )
//     {
//       console.log(res.data.data);
//     }
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

async function fetchData() {
  const res = await axios.get(
    "https://www.balldontlie.io/api/v1/stats?seasons[]=2023&seasons[]=2022&player_ids[]=61&per_page=100"
  );

  // Extract year, month, and day from the Date object

  // Create the desired format "YYYYMMDD"

  let points, data;

  const headers = {
    "X-USER-TOKEN": "thisissecret",
  };

  await res.data.data.forEach((element) => {
    var dateObject = new Date(element.game.date);
    var year = dateObject.getUTCFullYear();
    var month = (dateObject.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    var day = dateObject.getUTCDate().toString().padStart(2, "0");
    var desiredFormat = `${year}${month}${day}`;

    points = element.pts;

    data = {
      date: desiredFormat,
      quantity: points.toString(),
    };

    try {
      const response = axios.post(
        "https://pixe.la/v1/users/dems/graphs/point-graph",
        data,
        { headers }
      );
    } catch (error) {
      console.error("Error updating graph:", error);
    }
  });

  console.log("https://pixe.la/v1/users/dems/graphs/point-graph.html");
}

fetchData();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
