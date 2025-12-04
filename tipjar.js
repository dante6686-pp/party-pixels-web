(function() {
  function injectTipjar() {
    const footer = document.querySelector("footer.footer");
    if (!footer) {
      // Footer jeszcze nie ma – spróbuj później
      setTimeout(injectTipjar, 100);
      return;
    }

    // Sprawdź, czy już nie wstawiliśmy tipjara (żeby nie duplikować)
    if (footer.querySelector(".pp-tipjar")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "pp-tipjar";
    wrapper.style.display = "flex";
    wrapper.style.flexWrap = "wrap";
    wrapper.style.gap = "8px";
    wrapper.style.alignItems = "center";

    wrapper.innerHTML = `
      <span style="font-size:11px;color:#9a9ac0;">Enjoying the toys?</span>
      <a href="https://paypal.me/PartyPixelsPayPal" target="_blank" rel="noopener"
        style="
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:7px 14px;
          border-radius:999px;
          border:1px solid rgba(255,220,120,0.8);
          background:radial-gradient(circle at top, rgba(255,220,120,0.2), rgba(20,16,8,0.95));
          font-size:12px;
          text-decoration:none;
          color:#ffecc7;
          box-shadow:0 0 14px rgba(255,220,120,0.35);
          white-space:nowrap;
        ">
        <span style="font-size:14px;">💖</span>
        <span>Support via PayPal</span>
      </a>
    `;

    footer.appendChild(wrapper);
  }

  // Poczekaj aż DOM się złoży, *a potem* zacznij polować na footer
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectTipjar);
  } else {
    injectTipjar();
  }
})();
