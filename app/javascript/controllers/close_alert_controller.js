import { Controller } from "stimulus"

export default class extends Controller {
  static targets = ["thankAlert"]

  connect() {
    setTimeout(() => {
      this.thankAlertTarget.click()
    }, 1000)
  }
}
