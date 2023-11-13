import Search from "./modules/search";
import Chat from "./modules/chat";
import RegistrationForm from "./modules/registrationForm";

// This if statement checks to see if the header-search-icon exist in the page
if (document.querySelector(".header-search-icon")) {
  new Search();
}

// This if statement checks to see if the chat element exist in the page
if (document.querySelector("#chat-wrapper")) {
  new Chat();
}
