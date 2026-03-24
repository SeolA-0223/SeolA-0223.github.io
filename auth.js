(function () {
  const config = window.siteSupabaseConfig || {
    url: "https://uisuogutyhjnmgbgbdjs.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc3VvZ3V0eWhqbm1nYmdiZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODkxNTUsImV4cCI6MjA4OTI2NTE1NX0.xvJTiHzpAq3gTs0HnVIvIiRD947uuvUdS-sY18axOJg"
  };

  const authBar = document.getElementById("site-auth-bar");
  const authChip = document.getElementById("site-auth-chip");
  const authEntry = document.getElementById("site-auth-entry");
  const logoutButtons = document.querySelectorAll('[data-site-auth-action="logout"]');
  const signupForm = document.getElementById("site-signup-form");
  const signupButton = document.getElementById("site-signup-button");
  const loginForm = document.getElementById("site-login-form");
  const loginButton = document.getElementById("site-login-button");
  const statusElement = document.getElementById("site-auth-status");
  const emailElement = document.getElementById("site-auth-email");
  const stateElement = document.getElementById("site-auth-state");
  const memberOnlySections = document.querySelectorAll("[data-site-auth-user]");
  const guestOnlySections = document.querySelectorAll("[data-site-auth-guest]");

  if (!window.supabase || (!authBar && !signupForm && !loginForm && !logoutButtons.length)) {
    return;
  }

  const { createClient } = window.supabase;
  const supabase =
    window.siteSupabaseClient || createClient(config.url, config.anonKey);

  window.siteSupabaseConfig = config;
  window.siteSupabaseClient = supabase;

  function setStatus(message, tone) {
    if (!statusElement) {
      return;
    }

    statusElement.textContent = message;
    statusElement.className = "board-status";

    if (tone) {
      statusElement.classList.add("board-status-" + tone);
    }
  }

  function setButtonBusy(button, isBusy, idleText, busyText) {
    if (!button) {
      return;
    }

    button.disabled = isBusy;
    button.textContent = isBusy ? busyText : idleText;
  }

  function setGroupHidden(elements, hidden) {
    elements.forEach(function (element) {
      element.classList.toggle("is-hidden", hidden);
    });
  }

  function getCleanCurrentUrl() {
    if (!window.location.origin || window.location.origin === "null") {
      return undefined;
    }

    if (!/^https?:/i.test(window.location.origin)) {
      return undefined;
    }

    const url = new URL(window.location.href);
    url.hash = "";
    url.search = "";
    return url.toString();
  }

  async function syncSession() {
    const sessionResult = await supabase.auth.getSession();

    if (sessionResult.error) {
      if (authChip) {
        authChip.textContent = "Auth error";
      }

      if (emailElement) {
        emailElement.textContent = "-";
      }

      if (stateElement) {
        stateElement.textContent = "Unable to read session";
      }

      setGroupHidden(memberOnlySections, true);
      setGroupHidden(guestOnlySections, false);
      setStatus(sessionResult.error.message || "Failed to read session.", "error");
      return;
    }

    const session = sessionResult.data.session;
    const user = session ? session.user : null;
    const email = user && user.email ? user.email : null;
    const signedIn = Boolean(email);

    if (authChip) {
      authChip.textContent = signedIn ? email : "Guest";
      authChip.classList.toggle("is-active", signedIn);
    }

    if (authEntry) {
      authEntry.classList.toggle("is-hidden", signedIn);
    }

    logoutButtons.forEach(function (button) {
      button.classList.toggle("is-hidden", !signedIn);
    });

    if (emailElement) {
      emailElement.textContent = email || "Not signed in";
    }

    if (stateElement) {
      stateElement.textContent = signedIn
        ? "Session active across every page in this GitHub Pages site."
        : "Guest mode is active. Create an account or sign in to restore your session.";
    }

    setGroupHidden(memberOnlySections, !signedIn);
    setGroupHidden(guestOnlySections, signedIn);
  }

  async function handleSignup(event) {
    event.preventDefault();

    if (!signupForm) {
      return;
    }

    const formData = new FormData(signupForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setStatus("Email and password are required for sign up.", "error");
      return;
    }

    setButtonBusy(signupButton, true, "Create account", "Creating...");
    setStatus("Creating your account...", "loading");

    const result = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: getCleanCurrentUrl()
      }
    });

    setButtonBusy(signupButton, false, "Create account", "Creating...");

    if (result.error) {
      setStatus(result.error.message || "Failed to create the account.", "error");
      return;
    }

    signupForm.reset();
    await syncSession();

    if (result.data.session) {
      setStatus("Account created. You are now signed in.", "success");
      return;
    }

    setStatus("Account created. Check your email to confirm the account.", "success");
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (!loginForm) {
      return;
    }

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setStatus("Email and password are required for sign in.", "error");
      return;
    }

    setButtonBusy(loginButton, true, "Sign in", "Signing in...");
    setStatus("Signing in...", "loading");

    const result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    setButtonBusy(loginButton, false, "Sign in", "Signing in...");

    if (result.error) {
      setStatus(result.error.message || "Failed to sign in.", "error");
      return;
    }

    loginForm.reset();
    await syncSession();
    setStatus("Signed in successfully.", "success");
  }

  async function handleLogout() {
    const buttons = Array.from(logoutButtons);

    buttons.forEach(function (button) {
      setButtonBusy(button, true, "Sign out", "Signing out...");
    });

    setStatus("Signing out...", "loading");

    const result = await supabase.auth.signOut();

    buttons.forEach(function (button) {
      setButtonBusy(button, false, "Sign out", "Signing out...");
    });

    if (result.error) {
      setStatus(result.error.message || "Failed to sign out.", "error");
      return;
    }

    await syncSession();
    setStatus("Signed out.", "success");
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  logoutButtons.forEach(function (button) {
    button.addEventListener("click", handleLogout);
  });

  supabase.auth.onAuthStateChange(function () {
    window.setTimeout(function () {
      syncSession();
    }, 0);
  });

  syncSession();
})();
