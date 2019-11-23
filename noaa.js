class NOAA {

  fetchAndParse = function(lat, lng) {
    return new Promise((resolve, reject) => {
      this.fetch(lat, lng).then(html => {
        let data = this.parse(html);
        resolve(data);
      });
    });
  }

  fetch = async function(lat, lng) {
    let url = `https://forecast.weather.gov/MapClick.php?lat=${lat}&lon=${lng}`;
    console.log(url);
    let response = await fetch(url);
    let html = await response.text();
    return html;
  }

  qsText = function(doc, selector) {
    let element = doc.querySelector(selector);
    return element ? element.textContent.trim() : '';
  }

  qsImgSrcPath = function(doc, selector) {
    let element = doc.querySelector(selector);

    if (element) {
      let anchorElement = this.getLocation(element.src);
      let pathName = anchorElement.pathname;
      let index = anchorElement.href.indexOf(pathName);
      anchorElement.href.slice()
      return anchorElement.href.slice(index);
    }

    return '';
  }

  getLocation = function(href) {
    let element = document.createElement("a");
    element.href = href;
    return element;
  }

  parseConditions = function(doc) {
    // Strip the celcius from the dewpoint
    var dewpoint = this.qsText(doc, '#current_conditions_detail > table > tbody > tr:nth-child(4) > td:nth-child(2)');
    dewpoint = dewpoint.split(' ')[0]

    // Visibility usually ends with "mi", we want "miles"
    var visibility = this.qsText(doc, '#current_conditions_detail > table > tbody > tr:nth-child(5) > td:nth-child(2)');
    visibility = visibility.endsWith('mi') ? `${visibility}les` : visibility;

    // Strip the celcius from the wind chill
    var windChill = this.qsText(doc, '#current_conditions_detail > table > tbody > tr:nth-child(6) > td:nth-child(2)');
    windChill = windChill.split(' ')[0];

    var icon = this.qsImgSrcPath(doc, '#current_conditions-summary > img');
    var icon = `https://forecast.weather.gov${icon}`;

    return {
      "icon": icon,
      "conditions": this.qsText(doc, '#current_conditions-summary > p.myforecast-current'),
      "temperature": this.qsText(doc, '#current_conditions-summary > p.myforecast-current-lrg'),
      "humidity": this.qsText(doc, '#current_conditions_detail > table > tbody > tr:nth-child(1) > td:nth-child(2)'),
      "wind": this.qsText(doc, '#current_conditions_detail > table > tbody > tr:nth-child(2) > td:nth-child(2)'),
      "pressure": this.qsText(doc, '#current_conditions_detail > table > tbody > tr:nth-child(3) > td:nth-child(2)'),
      "dewpoint": dewpoint,
      "visibility": visibility,
      "wind_chill": windChill,
      "updated": this.qsText(doc, '#current_conditions_detail > table > tbody > tr:last-child > td:nth-child(2)')
    }
  }

  parseAlerts = function(doc) {
    let selector = 'body > main > div > div.panel.panel-danger > div.panel-body > ul > li > a'
    let elements = doc.querySelectorAll(selector);
    let alerts = [];

    elements.forEach(alert => {
      let name = alert.textContent.trim();
      if (name !== 'Hazardous Weather Outlook') {
        alerts.push({
          'href': alert.href,
          'name': name
        })
      }
    });

    return alerts;
  }

  parseLocation = function(doc) {
    let location = this.qsText(doc, '#current-conditions > div.panel-heading > div > h2');
    let name = location.split(' (')[0];
    let identifier = location.slice(location.length-5, location.length-1);

    return {
      "name": name,
      "identifier": identifier,
    }
  }

  parseRadar = function(doc) {
    let anchorElement = doc.querySelector('#radar > a:nth-child(2)');
    let path = this.qsImgSrcPath(doc, '#radar > a:nth-child(2) > img');
    let imgPath = `https://radar.weather.gov${path}`;

    return {
      "href": anchorElement.href,
      "icon": imgPath
    }
  }

  parseAbout = function(doc) {
    let locationElement = doc.querySelector('#about_forecast > div:nth-child(1) > div.right');
    let fullLocation = locationElement.innerHTML;
    let loc = fullLocation.split('<br>')[0];
    let geo = fullLocation.split('<br>')[1].slice(6);
    let title = `7-Day Forecast for ${loc} ${geo}`;

    return {
      "location": loc,
      "geo": geo,
      "title": title,
    }
  }

  parseSatellite = function(doc) {
    let anchorElement = doc.querySelector('#radar > a:nth-child(3)');
    let path = this.qsImgSrcPath(doc, '#radar > a:nth-child(3) > img');
    let imgPath = `https://forecast.weather.gov${path}`;

    return {
      "href": anchorElement.href,
      "icon": imgPath
    }
  }

  parseForecasts = function(doc) {
    let liElements = doc.querySelectorAll('#seven-day-forecast-list > li')
    let forecasts = [];

    liElements.forEach(tombstone => {
      let period = tombstone.querySelector('div > p.period-name').innerHTML.replace(/<br>/g, ' ');
      let descShort = this.qsText(tombstone, 'div > p.short-desc');
      let hiLo = this.qsText(tombstone, 'div > p.temp');
      let hiLoType = hiLo.startsWith('High') ? 'hi' : 'lo';

      let iconElement = tombstone.querySelector('img');
      let descLong = iconElement.alt.split(': ')[1].trim();

      let iconPath = this.qsImgSrcPath(tombstone, 'img');
      let icon = `https://forecast.weather.gov${iconPath}`;

      forecasts.push({
        "period": period,
        "descShort": descShort,
        "hiLo": hiLo,
        "hiLoType": hiLoType,
        "icon": icon,
        "descLong": descLong
      })
    });

    return forecasts;
  }

  parse = function(html) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");

    return {
      "conditions": this.parseConditions(doc),
      "forecasts": this.parseForecasts(doc),
      "location": this.parseLocation(doc),
      "radar": this.parseRadar(doc),
      "satellite": this.parseSatellite(doc),
      "alerts": this.parseAlerts(doc),
      "about": this.parseAbout(doc)
    }
  }

}