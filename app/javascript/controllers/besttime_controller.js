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
          // Inserting restaurant's open/closed status into DOM
          let restoStatus = document.getElementById(
            `${restaurant.dataset.besttimeRestoIdValue}_status`
          );
          restoStatus.innerText = data.venue_info.venue_open;

          // Inserting restaurant's busyness level  into DOM
          let restoBusyness = document.getElementById(
            `${restaurant.dataset.besttimeRestoIdValue}_busyness`
          );

          if (data.analysis.venue_live_busyness_available) {
            // Display live busyness
            restoBusyness.innerHTML = `<b>Activity:</b> ${this.#evaluateBusyness(
              data.analysis.venue_live_busyness
            )}`;
          } else if (data.analysis.venue_forecast_busyness_available) {
            // Display forecasted busyness
            restoBusyness.innerHTML = `<b>Activity:</b> ${this.#evaluateBusyness(
              data.analysis.venue_forecasted_busyness
            )}`;
          } else {
            restoBusyness.innerHTML = `<b>Could not find foot-traffic data... Check again soon.</b>`;
          }
        });
    });
  }

  #evaluateBusyness(data) {
    // Categorizing busyness data received
    if (data <= 50) {
      return "Not busy";
    } else if (data <= 80) {
      return "Less busy than usual";
    } else if (data <= 100) {
      return "Peak busy hours";
    } else if (data > 100) {
      return "Busier than usual";
    }
  }
}
