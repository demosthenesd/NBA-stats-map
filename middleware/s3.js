const AWS = require("aws-sdk");
require("dotenv").config();

function initializeS3Middleware(app) {
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN;

  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    sessionToken: AWS_SESSION_TOKEN,
    region: "ap-southeast-2",
  });

  const s3 = new AWS.S3();

  app.use(function (req, res, next) {
    let pageCounter;
    const key = "page-counter.json";
    const bucketName = "cab432-dems-nba-stats";

    const readFileParams = {
      Bucket: bucketName,
      Key: key,
    };

    s3.headObject(readFileParams, function (err, metadata) {
      if (err && err.code === "NotFound") {
        // If file does not exist, initialize the counter to 1 and upload
        pageCounter = 1;

        const uploadParams = {
          Bucket: bucketName,
          Key: key,
          Body: JSON.stringify({ pageCounter }),
        };

        s3.upload(uploadParams, function (err, data) {
          if (err) {
            console.error("Error uploading pageCounter:", err);
          } else {
            console.log("pageCounter uploaded successfully:", data.Location);
          }
        });
      } else if (!err) {
        // If the file exists, read the counter, increment it, and upload
        s3.getObject(readFileParams, function (err, data) {
          if (err) {
            console.error("Error reading JSON file from S3:", err);
          } else {
            const jsonContent = JSON.parse(data.Body.toString("utf-8"));
            pageCounter = jsonContent.pageCounter + 1;
            console.log(" count ====>:", pageCounter);

            const updatedParams = {
              Bucket: bucketName,
              Key: key,
              Body: JSON.stringify({ pageCounter }),
            };

            s3.upload(updatedParams, function (err, data) {
              if (err) {
                console.error("Error uploading pageCounter:", err);
              } else {
                console.log(
                  `Updated Page Counter of ${pageCounter} has been uploaded successfully in: `,
                  data.Location
                );
              }
            });
          }
        });

        console.log(`File ${key} exists in bucket ${bucketName}`);
      } else {
        console.error(
          `Error checking file ${key} in bucket ${bucketName}:`,
          err
        );
      }
    });

    next();
  });
}

module.exports = initializeS3Middleware;
