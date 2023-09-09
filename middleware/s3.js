const AWS = require("aws-sdk");
require("dotenv").config();
const s3 = new AWS.S3();

// Function to check if the file exists
async function checkFileExists(bucketName, key) {
  try {
    const metadata = await s3.headObject({ Bucket: bucketName, Key: key });
    return true; // File exists
  } catch (err) {
    if (err.code === "NotFound") {
      return false; // File doesn't exist
    } else {
      throw err; // Error occurred
    }
  }
}

// Function to read the JSON file from S3
async function readJsonFile(bucketName, key) {
  try {
    const data = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
    return JSON.parse(data.Body.toString("utf-8"));
  } catch (err) {
    throw err;
  }
}

async function uploadJsonData(data, bucketName, key) {
  try {
    const updatedParams = {
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(data),
    };

    const result = await s3.upload(updatedParams).promise();
    return result;
  } catch (err) {
    throw err;
  }
}

function initializeS3Middleware(app) {
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN;
  const AWS_REGION = process.env.AWS_REGION;
  const bucketName = "cab432-dems-nba-stats";
  const key = "page-counter.json";
  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    sessionToken: AWS_SESSION_TOKEN,
    region: AWS_REGION,
  });

  app.use(async function (req, res, next) {
    try {
      let pageCounter;

      const fileExists = await checkFileExists(bucketName, key);

      if (!fileExists) {
        // If the file does not exist, initialize the counter to 1
        pageCounter = 1;

        // Upload the new counter
        await uploadJsonData({ pageCounter }, bucketName, key);

        console.log("Page counter initialized:", pageCounter);
      } else {
        // If the file exists, read the counter, increment it, and upload
        const jsonContent = await readJsonFile(bucketName, key);
        pageCounter = jsonContent.pageCounter + 1;

        // Upload the updated counter
        await uploadJsonData({ pageCounter }, bucketName, key);

        console.log("Updated Page Counter:", pageCounter);
      }

      next();
    } catch (err) {
      console.error("Error:", err);
      next(err);
    }
  });
}

module.exports = {
  initializeS3Middleware,
  checkFileExists,
  readJsonFile,
};
