// pp-auth.js

const PP_LOGIN_URL = "/account.html";
const PP_PROFILE_URL = "/profile.html";

// 1) Supabase client
const SUPABASE_URL = "https://dyfrzwxhycqnqntvkuxy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnJ6d3hoeWNxbnFudHZrdXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODM5MjgsImV4cCI6MjA4MDE1OTkyOH0.n4jP0q7YZY-jQaSnHUkKWyI9wM02iHXnRXS31AATnY0";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Udostępniamy klienta dla innych stron (account.html itp.)
window.ppSupabaseClient = supabaseClient;

// 2) Header user button (Login / nick + avatar)
async function ppUpdateUserButton() {
  const btn      = document.querySelector("[data-pp-user-button]");
  const avatarEl = document.querySelector("[data-pp-user-avatar]");
  const labelEl  = document.querySelector("[data-pp-user-label]");

  if (!btn || !avatarEl || !labelEl) {
    // header jeszcze nie dociągnięty (fetch header.html)
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
      btn.href = "/profile.html";
    } else {
      labelEl.textContent = "Login";
      avatarEl.textContent = "";
      avatarEl.style.display = "none";
      btn.href = "/account.html";
    }
  } catch (err) {
    console.error("ppUpdateUserButton error:", err);
  }
}

//init login form
function ppInitLoginForm() {
  const form = document.querySelector("[data-pp-login-form]");
  if (!form) return;

  const emailInput = form.querySelector('input[name="email"]');
  const passInput  = form.querySelector('input[name="password"]');
  const errorEl    = form.querySelector("[data-pp-login-error]") || document.querySelector("[data-pp-login-error]");
  const btn        = form.querySelector('button[type="submit"]');

  if (!emailInput || !passInput || !btn) {
    console.error("Login form missing elements:", {
      hasEmail: !!emailInput,
      hasPass: !!passInput,
      hasBtn: !!btn,
      hasForm: !!form
    });
    return;
  }

  const originalBtnHTML = btn.innerHTML;

  function setError(msg) {
    if (!errorEl) {
      if (msg) console.warn("Login error (no error element):", msg);
      return;
    }
    errorEl.textContent = msg || "";
    errorEl.style.display = msg ? "block" : "none";
  }

  function setLoading(isLoading) {
    // disable/enable inputs + button
    emailInput.disabled = isLoading;
    passInput.disabled  = isLoading;
    btn.disabled        = isLoading;

    if (isLoading) {
      form.classList.add("pp-auth-disabled");
      btn.classList.add("pp-btn-loading");

      btn.innerHTML = `<span class="pp-btn-spinner"></span><span>Logging in…</span>`;
      // żeby spinner i tekst były w linii nawet bez dodatkowego CSS:
      btn.style.display = "inline-flex";
      btn.style.alignItems = "center";
      btn.style.justifyContent = "center";
      btn.style.gap = "8px";
    } else {
      form.classList.remove("pp-auth-disabled");
      btn.classList.remove("pp-btn-loading");

      btn.innerHTML = originalBtnHTML;
      // przywracamy default
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

    console.log("Login submit:", { emailLength: email.length, hasPassword: !!password });

    if (!email || !password) {
      setError("Fill in email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Supabase login error:", error);
        setError(error.message || "Login failed.");
        setLoading(false);
        return;
      }

      console.log("Login OK:", data);
      await ppUpdateUserButton();
      window.location.href = "/profile.html";
    } catch (err) {
      console.error("Unexpected login exception:", err);
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  });
}

      // sukces: odśwież topbar i idź na konto
      await ppUpdateUserButton();
      window.location.href = "/profile.html";
    } catch (err) {
      console.error("Unexpected login error:", err);
      if (errorEl) {
        errorEl.textContent = "Something went wrong. Try again.";
        errorEl.style.display = "block";
      }
    }
  });
}

// --- Auth guards (routing: login=/account.html, profile=/profile.html) ---

window.ppRequireAuth = async function ppRequireAuth() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) console.warn("ppRequireAuth session error:", error);

  if (!session || !session.user) {
    window.location.href = "/account.html"; // login page
    return null;
  }
  return session.user;
};

window.ppRedirectIfLoggedIn = async function ppRedirectIfLoggedIn() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) console.warn("ppRedirectIfLoggedIn session error:", error);

  if (session && session.user) {
    window.location.href = "/profile.html"; // profile page
    return true;
  }
  return false;
};

// 4) Logout button (na account.html)
function ppInitLogout() {
  const btn = document.querySelector("[data-pp-logout]");
  if (!btn) return; // nie jesteś na stronie z logoutem

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
      window.location.href = "/account.html";
    } catch (err) {
      console.error("Unexpected logout error:", err);
      btn.disabled = false;
    }
  });
}

// 5) Auto refresh topbar on auth change (login/logout/refresh)
function ppWatchAuthChanges() {
  supabaseClient.auth.onAuthStateChange((_event, _session) => {
    // header może być jeszcze nie załadowany, ale ppUpdateUserButton ma polling
    ppUpdateUserButton();
  });
}

// 6) Start
document.addEventListener("DOMContentLoaded", () => {
  ppInitLoginForm();
  ppInitLogout();
  ppWatchAuthChanges();
  ppUpdateUserButton();
});

// 7) udostępniamy funkcję dla header include callback
window.ppUpdateUserButton = ppUpdateUserButton;
