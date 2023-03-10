import { Controller } from "@hotwired/stimulus"
import mapboxgl from '!mapbox-gl';

export default class extends Controller {
  static values = {
    apiKey: String,
    markers: Array
  }

  static targets = ["marker"]

  connect() {

    mapboxgl.accessToken = this.apiKeyValue

    this.map = new mapboxgl.Map({
      container: this.element,
      style: "mapbox://styles/mapbox/streets-v10"
    })
    this.#addMarkersAndResizeMap()

    window.addEventListener("load", () => {
      window.dispatchEvent(new Event('resize'));
      if (this.markersValue) {
        this.#addMarkersToMap()
        this.#fitMapToMarkers()
      }
    })

  }

  refreshMapAjax() {
    // Remove all markers from the map.
    this.#clearMarkers()
    // Add the new markers and resize the map to fit them.
    this.#addMarkersAndResizeMap()
  }

  #addMarkersAndResizeMap() {
    if (this.markersValue.length > 0) {
      this.#addMarkersToMap()
      this.#fitMapToMarkers()
    }
  }

  #addMarkersToMap() {
    this.markersValue.forEach((marker) => {
    const popup = new mapboxgl.Popup().setHTML(marker.info_window) // add this

      // Create a HTML element for your custom marker
      const customMarker = document.createElement("div")
      customMarker.className = "marker"
      customMarker.style.backgroundImage = `url('${marker.image_url}')`
      customMarker.style.backgroundSize = "contain"
      customMarker.style.width = "45px"
      customMarker.style.height = "45px"
      customMarker.dataset.mapboxTarget = "marker"

      // Pass the element as an argument to the new marker
      new mapboxgl.Marker(customMarker)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(this.map)
    })
  }

  #fitMapToMarkers() {
    const bounds = new mapboxgl.LngLatBounds()
    this.markersValue.forEach(marker => bounds.extend([ marker.lng, marker.lat ]))
    this.map.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: 0 })
  }

  #clearMarkers() {
    this.markersValue.length = 0
    this.markerTargets.forEach(marker => marker.remove())
  };
}
