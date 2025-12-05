// Party Pixels – wspólny auth helper dla wszystkich stron

const SUPABASE_URL = "https://dyfrzwxhycqnqntvkuxy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnJ6d3hoeWNxbnFudHZrdXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODM5MjgsImV4cCI6MjA4MDE1OTkyOH0.n4jP0q7YZY-jQaSnHUkKWyI9wM02iHXnRXS31AATnY0";

// Tworzymy klienta Supabase
const ppSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Upewniamy się, że mamy go na window
window.ppSupabase = ppSupabase;

// ─────────────────────────────────────────────
// HELPER: pobranie profilu użytkownika
// ─────────────────────────────────────────────
async function ppGetProfile(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await ppSupabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Profile fetch unexpected error:", err);
    return null;
  }
}

// ─────────────────────────────────────────────
// Linki "Account" – dodanie redirect param
// ─────────────────────────────────────────────
function ppSetupAccountLinks() {
  const links = document.querySelectorAll("[data-pp-account-link]");
  if (!links.length) return;

  const redirectPath = encodeURIComponent(
    window.location.pathname + window.location.search
  );

  links.forEach((link) => {
    link.href = `/account.html?redirect=${redirectPath}`;
  });
}

// ─────────────────────────────────────────────
// User badge + avatar w topbarze
// ─────────────────────────────────────────────
async function ppUpdateUserBadges() {
  const badges = document.querySelectorAll("[data-pp-user-badge]");
  const avatarEls = document.querySelectorAll("[data-pp-user-avatar]");

  if (!badges.length && !avatarEls.length) return;

  let user = null;

  try {
    const { data } = await ppSupabase.auth.getUser();
    user = data?.user || null;
  } catch (err) {
    console.error("auth.getUser error:", err);
  }

  if (!user) {
    // niezalogowany
    badges.forEach((el) => {
      el.textContent = "Not logged in";
    });
    avatarEls.forEach((img) => {
      img.style.display = "none";
      img.removeAttribute("src");
      img.removeAttribute("alt");
    });
    return;
  }

  const profile = await ppGetProfile(user.id);

  const nameToShow =
    (profile && profile.display_name) ||
    (user.email ? user.email.split("@")[0] : null) ||
    "User";

  const avatarUrl = profile && profile.avatar_url ? profile.avatar_url : "";

  badges.forEach((el) => {
    el.textContent = nameToShow;
  });

  avatarEls.forEach((img) => {
    if (avatarUrl) {
      img.style.display = "inline-block";
      img.src = avatarUrl;
      img.alt = nameToShow;
    } else {
      img.style.display = "none";
      img.removeAttribute("src");
      img.removeAttribute("alt");
    }
  });
}

// ─────────────────────────────────────────────
// Logowanie / rejestracja / logout – account.html
// ─────────────────────────────────────────────
function ppSetupAccountPage() {
  const path = window.location.pathname;
  const isAccount =
    path.endsWith("/account.html") || path.endsWith("account.html");
  if (!isAccount) return;

  // redirect target z query (?redirect=/tap-to-survive.html itd.)
  const params = new URLSearchParams(window.location.search);
  const redirectRaw = params.get("redirect");
  let redirectTarget = "/index.html";
  if (redirectRaw && redirectRaw.startsWith("/")) {
    redirectTarget = redirectRaw;
  }

  const tabLogin = document.getElementById("tabLogin");
  const tabSignup = document.getElementById("tabSignup");
  const formLogin = document.getElementById("formLogin");
  const formSignup = document.getElementById("formSignup");

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");

  const loginButton = document.getElementById("loginButton");
  const signupButton = document.getElementById("signupButton");
  const logoutButton = document.getElementById("logoutButton");

  const statusMessage = document.getElementById("statusMessage");
  const statusMessageLogged = document.getElementById("statusMessageLogged");

  const loggedOutView = document.getElementById("loggedOutView");
  const loggedInView = document.getElementById("loggedInView");
  const accountEmail = document.getElementById("accountEmail");
  const premiumState = document.getElementById("premiumState");

  const profileDisplayName = document.getElementById("profileDisplayName");
  const profileBio = document.getElementById("profileBio");
  const profileSaveButton = document.getElementById("profileSaveButton");
  const profileStatus = document.getElementById("profileStatus");
  const profilePublicLink = document.getElementById("profilePublicLink");

  function setStatus(msg, type = "") {
    if (!statusMessage) return;
    statusMessage.textContent = msg;
    statusMessage.classList.remove("status-error", "status-ok");
    if (type === "error") statusMessage.classList.add("status-error");
    if (type === "ok") statusMessage.classList.add("status-ok");
  }

  function setStatusLogged(msg, type = "") {
    if (!statusMessageLogged) return;
    statusMessageLogged.textContent = msg;
    statusMessageLogged.classList.remove("status-error", "status-ok");
    if (type === "error") statusMessageLogged.classList.add("status-error");
    if (type === "ok") statusMessageLogged.classList.add("status-ok");
  }

  async function refreshUser() {
    let user = null;
    try {
      const { data } = await ppSupabase.auth.getUser();
      user = data?.user || null;
    } catch (err) {
      console.error("auth.getUser error:", err);
    }

    if (user) {
      if (loggedOutView) loggedOutView.style.display = "none";
      if (loggedInView) loggedInView.style.display = "block";
      if (accountEmail) accountEmail.textContent = user.email || "(no email)";
      if (premiumState) premiumState.textContent = "not yet";

      // wczytaj profil do formularza, jeśli elementy istnieją
      if (profileDisplayName || profileBio || profilePublicLink) {
        const profile = await ppGetProfile(user.id);

        if (profileDisplayName && profile && profile.display_name) {
          profileDisplayName.value = profile.display_name;
        }
        if (profileBio && profile && profile.bio) {
          profileBio.value = profile.bio;
        }
        if (profilePublicLink) {
          profilePublicLink.href = `/profile.html?u=${encodeURIComponent(
            user.id
          )}`;
        }
      }
    } else {
      if (loggedOutView) loggedOutView.style.display = "block";
      if (loggedInView) loggedInView.style.display = "none";
    }

    // odśwież topbar (badge + avatar)
    ppUpdateUserBadges();
  }

  // Zakładki login/signup
  if (tabLogin && tabSignup && formLogin && formSignup) {
    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      formLogin.style.display = "block";
      formSignup.style.display = "none";
      setStatus("");
    });

    tabSignup.addEventListener("click", () => {
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
      formSignup.style.display = "block";
      formLogin.style.display = "none";
      setStatus("");
    });
  }

  // LOGOWANIE – wracamy na redirectTarget
  if (loginButton) {
    loginButton.addEventListener("click", async () => {
      setStatus("Logging in…");
      const email = loginEmail.value.trim();
      const password = loginPassword.value;

      if (!email || !password) {
        setStatus("Fill email and password.", "error");
        return;
      }

      try {
        const { error } = await ppSupabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setStatus(error.message || "Could not log in.", "error");
        } else {
          setStatus("");
          await refreshUser();
          setStatusLogged("Logged in. Redirecting…", "ok");
          setTimeout(() => {
            window.location.href = redirectTarget;
          }, 800);
        }
      } catch (err) {
        console.error("Login unexpected error:", err);
        setStatus("Unexpected error during login.", "error");
      }
    });
  }

  // REJESTRACJA
  if (signupButton) {
    signupButton.addEventListener("click", async () => {
      setStatus("Creating account…");
      const email = signupEmail.value.trim();
      const password = signupPassword.value;

      if (!email || !password) {
        setStatus("Fill email and password.", "error");
        return;
      }

      try {
        const { error } = await ppSupabase.auth.signUp({ email, password });

        if (error) {
          setStatus(error.message || "Could not sign up.", "error");
        } else {
          setStatus("Account created. You can log in now.", "ok");
          if (tabLogin) tabLogin.click();
        }
      } catch (err) {
        console.error("Signup unexpected error:", err);
        setStatus("Unexpected error during signup.", "error");
      }
    });
  }

  // ZAPIS PROFILU (opcjonalne – jeśli pola istnieją)
  if (profileSaveButton && profileDisplayName && profileBio) {
    profileSaveButton.addEventListener("click", async () => {
      if (!profileStatus) return;

      profileStatus.textContent = "Saving profile…";
      profileStatus.classList.remove("status-error", "status-ok");

      let user = null;
      try {
        const { data } = await ppSupabase.auth.getUser();
        user = data?.user || null;
      } catch (err) {
        console.error("auth.getUser error:", err);
      }

      if (!user) {
        profileStatus.textContent = "You must be logged in.";
        profileStatus.classList.add("status-error");
        return;
      }

      const display_name = profileDisplayName.value.trim();
      const bio = profileBio.value.trim();

      try {
        const { error } = await ppSupabase
          .from("profiles")
          .upsert(
            {
              user_id: user.id,
              email: user.email || null,
              display_name,
              bio,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (error) {
          console.error("Error updating profile:", error);
          profileStatus.textContent = "Could not save profile.";
          profileStatus.classList.add("status-error");
        } else {
          profileStatus.textContent = "Profile saved.";
          profileStatus.classList.add("status-ok");
          // odśwież topbar po zmianie nicka
          ppUpdateUserBadges();
        }
      } catch (err) {
        console.error("Unexpected error updating profile:", err);
        profileStatus.textContent = "Unexpected error.";
        profileStatus.classList.add("status-error");
      }
    });
  }

  // LOGOUT
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      setStatusLogged("Logging out…");
      try {
        await ppSupabase.auth.signOut();
        setStatusLogged("Logged out.", "ok");
        await refreshUser();
      } catch (err) {
        console.error("Logout error:", err);
        setStatusLogged("Error during logout.", "error");
      }
    });
  }

  // Start
  refreshUser();
}

// init na każdej stronie
document.addEventListener("DOMContentLoaded", () => {
  ppSetupAccountLinks();
  ppUpdateUserBadges();
  ppSetupAccountPage();
});
