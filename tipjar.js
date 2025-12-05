(function () {
  function inject() {
    const body = document.body;
    if (!body) return;

    // --- CONTAINER ---
    const container = document.createElement("div");
    container.className = "pp-tipjar-container";

    // --- BOX ---
    container.innerHTML = `
      <div class="pp-tipjar-box">
        <span class="pp-tipjar-text">Enjoying the toys?</span>
        <a class="pp-tipjar-button" href="https://paypal.me/PartyPixelsPayPal" 
           target="_blank" rel="noopener noreferrer">
          <span class="emoji">💖</span>
          <span>Support via PayPal</span>
        </a>
      </div>
    `;

    // Wstawiamy *przed zamknięciem body*, zawsze jako ostatni element
    body.appendChild(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
