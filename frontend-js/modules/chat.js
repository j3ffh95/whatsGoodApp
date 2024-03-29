import DOMPurify from "dompurify";

export default class Chat {
  constructor() {
    this.openYet = false;
    this.chatWrapper = document.querySelector("#chat-wrapper");
    this.openIcon = document.querySelector(".header-chat-icon");
    this.injectHTML();
    this.chatLog = document.querySelector("#chat");
    this.chatField = document.querySelector("#chatField");
    this.chatForm = document.querySelector("#chatForm");
    this.closeIcon = document.querySelector(".chat-title-bar-close");
    this.events();
  }

  // Events
  events() {
    this.chatForm.addEventListener("submit", e => {
      e.preventDefault();
      this.sendMessageToServer();
    });
    // An arrow function does not modified the 'this' keyword
    this.openIcon.addEventListener("click", () => this.showChat());
    this.closeIcon.addEventListener("click", () => this.hideChat());
  }

  // Methods

  sendMessageToServer() {
    this.socket.emit("chatMessageFromBrowser", {
      message: this.chatField.value,
    });
    this.chatLog.insertAdjacentHTML(
      "beforeend",
      DOMPurify.sanitize(`
      <!-- template for your own message -->
      <div class="chat-self">
        <div class="chat-message">
          <div class="chat-message-inner">
            ${this.chatField.value}
          </div>
        </div>
        <img class="chat-avatar avatar-tiny" src="${this.avatar}">
      </div>
      <!-- end template-->
      `)
    );
    // This code will make new messages appear and auto scroll to the bottom
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
    this.chatField.value = "";
    this.chatField.focus();
  }

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

    // This code makes the chat field to focus when opening
    this.chatField.focus();
  }

  openConnection() {
    // This function will open a connection between the browser and our server
    // We are also assigning it to a variable named socket
    this.socket = io();
    this.socket.on("welcome", data => {
      this.username = data.username;
      this.avatar = data.avatar;
    });
    this.socket.on("chatMessageFromServer", data => {
      this.displayMessageFromServer(data);
    });
  }

  displayMessageFromServer(data) {
    this.chatLog.insertAdjacentHTML(
      "beforeend",
      DOMPurify.sanitize(`
      <!-- template for messages from others -->
      <div class="chat-other">
        <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
        <div class="chat-message"><div class="chat-message-inner">
          <a href=""/profile/${data.username}"><strong>${data.username}:</strong></a>
          ${data.message}
        </div></div>
      </div>
      <!-- end template-->
      `)
    );
    // This code will make new messages appear and auto scroll to the bottom
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  hideChat() {
    this.chatWrapper.classList.remove("chat--visible");
  }
}
