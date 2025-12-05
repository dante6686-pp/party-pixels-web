// Party Pixels – wspólny auth helper dla wszystkich stron

const SUPABASE_URL = "https://dyfrzwxhycqnqntvkuxy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnJ6d3hoeWNxbnFudHZrdXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODM5MjgsImV4cCI6MjA4MDE1OTkyOH0.n4jP0q7YZY-jQaSnHUkKWyI9wM02iHXnRXS31AATnY0";

const ppSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.ppSupabase = ppSupabase;

async function ppEnsureProfileForUser(user) {
  if (!user) return;

  try {
    // Czy profil już istnieje?
    const { data, error } = await ppSupabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking profile:", error);
      return;
    }

    if (!data) {
      const email = user.email || "";
      const displayName = email ? email.split("@")[0] : "Player";

      const { error: insertError } = await ppSupabase.from("profiles").insert([
        {
          user_id: user.id,
          email,
          display_name: displayName,
        },
      ]);

      if (insertError) {
        console.error("Error creating profile:", insertError);
      }
    }
  } catch (err) {
    console.error("Unexpected error in ppEnsureProfileForUser:", err);
  }
}

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

async function ppUpdateUserBadges() {
  const badges = document.querySelectorAll("[data-pp-user-badge]");
  if (!badges.length) return;

  const { data } = await ppSupabase.auth.getUser();
  const user = data?.user;

  badges.forEach((el) => {
    if (user && user.email) {
      el.textContent = `Logged in as ${user.email}`;
    } else {
      el.textContent = "Not logged in";
    }
  });
}

function ppSetupAccountPage() {
  const isAccount = window.location.pathname.endsWith("/account.html");
  if (!isAccount) return;

  // redirect target z query
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
  const { data } = await ppSupabase.auth.getUser();
  const user = data?.user || null;

  if (user) {
    // Upewnij się, że profil istnieje
    await ppEnsureProfileForUser(user);

    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "block";
    if (accountEmail) accountEmail.textContent = user.email || "(no email)";
    if (premiumState) premiumState.textContent = "not yet";

    // pobierz profil do formularza
    const { data: profileData } = await ppSupabase
      .from("profiles")
      .select("display_name, bio")
      .eq("user_id", user.id)
      .maybeSingle();

    const displayNameInput = document.getElementById("profileDisplayName");
    const bioInput = document.getElementById("profileBio");
    const profileLink = document.getElementById("profilePublicLink");

    if (displayNameInput && profileData?.display_name) {
      displayNameInput.value = profileData.display_name;
    }
    if (bioInput && profileData?.bio) {
      bioInput.value = profileData.bio;
    }
    if (profileLink) {
      profileLink.href = `/profile.html?u=${encodeURIComponent(user.id)}`;
    }
  } else {
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
  }
  }

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

  if (loginButton) {
    loginButton.addEventListener("click", async () => {
      setStatus("Logging in…");
      const email = loginEmail.value.trim();
      const password = loginPassword.value;

      if (!email || !password) {
        setStatus("Fill email and password.", "error");
        return;
      }

      const { error } = await ppSupabase.auth.signInWithPassword({ email, password });

      if (error) {
        setStatus(error.message || "Could not log in.", "error");
      } else {
        setStatus("");
        await refreshUser();
        setStatusLogged("Logged in. Redirecting…", "ok");
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 2000);
      }
    });
  }

  if (signupButton) {
    signupButton.addEventListener("click", async () => {
      setStatus("Creating account…");
      const email = signupEmail.value.trim();
      const password = signupPassword.value;

      if (!email || !password) {
        setStatus("Fill email and password.", "error");
        return;
      }

      const { error } = await ppSupabase.auth.signUp({ email, password });

      if (error) {
        setStatus(error.message || "Could not sign up.", "error");
      } else {
        setStatus("Account created. You can log in now.", "ok");
        if (tabLogin) tabLogin.click();
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      setStatusLogged("Logging out…");
      await ppSupabase.auth.signOut();
      setStatusLogged("Logged out.", "ok");
      await refreshUser();
    });
  }

  //* niepewny jestem czy tutaj w dobre miejsce wkleiłem*//
  
  const profileSaveButton = document.getElementById("profileSaveButton");
  const profileStatus = document.getElementById("profileStatus");

  if (profileSaveButton) {
    profileSaveButton.addEventListener("click", async () => {
      if (!profileStatus) return;

      profileStatus.textContent = "Saving profile…";
      profileStatus.classList.remove("status-error", "status-ok");

      const { data } = await ppSupabase.auth.getUser();
      const user = data?.user || null;
      if (!user) {
        profileStatus.textContent = "You must be logged in.";
        profileStatus.classList.add("status-error");
        return;
      }

      const displayNameInput = document.getElementById("profileDisplayName");
      const bioInput = document.getElementById("profileBio");

      const display_name = displayNameInput.value.trim();
      const bio = bioInput.value.trim();

      try {
        const { error } = await ppSupabase
          .from("profiles")
          .update({
            display_name,
            bio,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating profile:", error);
          profileStatus.textContent = "Could not save profile.";
          profileStatus.classList.add("status-error");
        } else {
          profileStatus.textContent = "Profile saved.";
          profileStatus.classList.add("status-ok");
        }
      } catch (err) {
        console.error("Unexpected error updating profile:", err);
        profileStatus.textContent = "Unexpected error.";
        profileStatus.classList.add("status-error");
      }
    });
  }
  //*koniec tego niepewnego 

  refreshUser();
}

// init na każdej stronie
document.addEventListener("DOMContentLoaded", () => {
  ppSetupAccountLinks();
  ppUpdateUserBadges();
  ppSetupAccountPage();
});
