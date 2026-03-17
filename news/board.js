(function () {
  const SUPABASE_URL = "https://uisuogutyhjnmgbgbdjs.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc3VvZ3V0eWhqbm1nYmdiZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODkxNTUsImV4cCI6MjA4OTI2NTE1NX0.xvJTiHzpAq3gTs0HnVIvIiRD947uuvUdS-sY18axOJg";
  const TABLE_NAME = "board_posts";
  const POST_LIMIT = 30;

  const form = document.getElementById("board-form");
  const submitButton = document.getElementById("board-submit");
  const refreshButton = document.getElementById("refresh-board");
  const postsContainer = document.getElementById("board-posts");
  const countElement = document.getElementById("board-count");
  const updatedElement = document.getElementById("board-updated");
  const statusElement = document.getElementById("board-status");

  if (!window.supabase || !form || !submitButton || !refreshButton || !postsContainer) {
    return;
  }

  const { createClient } = window.supabase;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

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

  function createEmptyState(message) {
    const empty = document.createElement("p");
    empty.className = "board-empty";
    empty.textContent = message;
    return empty;
  }

  function renderPosts(posts) {
    postsContainer.innerHTML = "";

    if (!posts.length) {
      postsContainer.appendChild(createEmptyState("No posts yet. Be the first to write one."));
      countElement.textContent = "0";
      return;
    }

    const formatter = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    posts.forEach(function (post) {
      const article = document.createElement("article");
      article.className = "board-post";

      const head = document.createElement("div");
      head.className = "board-post-head";

      const title = document.createElement("h3");
      title.className = "board-post-title";
      title.textContent = post.title;

      const meta = document.createElement("p");
      meta.className = "board-post-meta";
      meta.textContent = post.name + " · " + formatter.format(new Date(post.created_at));

      const body = document.createElement("p");
      body.className = "board-post-body";
      body.textContent = post.content;

      head.appendChild(title);
      head.appendChild(meta);
      article.appendChild(head);
      article.appendChild(body);
      postsContainer.appendChild(article);
    });

    countElement.textContent = String(posts.length);
  }

  function explainError(error, fallbackMessage) {
    const message = error && error.message ? error.message : fallbackMessage;

    if (message.indexOf("Could not find the table") !== -1) {
      return "Supabase table board_posts is missing. Run supabase/setup-board.sql in the SQL Editor.";
    }

    if (
      message.indexOf("row-level security") !== -1 ||
      message.indexOf("permission denied") !== -1
    ) {
      return "Supabase blocked this request. Check the public SELECT and INSERT policies.";
    }

    return message;
  }

  async function loadPosts() {
    setRefreshBusy(true);
    setStatus("Loading posts from Supabase...", "loading");

    const result = await supabase
      .from(TABLE_NAME)
      .select("id, name, title, content, created_at")
      .order("created_at", { ascending: false })
      .limit(POST_LIMIT);

    setRefreshBusy(false);

    if (result.error) {
      postsContainer.innerHTML = "";
      postsContainer.appendChild(
        createEmptyState("The board is not ready yet. Finish the Supabase SQL setup first.")
      );
      countElement.textContent = "0";
      updatedElement.textContent = "-";
      setStatus(explainError(result.error, "Failed to load posts."), "error");
      return;
    }

    renderPosts(result.data || []);
    setUpdatedTimestamp(new Date());
    setStatus("Connected. Posts are loading from Supabase successfully.", "success");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "").trim();

    if (!name || !title || !content) {
      setStatus("Name, title, and message are required.", "error");
      return;
    }

    setComposerBusy(true);
    setStatus("Publishing the new post...", "loading");

    const result = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          name: name,
          title: title,
          content: content
        }
      ])
      .select("id")
      .single();

    setComposerBusy(false);

    if (result.error) {
      setStatus(explainError(result.error, "Failed to publish the post."), "error");
      return;
    }

    form.reset();
    setStatus("Post published.", "success");
    await loadPosts();
  }

  refreshButton.addEventListener("click", function () {
    loadPosts();
  });

  form.addEventListener("submit", handleSubmit);
  loadPosts();
})();
