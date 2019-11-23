<!doctype html>
  <head lang="en">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="apple-mobile-web-app-title" content="Partly Cloudy" />
    <link rel="apple-touch-icon" href="/static/icon.png" />
    <link rel="icon" href="favicon.png" type="image/x-icon" />
    <link rel="stylesheet" href="styles.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,700&display=swap" />
    <title>Partly Cloudy</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    <script src="noaa.js"></script>
    <script src="app.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script id="template" type="x-tmpl-mustache">
      <div id="container" v-if="fetched === false">
        <section id="loading">
          <p>Loading Weather</p>
          <img src="loading.gif" />
        </section>
      </div>
      <div id="container" v-else>

        <section id="conditions">
          <header>
            <h1>Current Conditions at</h1>
            <h2>{{ location.name }}</h2>
          </header>
          <main>
            <div class="row">
              <div class="left">
                <img v-bind:src="conditions.icon" />
              </div>
              <div class="right">
                  <span class="conditions">{{ conditions.conditions }}</span><br/>
                  <span class="temperature">{{ conditions.temperature }}</span><br/>
                  <span v-if="conditions.wind_chill" class="wchill">
                    Feels like {{ conditions.wind_chill }}
                  </span><br/>
              </div>
            </div>
            <div>
              <p>
                  <strong>Humidity:</strong>
                  {{ conditions.humidity }}<br/>
                  <strong>Wind:</strong>
                  {{ conditions.wind }}<br/>
                  <strong>Pressure:</strong>
                  {{ conditions.pressure }}<br/>
                  <strong>Dew Point:</strong>
                  {{ conditions.dewpoint }}<br/>
                  <strong>Visibility:</strong>
                  {{ conditions.visibility }}<br/>
              </p>
            </div>
          </main>
        </section>

        <section id="alerts" v-if="alerts.length > 0">
          <header>Hazardous Weather Conditions</header>
          <main>
            <ul>
              <li v-for="alert in alerts">
                <a v-bind:href="alert.href">{{ alert.name }}</a>
              </li>
            </ul>
          </main>
        </section>

        <section id="forecasts">
          <header>
            <h1>Seven-Day Forecast for</h1>
            <h2>{{ about.location }}</h2>
          </header>
          <main class="nopadding">
            <div v-for="forecast of forecasts" class="forecast">
              <h3>
                {{ forecast.period }}
                <span class="hi-lo" v-bind:class="forecast.hiLoType">
                  {{ forecast.hiLo }}
                </span>
              </h3>
              <h4>{{ forecast.descShort }}</h4>
              <div class="row">
                <div class="left">
                  <img v-bind:src="forecast.icon" />
                </div>
                <div class="right forecast-text">
                  <p>{{ forecast.descLong }}</p>
                </div>
              </div>
            </div>
          </main>
        </section>

        <section id="radar">
          <header>Radar and Satellite Images</header>
          <main class="rad-sat">
            <a v-bind:href="radar.href"><img v-bind:src="radar.icon" /></a>
            <a v-bind:href="satellite.href"><img v-bind:src="satellite.icon" /></a>
          </main>
        </section>

        <footer>
          Last Updated: {{ conditions.updated }}
        </footer>

      </div>
    </script>
  </body>
</html>