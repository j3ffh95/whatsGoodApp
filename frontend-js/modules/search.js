export default class Search {
  // 1. Select DOM elements, and keep track of any useful data
  constructor() {
    this.headerSearchIcon = document.querySelector(".header-search-icon");
  }

  // 2. Events
  events() {
    this.headerSearchIcon.addEventListener("click", e => {
      e.preventDefault();
    });
  }

  // 3, Methods
}
