var express = require("express");
var router = express.Router();
const axios = require("axios");
require("dotenv").config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const URL = "https://www.googleapis.com/youtube/v3/search";

async function fetchVideos(query, maxResults = 10) {
  try {
    if (!query) {
      return { error: "Missing search query parameter" };
    }
    const response = await axios.get(URL, {
      params: {
        part: "snippet",
        q: query,
        maxResults: maxResults,
        key: YOUTUBE_API_KEY,
      },
    });

    const results = response.data.items.map((item) => {
      return {
        title: item.snippet.title,
        videoId: item.id.videoId,
      };
    });

    return results; // Return the results instead of console.log
  } catch (error) {
    console.error("Error:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

router.get("/", async function (req, res) {
  let query = "Cam johnson NBA 2020 highlights";
  try {
    const videos = await fetchVideos(query, 20);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { query } = req.body;

    const videos = await fetchVideos(query, 4);
    res.json(videos);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
