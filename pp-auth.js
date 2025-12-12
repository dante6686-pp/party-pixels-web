// pp-auth.js

// 1. Supabase client – UZUPEŁNIJ SWOIMI DANYMI
const SUPABASE_URL = "TU_WKLEJ_SWÓJ_SUPABASE_URL";
const SUPABASE_KEY = "TU_WKLEJ_SWÓJ_PUBLIC_ANON_KEY";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Header user button (Login / nick + avatar)
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

      const name = rawName.trim() || "User";
      const initial = name.charAt(0).toUpperCase() || "?";

      labelEl.textContent = name;
      avatarEl.textContent = initial;
      avatarEl.style.display = "inline-flex";
      btn.href = "/account.html";
    } else {
      labelEl.textContent = "Login";
      avatarEl.textContent = "";
      avatarEl.style.display = "none";
      btn.href = "/login.html";
    }
  } catch (err) {
    console.error("ppUpdateUserButton error:", err);
  }
}

// 3. Login form
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

    const email = (emailInput.value || "").trim();
    const password = passInput.value || "";

    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = "Fill in email and password.";
        errorEl.style.display = "block";
      }
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        if (errorEl) {
          errorEl.textContent = error.message || "Login failed.";
          errorEl.style.display = "block";
        }
        return;
      }

      // sukces: odśwież header i przenieś usera
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

// 4. Start
document.addEventListener("DOMContentLoaded", () => {
  ppInitLoginForm();
  ppUpdateUserButton();
});

// 5. udostępniamy funkcję do wołania po załadowaniu header.html
window.ppUpdateUserButton = ppUpdateUserButton;
