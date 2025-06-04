// Toggle dropdown menu visibility
document.addEventListener("DOMContentLoaded", function () {
  const menuIcon = document.querySelector(".menu-icon");
  const dropdown = document.getElementById("dropdownMenu");

  if (menuIcon && dropdown) {
    menuIcon.addEventListener("click", function () {
      dropdown.classList.toggle("hidden");
    });
  }
});