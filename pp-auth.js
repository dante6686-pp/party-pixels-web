// Party Pixels – wspólny auth helper dla wszystkich stron

const SUPABASE_URL = "https://dyfrzwhycqnqntvkuxy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnJ6d2h5Y3FucW50dmt1eHkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0MzY3ODY4OSwiZXhwIjoyMDU5MjU0Njg5fQ.BskE2afnGLDtkv4kMWOTCEt4_mH2T85X5o_oMEAtSsc";

const ppSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      if (loggedOutView) loggedOutView.style.display = "none";
      if (loggedInView) loggedInView.style.display = "block";
      if (accountEmail) accountEmail.textContent = user.email || "(no email)";
      if (premiumState) premiumState.textContent = "not yet"; // tu później podłączymy premium
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

  refreshUser();
}

// init na każdej stronie
document.addEventListener("DOMContentLoaded", () => {
  ppSetupAccountLinks();
  ppUpdateUserBadges();
  ppSetupAccountPage();
});