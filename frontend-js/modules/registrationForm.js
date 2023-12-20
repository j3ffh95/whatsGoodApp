export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll(
      "#registration-form .form-control"
    );
    this.insertValidationElements();
    this.username = document.querySelector("#username-register");
    this.username.previousValue = "";
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
    if (el.previousValue != el.value) {
      // We use the method call to make sure the "this" keyword points towards our overall object
      handler.call(this);
    }
    el.previousValue = el.value;
  }

  usernameHandler() {
    // Setting up the skeleton that will run some code immediately and run other code after a delay
    this.usernameImmediately();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(() => this.usernameAfterDelay, 3000);
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
