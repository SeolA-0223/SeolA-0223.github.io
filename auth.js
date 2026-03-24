(function () {
  const config = window.siteSupabaseConfig || {
    url: "https://uisuogutyhjnmgbgbdjs.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc3VvZ3V0eWhqbm1nYmdiZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODkxNTUsImV4cCI6MjA4OTI2NTE1NX0.xvJTiHzpAq3gTs0HnVIvIiRD947uuvUdS-sY18axOJg"
  };

  const language = document.documentElement.lang === "ko" ? "ko" : "en";
  const messages = {
    ko: {
      authError: "인증 오류",
      guest: "게스트",
      signIn: "로그인",
      signOut: "로그아웃",
      notSignedIn: "로그인되지 않음",
      sessionReadFailed: "세션을 불러오지 못했습니다.",
      sessionActive: "사이트 전체 페이지에서 이 세션이 유지되고 있습니다.",
      sessionGuest: "게스트 모드가 활성화되어 있습니다. 계정을 만들거나 로그인해 세션을 복원하세요.",
      signupRequired: "회원가입에는 이메일과 비밀번호가 모두 필요합니다.",
      signupLoading: "계정을 만드는 중...",
      signupFailed: "계정을 만들지 못했습니다.",
      signupSuccessSignedIn: "계정이 생성되었고 바로 로그인되었습니다.",
      signupSuccessEmail: "계정이 생성되었습니다. 이메일에서 확인 절차를 진행하세요.",
      loginRequired: "로그인에는 이메일과 비밀번호가 모두 필요합니다.",
      loginLoading: "로그인하는 중...",
      loginFailed: "로그인하지 못했습니다.",
      loginSuccess: "로그인되었습니다.",
      logoutLoading: "로그아웃하는 중...",
      logoutFailed: "로그아웃하지 못했습니다.",
      logoutSuccess: "로그아웃되었습니다.",
      createAccount: "계정 만들기",
      creating: "생성 중...",
      signingIn: "로그인 중...",
      signingOut: "로그아웃 중..."
    },
    en: {
      authError: "Auth error",
      guest: "Guest",
      signIn: "Sign in",
      signOut: "Sign out",
      notSignedIn: "Not signed in",
      sessionReadFailed: "Unable to read session.",
      sessionActive: "Session active across every page in this GitHub Pages site.",
      sessionGuest: "Guest mode is active. Create an account or sign in to restore your session.",
      signupRequired: "Email and password are required for sign up.",
      signupLoading: "Creating your account...",
      signupFailed: "Failed to create the account.",
      signupSuccessSignedIn: "Account created. You are now signed in.",
      signupSuccessEmail: "Account created. Check your email to confirm the account.",
      loginRequired: "Email and password are required for sign in.",
      loginLoading: "Signing in...",
      loginFailed: "Failed to sign in.",
      loginSuccess: "Signed in successfully.",
      logoutLoading: "Signing out...",
      logoutFailed: "Failed to sign out.",
      logoutSuccess: "Signed out.",
      createAccount: "Create account",
      creating: "Creating...",
      signingIn: "Signing in...",
      signingOut: "Signing out..."
    }
  }[language];

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

  const state = {
    sessionEmail: null,
    statusMessage: statusElement ? statusElement.textContent : ""
  };

  if (!window.supabase || (!authBar && !signupForm && !loginForm && !logoutButtons.length)) {
    return;
  }

  const { createClient } = window.supabase;
  const supabase =
    window.siteSupabaseClient || createClient(config.url, config.anonKey);

  window.siteSupabaseConfig = config;
  window.siteSupabaseClient = supabase;

  function setStatus(message, tone) {
    state.statusMessage = message;

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

  function renderSessionUi(hasError) {
    const signedIn = Boolean(state.sessionEmail);

    if (authChip) {
      authChip.textContent = signedIn ? state.sessionEmail : hasError ? messages.authError : messages.guest;
      authChip.classList.toggle("is-active", signedIn);
    }

    if (authEntry) {
      authEntry.classList.toggle("is-hidden", signedIn);
      authEntry.textContent = messages.signIn;
    }

    logoutButtons.forEach(function (button) {
      button.classList.toggle("is-hidden", !signedIn);
      if (!button.disabled) {
        button.textContent = messages.signOut;
      }
    });

    if (emailElement) {
      emailElement.textContent = signedIn ? state.sessionEmail : hasError ? "-" : messages.notSignedIn;
    }

    if (stateElement) {
      if (hasError) {
        stateElement.textContent = messages.sessionReadFailed;
      } else {
        stateElement.textContent = signedIn ? messages.sessionActive : messages.sessionGuest;
      }
    }

    setGroupHidden(memberOnlySections, !signedIn);
    setGroupHidden(guestOnlySections, signedIn);
  }

  async function syncSession() {
    const sessionResult = await supabase.auth.getSession();

    if (sessionResult.error) {
      state.sessionEmail = null;
      renderSessionUi(true);
      setStatus(sessionResult.error.message || messages.sessionReadFailed, "error");
      return;
    }

    const session = sessionResult.data.session;
    state.sessionEmail = session && session.user ? session.user.email || null : null;
    renderSessionUi(false);
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
      setStatus(messages.signupRequired, "error");
      return;
    }

    setButtonBusy(signupButton, true, messages.createAccount, messages.creating);
    setStatus(messages.signupLoading, "loading");

    const result = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: getCleanCurrentUrl()
      }
    });

    setButtonBusy(signupButton, false, messages.createAccount, messages.creating);

    if (result.error) {
      setStatus(result.error.message || messages.signupFailed, "error");
      return;
    }

    signupForm.reset();
    await syncSession();
    setStatus(
      result.data.session ? messages.signupSuccessSignedIn : messages.signupSuccessEmail,
      "success"
    );
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
      setStatus(messages.loginRequired, "error");
      return;
    }

    setButtonBusy(loginButton, true, messages.signIn, messages.signingIn);
    setStatus(messages.loginLoading, "loading");

    const result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    setButtonBusy(loginButton, false, messages.signIn, messages.signingIn);

    if (result.error) {
      setStatus(result.error.message || messages.loginFailed, "error");
      return;
    }

    loginForm.reset();
    await syncSession();
    setStatus(messages.loginSuccess, "success");
  }

  async function handleLogout() {
    const buttons = Array.from(logoutButtons);

    buttons.forEach(function (button) {
      setButtonBusy(button, true, messages.signOut, messages.signingOut);
    });

    setStatus(messages.logoutLoading, "loading");

    const result = await supabase.auth.signOut();

    buttons.forEach(function (button) {
      setButtonBusy(button, false, messages.signOut, messages.signingOut);
    });

    if (result.error) {
      setStatus(result.error.message || messages.logoutFailed, "error");
      return;
    }

    await syncSession();
    setStatus(messages.logoutSuccess, "success");
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

  renderSessionUi(false);
  syncSession();
})();
