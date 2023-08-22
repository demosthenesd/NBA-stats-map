var express = require("express");
var router = express.Router();
const axios = require("axios");

const news_api_key = "01b547fcc87a451cabb12e89063972f8";

async function fetchData(URL) {
  try {
    const response = await axios.get(URL);
    return response.data.articles;
  } catch (err) {
    console.log(err);

    return "Error occured";
  }
}

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/", async function (req, res, next) {
  try {
    const { player, season } = req.body;

    const URL = `https://newsapi.org/v2/everything?q=${player} Basketball&pageSize=4&language=en&sortBy=relevancy&apiKey=${news_api_key}`;

    const result = await fetchData(URL);
    res.json(result);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
