var express = require("express");
var router = express.Router();
const axios = require("axios");
require("dotenv").config();
const { readJsonFile } = require("../middleware/s3");

// Retrieve configuration values from environment variables.
const bucketName = process.env.AWS_BUCKET_NAME;
const key = process.env.AWS_JSON_FILE_NAME;

router.get("/", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

  const results = await readJsonFile(bucketName, key); //read page counter JSON file from s3
  res.json({ results });
});

module.exports = router;
