var express = require("express");
var router = express.Router();
const axios = require("axios");
require("dotenv").config();
const { checkFileExists, readJsonFile } = require("../middleware/s3"); // Require the s3Middleware.js file
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const bucketName = process.env.AWS_BUCKET_NAME;
const key = process.env.AWS_JSON_FILE_NAME;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN;
const AWS_REGION = process.env.AWS_REGION;
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  sessionToken: AWS_SESSION_TOKEN,
  region: AWS_REGION,
});

router.get("/", async (req, res) => {
  const fileExists = await checkFileExists(bucketName, key);

  if (fileExists) {
    const results = await readJsonFile(bucketName, key);
    res.json({ results });
  }

  // Send the API key as a JSON response
});

module.exports = router;
