(function () {
  const SUPABASE_URL = "https://uisuogutyhjnmgbgbdjs.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc3VvZ3V0eWhqbm1nYmdiZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODkxNTUsImV4cCI6MjA4OTI2NTE1NX0.xvJTiHzpAq3gTs0HnVIvIiRD947uuvUdS-sY18axOJg";
  const POST_TABLE = "board_posts";
  const COMMENT_TABLE = "board_comments";
  const POST_LIMIT = 30;

  const language = document.documentElement.lang === "ko" ? "ko" : "en";
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const messages = {
    ko: {
      loading: "Supabase에서 게시물과 댓글을 불러오는 중...",
      notReady: "게시판 준비가 아직 끝나지 않았습니다. 먼저 최신 Supabase SQL 설정을 완료하세요.",
      loadPostsFailed: "게시물을 불러오지 못했습니다.",
      loadCommentsFailed: "댓글을 불러오지 못했습니다.",
      connected: "연결되었습니다. 게시물, 댓글, 인증 상태가 모두 동기화되었습니다.",
      adminCredentialsRequired: "관리자 이메일과 비밀번호를 모두 입력하세요.",
      authSigningIn: "Supabase Auth에 로그인하는 중...",
      signInFailed: "로그인하지 못했습니다.",
      adminSessionActive: "관리자 세션이 활성화되었습니다.",
      adminAllowlistMissing: "로그인되었지만 이 계정은 아직 private.board_admins에 없습니다.",
      signingOut: "로그아웃하는 중...",
      signOutFailed: "로그아웃하지 못했습니다.",
      signedOut: "로그아웃되었습니다.",
      postRequired: "작성자, 제목, 내용, 삭제 비밀번호를 모두 입력하세요.",
      postPublishing: "새 게시글을 게시하는 중...",
      postPublishFailed: "게시글을 등록하지 못했습니다.",
      postPublished: "게시글이 등록되었습니다.",
      commentRequired: "댓글 작성자와 내용을 모두 입력하세요.",
      commentPublishing: "댓글을 등록하는 중...",
      commentPublishFailed: "댓글을 등록하지 못했습니다.",
      commentAdded: "댓글이 추가되었습니다.",
      deletePasswordRequired: "먼저 삭제 비밀번호를 입력하세요.",
      deleteConfirm: "이 게시글과 댓글을 삭제할까요?",
      deletingPost: "게시글을 삭제하는 중...",
      deletePostFailed: "게시글을 삭제하지 못했습니다.",
      deletePasswordMismatch: "삭제 비밀번호가 일치하지 않거나 이미 게시글이 삭제되었습니다.",
      postDeleted: "게시글이 삭제되었습니다.",
      adminRequired: "이 작업에는 관리자 권한이 필요합니다.",
      adminDeleteConfirm: "관리자 권한으로 이 게시글과 모든 댓글을 삭제할까요?",
      adminDeleting: "관리자 삭제를 진행하는 중...",
      adminDeleteFailed: "관리자 권한으로 게시글을 삭제하지 못했습니다.",
      adminDeleted: "관리자 권한으로 게시글이 삭제되었습니다.",
      missingSchema: "최신 테이블과 RPC 함수가 필요합니다. 업데이트된 supabase/setup-board.sql을 다시 실행하세요.",
      permissionDenied: "Supabase가 이 요청을 차단했습니다. 최신 grant, RLS 정책, 관리자 허용 목록을 확인하세요.",
      checkAdminFailed: "관리자 세션을 확인하지 못했습니다.",
      guest: "게스트",
      admin: "관리자",
      user: "사용자",
      publishPost: "게시하기",
      publishing: "게시 중...",
      refreshPosts: "게시물 새로고침",
      refreshing: "새로고침 중...",
      signIn: "로그인",
      signingIn: "로그인 중...",
      signOut: "로그아웃",
      signingOut: "로그아웃 중...",
      addComment: "댓글 달기",
      posting: "등록 중...",
      deleteWithPassword: "비밀번호로 삭제",
      deleting: "삭제 중...",
      deleteAsAdmin: "관리자로 삭제",
      noComments: "아직 댓글이 없습니다.",
      noPosts: "아직 게시물이 없습니다. 첫 글을 남겨보세요.",
      commentsTitle: "댓글",
      commentName: "댓글 작성자",
      action: "동작",
      comment: "댓글",
      deletePassword: "삭제 비밀번호",
      adminSignedOut: "로그아웃됨. 관리자 삭제 버튼은 숨겨져 있습니다.",
      boardEmpty: "게시물을 불러오는 중..."
    },
    en: {
      loading: "Loading posts and comments from Supabase...",
      notReady: "The board is not ready yet. Finish the latest Supabase SQL setup first.",
      loadPostsFailed: "Failed to load posts.",
      loadCommentsFailed: "Failed to load comments.",
      connected: "Connected. Posts, comments, and auth status are synced.",
      adminCredentialsRequired: "Admin email and password are required.",
      authSigningIn: "Signing in to Supabase Auth...",
      signInFailed: "Failed to sign in.",
      adminSessionActive: "Admin session active.",
      adminAllowlistMissing: "Signed in, but this account is not in private.board_admins yet.",
      signingOut: "Signing out...",
      signOutFailed: "Failed to sign out.",
      signedOut: "Signed out.",
      postRequired: "Name, title, message, and delete password are required.",
      postPublishing: "Publishing the new post...",
      postPublishFailed: "Failed to publish the post.",
      postPublished: "Post published.",
      commentRequired: "Comment name and content are required.",
      commentPublishing: "Publishing the comment...",
      commentPublishFailed: "Failed to publish the comment.",
      commentAdded: "Comment added.",
      deletePasswordRequired: "Enter the delete password first.",
      deleteConfirm: "Delete this post and its comments?",
      deletingPost: "Deleting the post...",
      deletePostFailed: "Failed to delete the post.",
      deletePasswordMismatch: "Delete password did not match, or the post was already removed.",
      postDeleted: "Post deleted.",
      adminRequired: "Admin access is required for this action.",
      adminDeleteConfirm: "Admin delete this post and all of its comments?",
      adminDeleting: "Admin delete in progress...",
      adminDeleteFailed: "Failed to delete the post as admin.",
      adminDeleted: "Post deleted as admin.",
      missingSchema: "Run the updated supabase/setup-board.sql again. This feature needs the latest tables and RPC functions.",
      permissionDenied: "Supabase blocked this request. Check the updated grants, RLS policies, and admin allowlist.",
      checkAdminFailed: "Failed to check admin session.",
      guest: "Guest",
      admin: "Admin",
      user: "User",
      publishPost: "Publish post",
      publishing: "Publishing...",
      refreshPosts: "Refresh posts",
      refreshing: "Refreshing...",
      signIn: "Sign in",
      signingIn: "Signing in...",
      signOut: "Sign out",
      signingOut: "Signing out...",
      addComment: "Add comment",
      posting: "Posting...",
      deleteWithPassword: "Delete with password",
      deleting: "Deleting...",
      deleteAsAdmin: "Delete as admin",
      noComments: "No comments yet.",
      noPosts: "No posts yet. Be the first to write one.",
      commentsTitle: "Comments",
      commentName: "Comment name",
      action: "Action",
      comment: "Comment",
      deletePassword: "Delete password",
      adminSignedOut: "Signed out. Admin delete controls are hidden.",
      boardEmpty: "Loading posts..."
    }
  }[language];

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

  function formatDate(date, options) {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  function setUpdatedTimestamp(date) {
    updatedElement.textContent = formatDate(date, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function setComposerBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? messages.publishing : messages.publishPost;
  }

  function setRefreshBusy(isBusy) {
    refreshButton.disabled = isBusy;
    refreshButton.textContent = isBusy ? messages.refreshing : messages.refreshPosts;
  }

  function setAdminBusy(isBusy) {
    if (!adminLoginButton) {
      return;
    }

    adminLoginButton.disabled = isBusy;
    adminLoginButton.textContent = isBusy ? messages.signingIn : messages.signIn;
  }

  function setLogoutBusy(isBusy) {
    if (!adminLogoutButton) {
      return;
    }

    adminLogoutButton.disabled = isBusy;
    adminLogoutButton.textContent = isBusy ? messages.signingOut : messages.signOut;
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

  function formatCommentCount(count) {
    return language === "ko"
      ? "댓글 " + count + "개"
      : count + " comment" + (count === 1 ? "" : "s");
  }

  function setSessionStateLabel() {
    if (!state.sessionEmail) {
      sessionStateElement.textContent = messages.guest;
      return;
    }

    sessionStateElement.textContent = state.isAdmin ? messages.admin : messages.user;
  }

  function renderAdminSession() {
    if (!adminSessionElement || !adminLoginForm || !adminLogoutButton) {
      return;
    }

    adminSessionElement.innerHTML = "";

    const message = document.createElement("p");
    message.className = "board-empty";

    if (!state.sessionEmail) {
      message.textContent = messages.adminSignedOut;
      adminLoginForm.classList.remove("is-hidden");
      adminLogoutButton.classList.add("is-hidden");
    } else if (state.isAdmin) {
      message.textContent =
        language === "ko"
          ? state.sessionEmail + " 계정으로 로그인되었습니다. 모든 게시물에 관리자 삭제 버튼이 활성화됩니다."
          : "Signed in as " + state.sessionEmail + ". Admin delete controls are enabled for every post.";
      adminLoginForm.classList.add("is-hidden");
      adminLogoutButton.classList.remove("is-hidden");
    } else {
      message.textContent =
        language === "ko"
          ? state.sessionEmail + " 계정으로 로그인되었지만 아직 private.board_admins 허용 목록에는 없습니다."
          : "Signed in as " + state.sessionEmail + ", but this account is not listed in private.board_admins yet.";
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
      wrapper.appendChild(createEmptyState(messages.noComments));
      return wrapper;
    }

    comments.forEach(function (comment) {
      const article = document.createElement("article");
      article.className = "board-comment";

      const meta = document.createElement("p");
      meta.className = "board-comment-meta";
      meta.textContent =
        comment.name +
        " - " +
        formatDate(new Date(comment.created_at), {
          dateStyle: "medium",
          timeStyle: "short"
        });

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
      '<span class="field-label">' +
      messages.commentName +
      "</span>" +
      '<input class="field-input" name="comment_name" type="text" maxlength="40" required>';

    const actionLabel = document.createElement("div");
    actionLabel.className = "field";
    actionLabel.innerHTML =
      '<span class="field-label">' +
      messages.action +
      "</span>" +
      '<button class="button button-secondary" type="submit" data-role="comment-submit">' +
      messages.addComment +
      "</button>";

    grid.appendChild(nameLabel);
    grid.appendChild(actionLabel);

    const contentLabel = document.createElement("label");
    contentLabel.className = "field";
    contentLabel.innerHTML =
      '<span class="field-label">' +
      messages.comment +
      "</span>" +
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
      '<input class="field-input board-inline-input" name="delete_password" type="password" minlength="4" maxlength="72" placeholder="' +
      messages.deletePassword +
      '" required>' +
      '<button class="button button-secondary" type="submit" data-role="delete-submit">' +
      messages.deleteWithPassword +
      "</button>";
    return formElement;
  }

  function renderPosts() {
    postsContainer.innerHTML = "";

    if (!state.posts.length) {
      postsContainer.appendChild(createEmptyState(messages.noPosts));
      countElement.textContent = "0";
      commentCountElement.textContent = "0";
      return;
    }

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
      meta.textContent =
        post.name +
        " - " +
        formatDate(new Date(post.created_at), {
          dateStyle: "medium",
          timeStyle: "short"
        });

      const body = document.createElement("p");
      body.className = "board-post-body";
      body.textContent = post.content;

      const toolbar = document.createElement("div");
      toolbar.className = "board-post-toolbar";

      const note = document.createElement("p");
      note.className = "board-post-note";
      note.textContent = formatCommentCount(comments.length);

      const actionWrap = document.createElement("div");
      actionWrap.className = "board-post-actions";
      actionWrap.appendChild(createDeleteForm(post.id));

      if (state.isAdmin) {
        const adminButton = document.createElement("button");
        adminButton.className = "button button-danger";
        adminButton.type = "button";
        adminButton.dataset.action = "admin-delete";
        adminButton.dataset.postId = String(post.id);
        adminButton.textContent = messages.deleteAsAdmin;
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
      commentsTitle.textContent = messages.commentsTitle;

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
      return messages.missingSchema;
    }

    if (
      message.indexOf("row-level security") !== -1 ||
      message.indexOf("permission denied") !== -1
    ) {
      return messages.permissionDenied;
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
        setStatus(explainError(adminResult.error, messages.checkAdminFailed), "error");
      } else {
        state.isAdmin = Boolean(adminResult.data);
      }
    }

    renderAdminSession();
    renderPosts();
  }

  async function loadPosts() {
    setRefreshBusy(true);
    setStatus(messages.loading, "loading");

    const result = await supabase
      .from(POST_TABLE)
      .select("id, name, title, content, created_at")
      .order("created_at", { ascending: false })
      .limit(POST_LIMIT);

    if (result.error) {
      setRefreshBusy(false);
      postsContainer.innerHTML = "";
      postsContainer.appendChild(createEmptyState(messages.notReady));
      countElement.textContent = "0";
      commentCountElement.textContent = "0";
      updatedElement.textContent = "-";
      setStatus(explainError(result.error, messages.loadPostsFailed), "error");
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
        setStatus(explainError(commentResult.error, messages.loadCommentsFailed), "error");
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
    setStatus(messages.connected, "success");
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
      setStatus(messages.adminCredentialsRequired, "error");
      return;
    }

    setAdminBusy(true);
    setStatus(messages.authSigningIn, "loading");

    const result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    setAdminBusy(false);

    if (result.error) {
      setStatus(explainError(result.error, messages.signInFailed), "error");
      return;
    }

    adminLoginForm.reset();
    await syncAdminSession();
    setStatus(state.isAdmin ? messages.adminSessionActive : messages.adminAllowlistMissing, state.isAdmin ? "success" : "error");
  }

  async function handleAdminLogout() {
    setLogoutBusy(true);
    setStatus(messages.signingOut, "loading");

    const result = await supabase.auth.signOut();

    setLogoutBusy(false);

    if (result.error) {
      setStatus(explainError(result.error, messages.signOutFailed), "error");
      return;
    }

    await syncAdminSession();
    setStatus(messages.signedOut, "success");
  }

  async function handlePostSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const name = normalizeText(formData.get("name"));
    const title = normalizeText(formData.get("title"));
    const content = normalizeText(formData.get("content"));
    const deletePassword = String(formData.get("delete_password") || "");

    if (!name || !title || !content || !deletePassword) {
      setStatus(messages.postRequired, "error");
      return;
    }

    setComposerBusy(true);
    setStatus(messages.postPublishing, "loading");

    const result = await supabase.rpc("create_board_post", {
      p_name: name,
      p_title: title,
      p_content: content,
      p_delete_password: deletePassword
    });

    setComposerBusy(false);

    if (result.error) {
      setStatus(explainError(result.error, messages.postPublishFailed), "error");
      return;
    }

    form.reset();
    setStatus(messages.postPublished, "success");
    await loadPosts();
  }

  async function handleCommentSubmit(formElement) {
    const postId = Number(formElement.dataset.postId || "0");
    const formData = new FormData(formElement);
    const name = normalizeText(formData.get("comment_name"));
    const content = normalizeText(formData.get("comment_content"));
    const button = formElement.querySelector('[data-role="comment-submit"]');

    if (!postId || !name || !content) {
      setStatus(messages.commentRequired, "error");
      return;
    }

    setInlineBusy(button, true, messages.addComment, messages.posting);
    setStatus(messages.commentPublishing, "loading");

    const result = await supabase.rpc("create_board_comment", {
      p_post_id: postId,
      p_name: name,
      p_content: content
    });

    setInlineBusy(button, false, messages.addComment, messages.posting);

    if (result.error) {
      setStatus(explainError(result.error, messages.commentPublishFailed), "error");
      return;
    }

    formElement.reset();
    setStatus(messages.commentAdded, "success");
    await loadPosts();
  }

  async function handleDeleteSubmit(formElement) {
    const postId = Number(formElement.dataset.postId || "0");
    const formData = new FormData(formElement);
    const deletePassword = String(formData.get("delete_password") || "");
    const button = formElement.querySelector('[data-role="delete-submit"]');

    if (!postId || !deletePassword) {
      setStatus(messages.deletePasswordRequired, "error");
      return;
    }

    if (!window.confirm(messages.deleteConfirm)) {
      return;
    }

    setInlineBusy(button, true, messages.deleteWithPassword, messages.deleting);
    setStatus(messages.deletingPost, "loading");

    const result = await supabase.rpc("delete_board_post_with_password", {
      p_post_id: postId,
      p_delete_password: deletePassword
    });

    setInlineBusy(button, false, messages.deleteWithPassword, messages.deleting);

    if (result.error) {
      setStatus(explainError(result.error, messages.deletePostFailed), "error");
      return;
    }

    if (!result.data) {
      setStatus(messages.deletePasswordMismatch, "error");
      return;
    }

    setStatus(messages.postDeleted, "success");
    await loadPosts();
  }

  async function handleAdminDelete(button) {
    if (!state.isAdmin) {
      setStatus(messages.adminRequired, "error");
      return;
    }

    const postId = Number(button.dataset.postId || "0");

    if (!postId) {
      return;
    }

    if (!window.confirm(messages.adminDeleteConfirm)) {
      return;
    }

    setInlineBusy(button, true, messages.deleteAsAdmin, messages.deleting);
    setStatus(messages.adminDeleting, "loading");

    const result = await supabase
      .from(POST_TABLE)
      .delete()
      .eq("id", postId);

    setInlineBusy(button, false, messages.deleteAsAdmin, messages.deleting);

    if (result.error) {
      setStatus(explainError(result.error, messages.adminDeleteFailed), "error");
      return;
    }

    setStatus(messages.adminDeleted, "success");
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

  postsContainer.innerHTML = '<p class="board-empty">' + messages.boardEmpty + "</p>";
  Promise.all([syncAdminSession(), loadPosts()]);
})();
