export default class Chat {
  constructor() {
    this.openYet = false;
    this.chatWrapper = document.querySelector("#chat-wrapper");
    this.openIcon = document.querySelector(".header-chat-icon");
    this.injectHTML();
    this.closeIcon = document.querySelector(".chat-title-bar-close");
    this.events();
  }

  // Events
  events() {
    // An arrow function does not modified the 'this' keyword
    this.openIcon.addEventListener("click", () => this.showChat());
    this.closeIcon.addEventListener("click", () => this.hideChat());
  }

  // Methods
  injectHTML() {
    this.chatWrapper.innerHTML = `
    <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
    <div id="chat" class="chat-log" ></div>

    <form id="chatForm" class="chat-form border-top">
      <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
    </form>
    `;
  }

  showChat() {
    if (!this.openYet) {
      this.openConnection();
    }
    this.openYet = true;
    this.chatWrapper.classList.add("chat--visible");
  }

  openConnection() {
    alert("opening a connection");
  }

  hideChat() {
    this.chatWrapper.classList.remove("chat--visible");
  }
}
