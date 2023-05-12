export default class Search {
  // 1. Select DOM elements, and keep track of any useful data
  constructor() {
    this.headerSearchIcon = document.querySelector(".header-search-icon");
    this.events();
  }

  // 2. Events
  events() {
    this.headerSearchIcon.addEventListener("click", e => {
      e.preventDefault();
      this.openOverlay();
    });
  }

  // 3, Methods
  openOverlay() {
    alert("open overlay method just ran.");
  }
}
