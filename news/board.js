(function () {
  const SUPABASE_URL = "https://uisuogutyhjnmgbgbdjs.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc3VvZ3V0eWhqbm1nYmdiZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODkxNTUsImV4cCI6MjA4OTI2NTE1NX0.xvJTiHzpAq3gTs0HnVIvIiRD947uuvUdS-sY18axOJg";
  const POST_TABLE = "board_posts";
  const COMMENT_TABLE = "board_comments";
  const POST_LIMIT = 30;

  const form = document.getElementById("board-form");
  const submitButton = document.getElementById("board-submit");
  const refreshButton = document.getElementById("refresh-board");
  const postsContainer = document.getElementById("board-posts");
  const countElement = document.getElementById("board-count");
  const commentCountElement = document.getElementById("comment-count");
  const sessionStateElement = document.getElementById("board-session-state");
  const updatedElement = document.getElementById("board-updated");
  const statusElement = document.getElementById("board-status");
  const adminLoginForm = document.getElementById("admin-login-form");
  const adminLoginButton = document.getElementById("admin-login-button");
  const adminLogoutButton = document.getElementById("admin-logout");
  const adminSessionElement = document.getElementById("admin-session");

  const state = {
    posts: [],
    commentsByPostId: {},
    commentCount: 0,
    sessionEmail: null,
    isAdmin: false
  };

  if (
    !window.supabase ||
    !form ||
    !submitButton ||
    !refreshButton ||
    !postsContainer ||
    !countElement ||
    !commentCountElement ||
    !sessionStateElement ||
    !updatedElement ||
    !statusElement
  ) {
    return;
  }

  const { createClient } = window.supabase;
  const supabase =
    window.siteSupabaseClient || createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function setStatus(message, tone) {
    statusElement.textContent = message;
    statusElement.className = "board-status";

    if (tone) {
      statusElement.classList.add("board-status-" + tone);
    }
  }

  function setUpdatedTimestamp(date) {
    updatedElement.textContent = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  function setComposerBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? "Publishing..." : "Publish post";
  }

  function setRefreshBusy(isBusy) {
    refreshButton.disabled = isBusy;
    refreshButton.textContent = isBusy ? "Refreshing..." : "Refresh posts";
  }

  function setAdminBusy(isBusy) {
    if (!adminLoginButton) {
      return;
    }

    adminLoginButton.disabled = isBusy;
    adminLoginButton.textContent = isBusy ? "Signing in..." : "Sign in";
  }

  function setLogoutBusy(isBusy) {
    if (!adminLogoutButton) {
      return;
    }

    adminLogoutButton.disabled = isBusy;
    adminLogoutButton.textContent = isBusy ? "Signing out..." : "Sign out";
  }

  function setInlineBusy(button, isBusy, idleText, busyText) {
    if (!button) {
      return;
    }

    button.disabled = isBusy;
    button.textContent = isBusy ? busyText : idleText;
  }

  function createEmptyState(message) {
    const empty = document.createElement("p");
    empty.className = "board-empty";
    empty.textContent = message;
    return empty;
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function setSessionStateLabel() {
    if (!state.sessionEmail) {
      sessionStateElement.textContent = "Guest";
      return;
    }

    sessionStateElement.textContent = state.isAdmin ? "Admin" : "User";
  }

  function renderAdminSession() {
    if (!adminSessionElement || !adminLoginForm || !adminLogoutButton) {
      return;
    }

    adminSessionElement.innerHTML = "";

    const message = document.createElement("p");
    message.className = "board-empty";

    if (!state.sessionEmail) {
      message.textContent = "Signed out. Admin delete controls are hidden.";
      adminLoginForm.classList.remove("is-hidden");
      adminLogoutButton.classList.add("is-hidden");
    } else if (state.isAdmin) {
      message.textContent =
        "Signed in as " +
        state.sessionEmail +
        ". Admin delete controls are enabled for every post.";
      adminLoginForm.classList.add("is-hidden");
      adminLogoutButton.classList.remove("is-hidden");
    } else {
      message.textContent =
        "Signed in as " +
        state.sessionEmail +
        ", but this account is not listed in private.board_admins yet.";
      adminLoginForm.classList.add("is-hidden");
      adminLogoutButton.classList.remove("is-hidden");
    }

    adminSessionElement.appendChild(message);
    setSessionStateLabel();
  }

  function groupCommentsByPost(comments) {
    const grouped = {};

    comments.forEach(function (comment) {
      const key = String(comment.post_id);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(comment);
    });

    return grouped;
  }

  function renderCommentList(comments) {
    const wrapper = document.createElement("div");
    wrapper.className = "board-comment-list";

    if (!comments.length) {
      wrapper.appendChild(createEmptyState("No comments yet."));
      return wrapper;
    }

    const formatter = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    comments.forEach(function (comment) {
      const article = document.createElement("article");
      article.className = "board-comment";

      const meta = document.createElement("p");
      meta.className = "board-comment-meta";
      meta.textContent =
        comment.name + " - " + formatter.format(new Date(comment.created_at));

      const body = document.createElement("p");
      body.className = "board-comment-body";
      body.textContent = comment.content;

      article.appendChild(meta);
      article.appendChild(body);
      wrapper.appendChild(article);
    });

    return wrapper;
  }

  function createCommentForm(postId) {
    const formElement = document.createElement("form");
    formElement.className = "board-comment-form";
    formElement.dataset.postId = String(postId);

    const grid = document.createElement("div");
    grid.className = "board-inline-grid";

    const nameLabel = document.createElement("label");
    nameLabel.className = "field";
    nameLabel.innerHTML =
      '<span class="field-label">Comment name</span>' +
      '<input class="field-input" name="comment_name" type="text" maxlength="40" required>';

    const actionLabel = document.createElement("div");
    actionLabel.className = "field";
    actionLabel.innerHTML =
      '<span class="field-label">Action</span>' +
      '<button class="button button-secondary" type="submit" data-role="comment-submit">Add comment</button>';

    grid.appendChild(nameLabel);
    grid.appendChild(actionLabel);

    const contentLabel = document.createElement("label");
    contentLabel.className = "field";
    contentLabel.innerHTML =
      '<span class="field-label">Comment</span>' +
      '<textarea class="field-input field-textarea" name="comment_content" rows="4" maxlength="1000" required></textarea>';

    formElement.appendChild(grid);
    formElement.appendChild(contentLabel);
    return formElement;
  }

  function createDeleteForm(postId) {
    const formElement = document.createElement("form");
    formElement.className = "board-inline-form board-delete-form";
    formElement.dataset.postId = String(postId);
    formElement.innerHTML =
      '<input class="field-input board-inline-input" name="delete_password" type="password" minlength="4" maxlength="72" placeholder="Delete password" required>' +
      '<button class="button button-secondary" type="submit" data-role="delete-submit">Delete with password</button>';
    return formElement;
  }

  function renderPosts() {
    postsContainer.innerHTML = "";

    if (!state.posts.length) {
      postsContainer.appendChild(createEmptyState("No posts yet. Be the first to write one."));
      countElement.textContent = "0";
      commentCountElement.textContent = "0";
      return;
    }

    const formatter = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    state.posts.forEach(function (post) {
      const comments = state.commentsByPostId[String(post.id)] || [];

      const article = document.createElement("article");
      article.className = "board-post";
      article.dataset.postId = String(post.id);

      const head = document.createElement("div");
      head.className = "board-post-head";

      const title = document.createElement("h3");
      title.className = "board-post-title";
      title.textContent = post.title;

      const meta = document.createElement("p");
      meta.className = "board-post-meta";
      meta.textContent = post.name + " - " + formatter.format(new Date(post.created_at));

      const body = document.createElement("p");
      body.className = "board-post-body";
      body.textContent = post.content;

      const toolbar = document.createElement("div");
      toolbar.className = "board-post-toolbar";

      const note = document.createElement("p");
      note.className = "board-post-note";
      note.textContent = comments.length + " comment" + (comments.length === 1 ? "" : "s");

      const actionWrap = document.createElement("div");
      actionWrap.className = "board-post-actions";
      actionWrap.appendChild(createDeleteForm(post.id));

      if (state.isAdmin) {
        const adminButton = document.createElement("button");
        adminButton.className = "button button-danger";
        adminButton.type = "button";
        adminButton.dataset.action = "admin-delete";
        adminButton.dataset.postId = String(post.id);
        adminButton.textContent = "Delete as admin";
        actionWrap.appendChild(adminButton);
      }

      toolbar.appendChild(note);
      toolbar.appendChild(actionWrap);

      const commentsSection = document.createElement("section");
      commentsSection.className = "board-comments-section";

      const commentsHead = document.createElement("div");
      commentsHead.className = "board-comments-head";

      const commentsTitle = document.createElement("h4");
      commentsTitle.className = "board-comments-title";
      commentsTitle.textContent = "Comments";

      const commentsBadge = document.createElement("span");
      commentsBadge.className = "board-comment-badge";
      commentsBadge.textContent = String(comments.length);

      commentsHead.appendChild(commentsTitle);
      commentsHead.appendChild(commentsBadge);
      commentsSection.appendChild(commentsHead);
      commentsSection.appendChild(renderCommentList(comments));
      commentsSection.appendChild(createCommentForm(post.id));

      head.appendChild(title);
      head.appendChild(meta);
      article.appendChild(head);
      article.appendChild(body);
      article.appendChild(toolbar);
      article.appendChild(commentsSection);
      postsContainer.appendChild(article);
    });

    countElement.textContent = String(state.posts.length);
    commentCountElement.textContent = String(state.commentCount);
  }

  function explainError(error, fallbackMessage) {
    const message = error && error.message ? error.message : fallbackMessage;

    if (
      message.indexOf("Could not find the table") !== -1 ||
      message.indexOf("Could not find the function") !== -1
    ) {
      return "Run the updated supabase/setup-board.sql again. This feature needs the latest tables and RPC functions.";
    }

    if (
      message.indexOf("row-level security") !== -1 ||
      message.indexOf("permission denied") !== -1
    ) {
      return "Supabase blocked this request. Check the updated grants, RLS policies, and admin allowlist.";
    }

    return message;
  }

  async function syncAdminSession() {
    const sessionResult = await supabase.auth.getSession();

    if (sessionResult.error) {
      state.sessionEmail = null;
      state.isAdmin = false;
      renderAdminSession();
      return;
    }

    const session = sessionResult.data.session;
    state.sessionEmail = session && session.user ? session.user.email || null : null;
    state.isAdmin = false;

    if (state.sessionEmail) {
      const adminResult = await supabase.rpc("is_board_admin_session");

      if (adminResult.error) {
        setStatus(explainError(adminResult.error, "Failed to check admin session."), "error");
      } else {
        state.isAdmin = Boolean(adminResult.data);
      }
    }

    renderAdminSession();
    renderPosts();
  }

  async function loadPosts() {
    setRefreshBusy(true);
    setStatus("Loading posts and comments from Supabase...", "loading");

    const result = await supabase
      .from(POST_TABLE)
      .select("id, name, title, content, created_at")
      .order("created_at", { ascending: false })
      .limit(POST_LIMIT);

    if (result.error) {
      setRefreshBusy(false);
      postsContainer.innerHTML = "";
      postsContainer.appendChild(
        createEmptyState("The board is not ready yet. Finish the latest Supabase SQL setup first.")
      );
      countElement.textContent = "0";
      commentCountElement.textContent = "0";
      updatedElement.textContent = "-";
      setStatus(explainError(result.error, "Failed to load posts."), "error");
      return;
    }

    const posts = result.data || [];
    let comments = [];

    if (posts.length) {
      const commentResult = await supabase
        .from(COMMENT_TABLE)
        .select("id, post_id, name, content, created_at")
        .in(
          "post_id",
          posts.map(function (post) {
            return post.id;
          })
        )
        .order("created_at", { ascending: true });

      if (commentResult.error) {
        setRefreshBusy(false);
        setStatus(explainError(commentResult.error, "Failed to load comments."), "error");
        return;
      }

      comments = commentResult.data || [];
    }

    setRefreshBusy(false);
    state.posts = posts;
    state.commentsByPostId = groupCommentsByPost(comments);
    state.commentCount = comments.length;
    renderPosts();
    setUpdatedTimestamp(new Date());
    setStatus("Connected. Posts, comments, and auth status are synced.", "success");
  }

  async function handleAdminLogin(event) {
    event.preventDefault();

    if (!adminLoginForm) {
      return;
    }

    const formData = new FormData(adminLoginForm);
    const email = normalizeText(formData.get("email"));
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setStatus("Admin email and password are required.", "error");
      return;
    }

    setAdminBusy(true);
    setStatus("Signing in to Supabase Auth...", "loading");

    const result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    setAdminBusy(false);

    if (result.error) {
      setStatus(explainError(result.error, "Failed to sign in."), "error");
      return;
    }

    adminLoginForm.reset();
    await syncAdminSession();
    setStatus(
      state.isAdmin
        ? "Admin session active."
        : "Signed in, but this account is not in private.board_admins yet.",
      state.isAdmin ? "success" : "error"
    );
  }

  async function handleAdminLogout() {
    setLogoutBusy(true);
    setStatus("Signing out...", "loading");

    const result = await supabase.auth.signOut();

    setLogoutBusy(false);

    if (result.error) {
      setStatus(explainError(result.error, "Failed to sign out."), "error");
      return;
    }

    await syncAdminSession();
    setStatus("Signed out.", "success");
  }

  async function handlePostSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const name = normalizeText(formData.get("name"));
    const title = normalizeText(formData.get("title"));
    const content = normalizeText(formData.get("content"));
    const deletePassword = String(formData.get("delete_password") || "");

    if (!name || !title || !content || !deletePassword) {
      setStatus("Name, title, message, and delete password are required.", "error");
      return;
    }

    setComposerBusy(true);
    setStatus("Publishing the new post...", "loading");

    const result = await supabase.rpc("create_board_post", {
      p_name: name,
      p_title: title,
      p_content: content,
      p_delete_password: deletePassword
    });

    setComposerBusy(false);

    if (result.error) {
      setStatus(explainError(result.error, "Failed to publish the post."), "error");
      return;
    }

    form.reset();
    setStatus("Post published.", "success");
    await loadPosts();
  }

  async function handleCommentSubmit(formElement) {
    const postId = Number(formElement.dataset.postId || "0");
    const formData = new FormData(formElement);
    const name = normalizeText(formData.get("comment_name"));
    const content = normalizeText(formData.get("comment_content"));
    const button = formElement.querySelector('[data-role="comment-submit"]');

    if (!postId || !name || !content) {
      setStatus("Comment name and content are required.", "error");
      return;
    }

    setInlineBusy(button, true, "Add comment", "Posting...");
    setStatus("Publishing the comment...", "loading");

    const result = await supabase.rpc("create_board_comment", {
      p_post_id: postId,
      p_name: name,
      p_content: content
    });

    setInlineBusy(button, false, "Add comment", "Posting...");

    if (result.error) {
      setStatus(explainError(result.error, "Failed to publish the comment."), "error");
      return;
    }

    formElement.reset();
    setStatus("Comment added.", "success");
    await loadPosts();
  }

  async function handleDeleteSubmit(formElement) {
    const postId = Number(formElement.dataset.postId || "0");
    const formData = new FormData(formElement);
    const deletePassword = String(formData.get("delete_password") || "");
    const button = formElement.querySelector('[data-role="delete-submit"]');

    if (!postId || !deletePassword) {
      setStatus("Enter the delete password first.", "error");
      return;
    }

    if (!window.confirm("Delete this post and its comments?")) {
      return;
    }

    setInlineBusy(button, true, "Delete with password", "Deleting...");
    setStatus("Deleting the post...", "loading");

    const result = await supabase.rpc("delete_board_post_with_password", {
      p_post_id: postId,
      p_delete_password: deletePassword
    });

    setInlineBusy(button, false, "Delete with password", "Deleting...");

    if (result.error) {
      setStatus(explainError(result.error, "Failed to delete the post."), "error");
      return;
    }

    if (!result.data) {
      setStatus("Delete password did not match, or the post was already removed.", "error");
      return;
    }

    setStatus("Post deleted.", "success");
    await loadPosts();
  }

  async function handleAdminDelete(button) {
    if (!state.isAdmin) {
      setStatus("Admin access is required for this action.", "error");
      return;
    }

    const postId = Number(button.dataset.postId || "0");

    if (!postId) {
      return;
    }

    if (!window.confirm("Admin delete this post and all of its comments?")) {
      return;
    }

    setInlineBusy(button, true, "Delete as admin", "Deleting...");
    setStatus("Admin delete in progress...", "loading");

    const result = await supabase
      .from(POST_TABLE)
      .delete()
      .eq("id", postId);

    setInlineBusy(button, false, "Delete as admin", "Deleting...");

    if (result.error) {
      setStatus(explainError(result.error, "Failed to delete the post as admin."), "error");
      return;
    }

    setStatus("Post deleted as admin.", "success");
    await loadPosts();
  }

  refreshButton.addEventListener("click", function () {
    loadPosts();
  });

  form.addEventListener("submit", handlePostSubmit);

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", handleAdminLogin);
  }

  if (adminLogoutButton) {
    adminLogoutButton.addEventListener("click", handleAdminLogout);
  }

  postsContainer.addEventListener("submit", function (event) {
    const commentForm = event.target.closest(".board-comment-form");

    if (commentForm) {
      event.preventDefault();
      handleCommentSubmit(commentForm);
      return;
    }

    const deleteForm = event.target.closest(".board-delete-form");

    if (deleteForm) {
      event.preventDefault();
      handleDeleteSubmit(deleteForm);
    }
  });

  postsContainer.addEventListener("click", function (event) {
    const button = event.target.closest('[data-action="admin-delete"]');

    if (button) {
      handleAdminDelete(button);
    }
  });

  supabase.auth.onAuthStateChange(function () {
    window.setTimeout(function () {
      syncAdminSession();
    }, 0);
  });

  Promise.all([syncAdminSession(), loadPosts()]);
})();
