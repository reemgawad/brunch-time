import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["reviewsList", "hideList"];

  dropdown() {
    this.reviewsListTarget.classList.toggle("d-none");
    if (this.hideListTarget.innerText == "See Reviews") {
      this.hideListTarget.innerText = "Hide Reviews";
    } else if (this.hideListTarget.innerText == "Hide Reviews") {
      this.hideListTarget.innerText = "See Reviews";
    }
  }
  connect() {
    // console.log("Hi")
  }
}
