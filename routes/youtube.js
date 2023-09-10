var express = require("express");
var router = express.Router();
const axios = require("axios");
require("dotenv").config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const URL = "https://www.googleapis.com/youtube/v3/search";

//function to fetch videos based on a query

async function fetchVideos(query, maxResults = 10) {
  try {
    //Check if the query  is missing

    if (!query) {
      return { error: "Missing search query parameter" };
    }
    // GET request to the YouTube API for video search
    const response = await axios.get(URL, {
      params: {
        part: "snippet",
        q: query,
        maxResults: maxResults,
        key: YOUTUBE_API_KEY,
      },
    });
    // Extract relevant information from the API response and format
    const results = response.data.items.map((item) => {
      return {
        title: item.snippet.title,
        videoId: item.id.videoId,
      };
    });

    return results;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

router.post("/", async function (req, res, next) {
  try {
    const { query } = req.body;
    // Call function to retrieve videos based on the query
    const videos = await fetchVideos(query, 6);
    res.json(videos);
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
