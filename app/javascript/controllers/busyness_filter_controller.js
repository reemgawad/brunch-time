import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="busyness-filter"
export default class extends Controller {
  static targets = ["restaurants"];

  connect() {
    console.log("hiii");
  }

  filter() {}
}