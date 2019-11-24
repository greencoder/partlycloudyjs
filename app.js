document.addEventListener('DOMContentLoaded', function() {
  var app = new Vue({
    el: 'div#app',
    data: {
      fetched: false,
      conditions: {},
      forecasts: [],
      location: {},
      radar: {},
      satellite: {},
      alerts: [],
      about: {}
    },
    methods: {
      handleGeoPosition: function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        self.location.href = '/MapClick.php?lon=' + lng + '&lat=' + lat;
      },
      handleGeoError: function(error) {
        alert(error);
      },
      getLocation: function() {
        navigator.geolocation.getCurrentPosition(this.handleGeoPosition, this.handleGeoError);
      }
    },
    mounted() {
      let urlParams = new URLSearchParams(window.location.search);
      let latitude = urlParams.get('lat');
      let longitude = urlParams.get('lon');

      if (latitude && longitude) {
        let noaa = new NOAA();
        noaa.fetchAndParse(latitude, longitude).then(weather => {
          this.conditions = weather.conditions;
          this.forecasts = weather.forecasts;
          this.location = weather.location;
          this.radar = weather.radar;
          this.satellite = weather.satellite;
          this.alerts = weather.alerts;
          this.about = weather.about;
          this.fetched = true;
        });
      }
    },
    template: document.querySelector('script#template').textContent
  });
});