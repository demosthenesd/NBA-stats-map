var express = require("express");
var router = express.Router();
const axios = require("axios");
require("dotenv").config();

router.get("/", (req, res) => {
  const googleMapsApiKey = process.env.MAPS_API_KEY;
  // Send the API key as a JSON response
  res.json({ googleMapsApiKey });
});

module.exports = router;
