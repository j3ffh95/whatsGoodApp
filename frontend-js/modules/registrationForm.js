export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll(
      "#registration-form .form-control"
    );
    this.insertValidationElements();
    this.username = document.querySelector("#username-register");
    this.username.previousvalue = "";
    this.events();
  }

  // Events
  events() {
    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler);
    });
  }

  // Methods

  isDifferent(el, handler) {
    if (el.previousvalue != el.value) {
      handler.call(this);
    }
    el.previousvalue = el.value;
  }

  usernameHandler() {
    alert("ffjfj");
  }

  insertValidationElements() {
    this.allFields.forEach(function (el) {
      el.insertAdjacentHTML(
        "afterend",
        '<div class="alert alert-danger small liveValidateMessage" ></div>'
      );
    });
  }
}
