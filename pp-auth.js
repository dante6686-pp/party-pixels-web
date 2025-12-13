// pp-auth.js

const PP_LOGIN_URL = "/account.html";
const PP_PROFILE_URL = "/profile.html";

// 1) Supabase client
const SUPABASE_URL = "https://dyfrzwxhycqnqntvkuxy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnJ6d3hoeWNxbnFudHZrdXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODM5MjgsImV4cCI6MjA4MDE1OTkyOH0.n4jP0q7YZY-jQaSnHUkKWyI9wM02iHXnRXS31AATnY0";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.ppSupabaseClient = supabaseClient;

// 2) Header user button (Login / nick + avatar)
// IMPORTANT: używamy getUser() (bardziej niezawodne na mobile)
async function ppUpdateUserButton() {
  const btn      = document.querySelector("[data-pp-user-button]");
  const avatarEl = document.querySelector("[data-pp-user-avatar]");
  const labelEl  = document.querySelector("[data-pp-user-label]");

  if (!btn || !avatarEl || !labelEl) {
    setTimeout(ppUpdateUserButton, 100);
    return;
  }

  try {
    const { data: userRes, error } = await supabaseClient.auth.getUser();
    if (error) console.warn("ppUpdateUserButton getUser error:", error);

    const user = userRes?.user;

    if (user) {
      const email = user.email || "";
      const meta  = user.user_metadata || {};
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

// 3) Login form
function ppInitLoginForm() {
  const form = document.querySelector("[data-pp-login-form]");
  if (!form) return;

  const emailInput = form.querySelector('input[name="email"]');
  const passInput  = form.querySelector('input[name="password"]');
  const errorEl    = form.querySelector("[data-pp-login-error]") || document.querySelector("[data-pp-login-error]");
  const btn        = form.querySelector('button[type="submit"]') || form.querySelector("[data-pp-login-btn]");

  if (!emailInput || !passInput || !btn) return;

  const originalBtnHTML = btn.innerHTML;

  function setError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg || "";
    errorEl.style.display = msg ? "block" : "none";
  }

  function setLoading(isLoading) {
    emailInput.disabled = isLoading;
    passInput.disabled  = isLoading;
    btn.disabled        = isLoading;

    if (isLoading) {
      btn.innerHTML = `<span class="pp-btn-spinner"></span><span>Logging in…</span>`;
      btn.style.display = "inline-flex";
      btn.style.alignItems = "center";
      btn.style.justifyContent = "center";
      btn.style.gap = "8px";
    } else {
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
        setError(error.message || "Login failed.");
        setLoading(false);
        return;
      }

      await ppUpdateUserButton();
      window.location.href = PP_PROFILE_URL;
    } catch (err) {
      console.error("Login exception:", err);
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  });
}

// 4) Guards
window.ppRequireAuth = async function ppRequireAuth() {
  const { data: userRes } = await supabaseClient.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    window.location.href = PP_LOGIN_URL;
    return null;
  }
  return user;
};

window.ppRedirectIfLoggedIn = async function ppRedirectIfLoggedIn() {
  const { data: userRes } = await supabaseClient.auth.getUser();
  const user = userRes?.user;
  if (user) {
    window.location.href = PP_PROFILE_URL;
    return true;
  }
  return false;
};

// 5) Logout button (na każdej stronie gdzie jest data-pp-logout)
function ppInitLogout() {
  const btn = document.querySelector("[data-pp-logout]");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = "Logging out…";

    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.error("Logout error:", error);

      await ppUpdateUserButton();
      window.location.href = PP_LOGIN_URL;
    } catch (err) {
      console.error("Logout exception:", err);
      btn.disabled = false;
      btn.textContent = old || "Log out";
    }
  });
}

// 6) Auth state watcher
function ppWatchAuthChanges() {
  supabaseClient.auth.onAuthStateChange(() => {
    ppUpdateUserButton();
  });
}

// 7) Start (działa nawet jak DOMContentLoaded już było)
function ppBoot() {
  ppInitLoginForm();
  ppInitLogout();
  ppWatchAuthChanges();
  ppUpdateUserButton();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ppBoot);
} else {
  ppBoot();
}

window.ppUpdateUserButton = ppUpdateUserButton;
