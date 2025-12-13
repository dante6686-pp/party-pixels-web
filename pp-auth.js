// pp-auth.js

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

// 3) Login form
function ppInitLoginForm() {
  const form = document.querySelector("[data-pp-login-form]");
  if (!form) return; // nie jesteś na login page

  const emailInput = form.querySelector('input[name="email"]');
  const passInput  = form.querySelector('input[name="password"]');
  const errorEl    = document.querySelector("[data-pp-login-error]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (errorEl) {
      errorEl.style.display = "none";
      errorEl.textContent = "";
    }

    const email = (emailInput?.value || "").trim();
    const password = passInput?.value || "";

    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = "Fill in email and password.";
        errorEl.style.display = "block";
      }
      return;
    }

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Login error:", error);
        if (errorEl) {
          errorEl.textContent = error.message || "Login failed.";
          errorEl.style.display = "block";
        }
        return;
      }

      // sukces: odśwież topbar i idź na konto
      await ppUpdateUserButton();
      window.location.href = "/account.html";
    } catch (err) {
      console.error("Unexpected login error:", err);
      if (errorEl) {
        errorEl.textContent = "Something went wrong. Try again.";
        errorEl.style.display = "block";
      }
    }
  });
}

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
      window.location.href = "/login.html";
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
