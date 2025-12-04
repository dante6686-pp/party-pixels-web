(function() {
  // Poczekaj aż DOM będzie gotowy, żeby body na pewno istniało
  function inject() {
    const body = document.body;
    if (!body) return;

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "center";
    wrapper.style.padding = "20px 0";
    wrapper.style.marginTop = "10px";

    wrapper.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        gap:8px;
        padding:10px 16px;
        border-radius:14px;
        border:1px solid rgba(255,220,120,0.7);
        background: radial-gradient(circle at top, rgba(255,220,120,0.15), rgba(20,16,8,0.95));
        box-shadow:0 0 18px rgba(255,220,120,0.25);
      ">
        <span style="font-size:11px; color:#9a9ac0;">Enjoying the toys?</span>

        <a href="https://paypal.me/PartyPixelsPayPal" target="_blank" rel="noopener noreferrer" style="
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:7px 14px;
          border-radius:999px;
          border:1px solid rgba(255,220,120,0.8);
          background:radial-gradient(circle at top, rgba(255,220,120,0.25), rgba(20,16,8,0.95));
          font-size:12px;
          text-decoration:none;
          color:#ffecc7;
          white-space:nowrap;
        ">
          <span style="font-size:15px;">💖</span>
          <span>Support via PayPal</span>
        </a>
      </div>
    `;

    body.appendChild(wrapper);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
