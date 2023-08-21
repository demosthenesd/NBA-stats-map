var express = require("express");
var router = express.Router();
const axios = require("axios");

const news_api_key = "01b547fcc87a451cabb12e89063972f8";
const query = "Mikal Bridges";

const URL = `https://newsapi.org/v2/everything?q=${query}&from=2023-07-19&sortBy=relevancy&apiKey=${news_api_key}`;

async function fetchData() {
  await axios.get(URL).then((res) => console.log(res.data.articles));
}

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
