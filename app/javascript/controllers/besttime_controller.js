import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="besttime"
export default class extends Controller {
  static values = {
    apiKey: String,
  };

  static targets = ["restaurants"];

  connect() {
    // Passing each restaurant's name & address to params to use in API call
    this.restaurantsTargets.forEach((restaurant) => {
      const params = new URLSearchParams({
        'api_key_private': this.apiKeyValue,
        'venue_name': restaurant.dataset.besttimeRestoNameValue,
        'venue_address': restaurant.dataset.besttimeRestoAddressValue,
      });

      fetch(`https://besttime.app/api/v1/forecasts/live?${params}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          // Need to display the corresponding response received in HTML of the correct restaurant
          console.log(data);
          let restoId = document.getElementById(
            `${restaurant.dataset.besttimeRestoIdValue}_status`
          );
          restoId.innerText = data.venue_info.venue_open;

          if (data.analysis.venue_live_busyness_available) {
            // display venue_live_busyness
            // categories:
            //    not busy // 0-49%
            //    less busy than usual around // 50-79%
            //    peak busy hours around // 80-100%
            //    buiser than usual // over 100%
          } else if (venue_forecast_busyness_available) {
            // display venue_forecasted_busyness
          } else {
            // display ... ???? Could not get forecast .. check again soon ?
          }
        });
    });
  }
}
