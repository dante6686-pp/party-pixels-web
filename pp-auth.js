// pp-auth.js (Party Pixels)
// Routing:
// - login page:   /account.html
// - profile page: /profile.html

const PP_LOGIN_URL = "/account.html";
const PP_PROFILE_URL = "/profile.html";

// Supabase project
const SUPABASE_URL = "https://dyfrzwxhycqnqntvkuxy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnJ6d3hoeWNxbnFudHZrdXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODM5MjgsImV4cCI6MjA4MDE1OTkyOH0.n4jP0q7YZY-jQaSnHUkKWyI9wM02iHXnRXS31AATnY0";

let supabaseClient = null;

// --- Wait until Supabase SDK is ready (CDN timing safe) ---
function ppWaitForSupabase(cb) {
  if (window.supabase && typeof window.supabase.createClient === "function") {
    cb();
    return;
  }
  setTimeout(() => ppWaitForSupabase(cb), 50);
}

function ppInitSupabase() {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.ppSupabaseClient = supabaseClient;

  // init features
  ppInitLoginForm();
  ppInitLogout();
  ppWatchAuthChanges();
  ppUpdateUserButton();
}

/* -----------------------------
   Header user button (Login / nick + avatar)
----------------------------- */
async function ppUpdateUserButton() {
  const btn      = document.querySelector("[data-pp-user-button]");
  const avatarEl = document.querySelector("[data-pp-user-avatar]");
  const labelEl  = document.querySelector("[data-pp-user-label]");

  if (!btn || !avatarEl || !labelEl) {
    // header loaded async via fetch -> retry
    setTimeout(ppUpdateUserButton, 100);
    return;
  }

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session && session.user) {
      const email = session.user.email || "";
      const meta  = session.user.user_metadata || {};
      const rawName =
        meta.display_name ||
        meta.username ||
        (email ? email.split("@")[0] : "User");

      const name = (rawName || "User").trim() || "User";
      const initial = name.charAt(0).toUpperCase() || "?";

      labelEl.textContent = name;
      avatarEl.textContent = initial;
      avatarEl.style.display = "inline-flex";
      btn.href = PP_PROFILE_URL;
    } else {
      labelEl.textContent = "Login";
      avatarEl.textContent = "";
      avatarEl.style.display = "none";
      btn.href = PP_LOGIN_URL;
    }
  } catch (err) {
    console.error("ppUpdateUserButton error:", err);
  }
}

// Export for header include callbacks
window.ppUpdateUserButton = ppUpdateUserButton;

/* -----------------------------
   Login form UX
----------------------------- */
function ppInitLoginForm() {
  const form = document.querySelector("[data-pp-login-form]");
  if (!form) return; // not on login page

  const emailInput = form.querySelector('input[name="email"]');
  const passInput  = form.querySelector('input[name="password"]');
  const errorEl    = form.querySelector("[data-pp-login-error]");
  const btn        = form.querySelector("[data-pp-login-btn]") || form.querySelector('button[type="submit"]');

  if (!emailInput || !passInput || !btn) {
    console.error("Login form missing elements:", {
      hasEmail: !!emailInput,
      hasPass: !!passInput,
      hasBtn: !!btn,
      hasError: !!errorEl
    });
    return;
  }

  const originalBtnHTML = btn.innerHTML;

  function setError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg || "";
    errorEl.style.display = msg ? "block" : "none";
  }

  function setLoading(on) {
    emailInput.disabled = on;
    passInput.disabled  = on;
    btn.disabled        = on;

    if (on) {
      form.classList.add("pp-auth-disabled");
      btn.classList.add("pp-btn-loading");

      btn.innerHTML = `<span class="pp-btn-spinner"></span><span>Logging in…</span>`;
      btn.style.display = "inline-flex";
      btn.style.alignItems = "center";
      btn.style.justifyContent = "center";
      btn.style.gap = "8px";
    } else {
      form.classList.remove("pp-auth-disabled");
      btn.classList.remove("pp-btn-loading");

      btn.innerHTML = originalBtnHTML;
      btn.style.display = "";
      btn.style.alignItems = "";
      btn.style.justifyContent = "";
      btn.style.gap = "";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");

    const email = (emailInput.value || "").trim();
    const password = passInput.value || "";

    if (!email || !password) {
      setError("Fill in email and password.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Supabase login error:", error);
        setError(error.message || "Login failed.");
        setLoading(false);
        return;
      }

      await ppUpdateUserButton();
      window.location.href = PP_PROFILE_URL;
    } catch (err) {
      console.error("Unexpected login exception:", err);
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  });
}

/* -----------------------------
   Logout button (data-pp-logout)
----------------------------- */
function ppInitLogout() {
  const btn = document.querySelector("[data-pp-logout]");
  if (!btn) return; // not on profile page (or anywhere with logout)

  btn.addEventListener("click", async () => {
    btn.disabled = true;

    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        btn.disabled = false;
        return;
      }

      await ppUpdateUserButton();
      window.location.href = PP_LOGIN_URL;
    } catch (err) {
      console.error("Unexpected logout error:", err);
      btn.disabled = false;
    }
  });
}

/* -----------------------------
   Auth guards
----------------------------- */
window.ppRequireAuth = async function ppRequireAuth() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) console.warn("ppRequireAuth session error:", error);

  if (!session || !session.user) {
    window.location.href = PP_LOGIN_URL;
    return null;
  }
  return session.user;
};

window.ppRedirectIfLoggedIn = async function ppRedirectIfLoggedIn() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) console.warn("ppRedirectIfLoggedIn session error:", error);

  if (session && session.user) {
    window.location.href = PP_PROFILE_URL;
    return true;
  }
  return false;
};

/* -----------------------------
   Auto refresh header on auth changes
----------------------------- */
function ppWatchAuthChanges() {
  supabaseClient.auth.onAuthStateChange(() => {
    ppUpdateUserButton();
  });
}

/* -----------------------------
   Start
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  ppWaitForSupabase(ppInitSupabase);
});