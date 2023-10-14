export default class Chat {
  constructor() {
    this.chatWrapper = document.querySelector("#chat-wrapper");
    this.openIcon = document.querySelector(".header-chat-icon");
    this.closeIcon = document.querySelector(".chat-title-bar-close");
    this.injectHTML();
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
    this.chatWrapper.classList.add("chat--visible");
  }

  hideChat() {
    this.chatWrapper.classList.remove("chat--visible");
  }
}
