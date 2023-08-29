const playerSearchForm = document.getElementById("player-search-form");

playerSearchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(playerSearchForm);
  const player = formData.get("player");
  const season = formData.get("season");

  google.charts.load("current", {
    packages: ["geochart"],
    mapsApiKey: "AIzaSyA7hlFR0l3jvxhkSexHCMnZjTUtA_KBUSk",
  });

  google.charts.setOnLoadCallback(fetchAndDrawChart);

  async function fetchAndDrawChart() {
    try {
      const response = await fetch("/geochart", {
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
        chart,
        "select",
        async function () {
          var selection = chart.getSelection();
          if (selection.length > 0) {
            const mapTeam = chartData.getValue(selection[0].row, 0);
            const mapPts = chartData.getValue(selection[0].row, 1);
            const mapAsts = chartData.getValue(selection[0].row, 2);

            const query = ` ${player} on ${mapTeam} scoring ${mapPts} points, ${mapAsts} assists - ${season} Highlights`;

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

            console.log(query);
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
      playerStatsDiv.innerHTML += generatePlayerStatsHTML(data);
    } else {
      playerStatsDiv.innerHTML = "Error fetching player stats";
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

function generatePlayerStatsHTML(data) {
  let html = '<table class="table"><tbody><tr>';

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

function generateNewsResultsHTML(newsArray) {
  let html = "<h2>News Results</h2>";
  html += '<div class="news-container">';
  newsArray.forEach((news) => {
    html += `
  <div class="news-item">
    <p><strong>${news.title}</strong></p>
    <p>${news.description}</p>
    <p><a href="${news.url}" target="_blank">Read More</a></p>
  </div>
`;
  });
  html += "</div>";
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
