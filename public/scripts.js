const playerSearchForm = document.getElementById("player-search-form");

//event listener for the submit button
playerSearchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(playerSearchForm);
  const player = formData.get("player");
  const season = formData.get("season");

  const mapsKey = await fetch("/maps-key") //fetch the GeoChart key
    .then((response) => response.json())
    .then((data) => {
      const googleMapsApiKey = data.googleMapsApiKey;
      return googleMapsApiKey;
    })
    .catch((error) => {
      console.error("Error fetching API key:", error);
    });

  google.charts.load("current", {
    packages: ["geochart"],
    mapsApiKey: await mapsKey,
  });

  google.charts.setOnLoadCallback(fetchAndDrawChart);

  //function to draw the Geo Chart Map
  async function fetchAndDrawChart() {
    try {
      const response = await fetch("/geochart", {
        //send POST request to geo chart
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player,
          season,
        }),
      });

      const data = await response.json();
      if (!data || data.length === 0) {
        // Handle the case when data is empty
        console.warn("No data to display.");
        return; // Exit the function
      }

      //sorts the data object to have the highest points to prepare for iteration below
      data.sort(
        (data_1, data_2) => data_2.pts - data_1.pts || data_2.ast - data_1.ast
      );

      var highestStatsByCity = {}; // Dictionary to store highest stats for each city

      //iterate through the data to identify the highest points in each city
      data.forEach((item) => {
        const city = item.city;
        if (!highestStatsByCity[city]) {
          highestStatsByCity[city] = {
            pts: item.pts,
            ast: item.ast,
          };
        }
      });
      //data used for region hover
      var chartData = new google.visualization.DataTable();
      chartData.addColumn("string", "City");
      chartData.addColumn("number", "Points");
      chartData.addColumn("number", "Assists");

      for (const city in highestStatsByCity) {
        const { pts, ast } = highestStatsByCity[city];
        chartData.addRow([city, pts, ast]);
      }

      var options = {
        colorAxis: {
          colors: [
            "#EDEDED",
            "#ffe792",
            "#fccd7a",
            "#f8b267",
            "#f2975a",
            "#eb7a52",
            "#e15d50",
            "#d43d51",
          ],
        },
        region: "US",
        defaultColor: "#EDEDED",
        datalessRegionColor: "#EDEDED",
        backgroundColor: "transparent",
        resolution: "provinces",
      };

      var chart = new google.visualization.GeoChart(
        document.getElementById("chart_div")
      );

      google.visualization.events.addListener(
        //event listener when a region with stats is clicked
        chart,
        "select",
        async function () {
          var selection = chart.getSelection();
          if (selection.length > 0) {
            const mapTeam = chartData.getValue(selection[0].row, 0);
            const mapPts = chartData.getValue(selection[0].row, 1);
            const mapAsts = chartData.getValue(selection[0].row, 2);
            const query = ` ${player} on ${mapTeam} scoring ${mapPts} points, ${mapAsts} assists - ${season} Highlights`;

            //send POST request to get Youtube Video highlights
            const youtubeResponse = await fetch(`/youtube`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query,
              }),
            });

            const youtubeData = await youtubeResponse.json();
            const youtubeResultsDiv =
              document.getElementById("youtube-results");
            if (youtubeResponse.ok) {
              youtubeResultsDiv.innerHTML =
                generateYouTubeResultsHTML(youtubeData);
            } else {
              youtubeResultsDiv.innerHTML = "Error fetching YouTube results";
            }
          }
        }
      );

      chart.draw(chartData, options);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  try {
    const response = await fetch("/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player,
        season,
      }),
    });

    const data = await response.json();

    const playerStatsDiv = document.getElementById("player-stats");
    if (response.ok) {
      playerStatsDiv.innerHTML = `<h1>${player}</h1>`;
      if (data.Error) {
        // Display the error message
        playerStatsDiv.innerHTML += `<p>Error: ${data.Error}</p>`;
        data.Names.forEach((nameObj) => {
          playerStatsDiv.innerHTML += `<p>Name: ${nameObj.Name}</p>`;
        });
      } else {
        // Display player stats
        playerStatsDiv.innerHTML += generatePlayerStatsHTML(data);
      }
    } else {
      playerStatsDiv.innerHTML = "Error fetching player stats";
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

//function to fill out the stats table
function generatePlayerStatsHTML(data) {
  let html = '<table class="table"><tbody><tr>';
  //iterate through the data and add rows and column
  for (const key in data) {
    if (typeof data[key] !== "object") {
      html += `<td><strong>${key.toUpperCase()}</strong></td>`;
    }
  }
  html += "</tr><tr>";

  for (const key in data) {
    if (typeof data[key] === "object") {
      html += `<td>${generatePlayerStatsHTML(data[key])}</td>`;
    } else {
      html += `<td>${data[key]}</td>`;
    }
  }

  html += "</tr></tbody></table>";
  return html;
}

function generateYouTubeResultsHTML(data) {
  let html = "<h2>YouTube Results | Highlights</h2>";
  html += '<div class="video-container">';
  data.forEach((video) => {
    const videoUrl = `https://www.youtube.com/embed/${video.videoId}`;
    html += `
    <div class="video-iframe">
      <div class="embed-responsive embed-responsive-16by9">
        <iframe class="embed-responsive-item" src="${videoUrl}" allowfullscreen></iframe>
      </div>
      <p><strong>${video.title}</strong></p>
    </div>
  `;
  });
  html += "</div>";
  return html;
}

async function getPageCounter() {
  //function to fetch page counter
  try {
    const response = await fetch("/page-counter");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const pageCounter = data.results.pageCounter;

    return pageCounter;
  } catch (error) {
    //catch error
    console.error("Error:", error);
  }
}
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Call the function to fetch the page counter after a delay to ensure up to date page count is fetched
delay(1000).then(async () => {
  let val = 0;
  let pageCounter = await getPageCounter();

  document.getElementById(
    "counter"
  ).textContent = `Page Counter: ${pageCounter}`;
});
