(function () {
  function inject() {
    const body = document.body;
    if (!body) return;

    // wrapper całego bloku
    const container = document.createElement("div");
    container.className = "pp-tipjar-container";

    // wewnętrzny box w stylu party pixels
    const box = document.createElement("div");
    box.className = "pp-tipjar-box";

    box.innerHTML = `
      <span class="pp-tipjar-text">Enjoying the toys?</span>
      <a class="pp-tipjar-button" href="https://paypal.me/PartyPixelsPayPal" 
         target="_blank" rel="noopener noreferrer">
        <span class="emoji">💖</span>
        <span>Support via PayPal</span>
      </a>
    `;

    container.appendChild(box);
    body.appendChild(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
