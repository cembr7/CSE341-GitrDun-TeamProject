// public/app.js
// Frontend logic for Lists + Tasks CRUD

function qs(sel) {
  return document.querySelector(sel);
}

function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // If user is not logged in, most API routes return 401
  if (res.status === 401) {
    // Send them back to the login page
    window.location.href = "/";
    return;
  }

  // Try to parse json (even for errors)
  let body = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text || null;
  }

  if (!res.ok) {
    const msg =
      (body && body.message) ||
      (body && body.error && body.message) ||
      (typeof body === "string" && body) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.style.display = "block";
}

function hideError(el) {
  if (!el) return;
  el.textContent = "";
  el.style.display = "none";
}

function formatDate(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function mountLogin() {
  const loginBtn = qs("#login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "/auth/google";
    });
  }
}

function mountLogout() {
  const logoutBtn = qs("#logout-btn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", () => {
    window.location.href = "/logout";
  });
}

async function mountDashboard() {
  const listDiv = qs("#list");
  if (!listDiv) return;

  const emptyEl = qs("#emptyLists");
  listDiv.innerHTML = "";

  const lists = await apiFetch("/api/lists", { method: "GET" });

  if (!Array.isArray(lists) || lists.length === 0) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";

  lists.forEach((list) => {
    const card = document.createElement("div");
    card.className = "list-card";

    const title = document.createElement("h4");
    title.textContent = list.name || "(untitled)";

    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = list.description ? list.description : "";

    const actions = document.createElement("div");
    actions.className = "button-container";

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.addEventListener("click", () => {
      window.location.href = `list.html?listId=${encodeURIComponent(list._id)}`;
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      window.location.href = `create-list.html?id=${encodeURIComponent(list._id)}`;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete list "${list.name}"? This will not delete tasks automatically unless your API does.`)) {
        return;
      }
      try {
        await apiFetch(`/api/lists/${list._id}`, { method: "DELETE" });
        card.remove();
        if (listDiv.children.length === 0 && emptyEl) emptyEl.style.display = "block";
      } catch (e) {
        alert(e.message);
      }
    });

    actions.appendChild(viewBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);
    listDiv.appendChild(card);
  });
}

async function mountListPage() {
  const taskDiv = qs("#task");
  const listNameEl = qs("#listName");
  const pageErr = qs("#pageError");
  if (!taskDiv || !listNameEl) return;

  const listId = getParam("listId");
  if (!listId) {
    showError(pageErr, "Missing listId in URL. Go back to Dashboard and open a list again.");
    return;
  }

  // Header actions
  const createTaskBtn = qs("#createTask");
  if (createTaskBtn) {
    createTaskBtn.addEventListener("click", () => {
      window.location.href = `create-task.html?listId=${encodeURIComponent(listId)}`;
    });
  }

  const editListBtn = qs("#editListBtn");
  if (editListBtn) {
    editListBtn.addEventListener("click", () => {
      window.location.href = `create-list.html?id=${encodeURIComponent(listId)}`;
    });
  }

  const deleteListBtn = qs("#deleteListBtn");
  if (deleteListBtn) {
    deleteListBtn.addEventListener("click", async () => {
      if (!confirm("Delete this list?")) return;
      try {
        await apiFetch(`/api/lists/${listId}`, { method: "DELETE" });
        window.location.href = "dashboard.html";
      } catch (e) {
        showError(pageErr, e.message);
      }
    });
  }

  // Load list details
  const list = await apiFetch(`/api/lists/${listId}`, { method: "GET" });
  listNameEl.textContent = list?.name || "List";

  // Load tasks for this list
  taskDiv.innerHTML = "";
  const emptyTasksEl = qs("#emptyTasks");

  const tasks = await apiFetch(`/api/tasks?listId=${encodeURIComponent(listId)}`, {
    method: "GET",
  });

  if (!Array.isArray(tasks) || tasks.length === 0) {
    if (emptyTasksEl) emptyTasksEl.style.display = "block";
    return;
  }
  if (emptyTasksEl) emptyTasksEl.style.display = "none";

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";

    const title = document.createElement("h4");
    title.textContent = task.name || "(untitled)";

    const meta = document.createElement("p");
    meta.className = "muted";
    const bits = [];
    if (task.status) bits.push(`Status: ${task.status}`);
    if (task.priority) bits.push(`Priority: ${task.priority}`);
    if (task.dueDate) bits.push(`Due: ${formatDate(task.dueDate)}`);
    meta.textContent = bits.join(" • ");

    const desc = document.createElement("p");
    desc.textContent = task.description || "";

    const actions = document.createElement("div");
    actions.className = "button-container";

    const doneBtn = document.createElement("button");
    doneBtn.textContent = task.status === "done" ? "Mark Not Done" : "Mark Done";
    doneBtn.addEventListener("click", async () => {
      try {
        const newStatus = task.status === "done" ? "inbox" : "done";
        const updated = await apiFetch(`/api/tasks/${task._id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        });
        task.status = updated.status;
        meta.textContent = [
          `Status: ${task.status}`,
          task.priority ? `Priority: ${task.priority}` : null,
          task.dueDate ? `Due: ${formatDate(task.dueDate)}` : null,
        ]
          .filter(Boolean)
          .join(" • ");
        doneBtn.textContent = task.status === "done" ? "Mark Not Done" : "Mark Done";
      } catch (e) {
        alert(e.message);
      }
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      window.location.href = `create-task.html?id=${encodeURIComponent(task._id)}&listId=${encodeURIComponent(listId)}`;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete task "${task.name}"?`)) return;
      try {
        await apiFetch(`/api/tasks/${task._id}`, { method: "DELETE" });
        card.remove();
        if (taskDiv.children.length === 0 && emptyTasksEl) emptyTasksEl.style.display = "block";
      } catch (e) {
        alert(e.message);
      }
    });

    actions.appendChild(doneBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(meta);
    if (task.description) card.appendChild(desc);
    card.appendChild(actions);
    taskDiv.appendChild(card);
  });
}

async function mountCreateEditList() {
  const form = qs("#listForm");
  if (!form) return;

  const pageTitle = qs("#pageTitle");
  const errEl = qs("#formError");
  const submitBtn = qs("#submitBtn");
  const idField = qs("#listId");

  const id = getParam("id");
  if (id) {
    pageTitle.textContent = "Edit List";
    submitBtn.textContent = "Save Changes";
    idField.value = id;
    try {
      const list = await apiFetch(`/api/lists/${id}`, { method: "GET" });
      qs("#name").value = list?.name || "";
      qs("#description").value = list?.description || "";
    } catch (e) {
      showError(errEl, e.message);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError(errEl);

    const payload = {
      name: qs("#name").value.trim(),
      description: qs("#description").value.trim(),
    };

    try {
      if (id) {
        await apiFetch(`/api/lists/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/lists", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      window.location.href = "dashboard.html";
    } catch (e) {
      showError(errEl, e.message);
    }
  });
}

async function mountCreateEditTask() {
  const form = qs("#taskForm");
  if (!form) return;

  const pageTitle = qs("#pageTitle");
  const errEl = qs("#formError");
  const submitBtn = qs("#submitBtn");
  const taskIdField = qs("#taskId");
  const listSelect = qs("#listId");

  // Populate lists dropdown
  async function loadListsIntoSelect(selectedId) {
    const lists = await apiFetch("/api/lists", { method: "GET" });
    listSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a list";
    listSelect.appendChild(placeholder);

    (lists || []).forEach((l) => {
      const opt = document.createElement("option");
      opt.value = l._id;
      opt.textContent = l.name || "(untitled)";
      if (selectedId && String(selectedId) === String(l._id)) opt.selected = true;
      listSelect.appendChild(opt);
    });
  }

  const id = getParam("id");
  const listIdFromUrl = getParam("listId");

  try {
    await loadListsIntoSelect(listIdFromUrl || null);
  } catch (e) {
    showError(errEl, e.message);
  }

  if (id) {
    pageTitle.textContent = "Edit Task";
    submitBtn.textContent = "Save Changes";
    taskIdField.value = id;
    try {
      const task = await apiFetch(`/api/tasks/${id}`, { method: "GET" });
      qs("#name").value = task?.name || "";
      qs("#description").value = task?.description || "";
      qs("#priority").value = task?.priority || "low";
      qs("#status").value = task?.status || "inbox";
      if (task?.dueDate) {
        const d = new Date(task.dueDate);
        // Format yyyy-mm-dd for input
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        qs("#dueDate").value = `${yyyy}-${mm}-${dd}`;
      }
      await loadListsIntoSelect(task?.listId || listIdFromUrl || null);
    } catch (e) {
      showError(errEl, e.message);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError(errEl);

    const payload = {
      name: qs("#name").value.trim(),
      description: qs("#description").value.trim(),
      listId: qs("#listId").value,
      priority: qs("#priority").value,
      status: qs("#status").value,
    };
    const due = qs("#dueDate").value;
    if (due) payload.dueDate = due;

    if (!payload.listId) {
      showError(errEl, "Please choose a list.");
      return;
    }

    try {
      if (id) {
        await apiFetch(`/api/tasks/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/tasks", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      // If we came from a list page, go back there
      const targetList = listIdFromUrl || payload.listId;
      window.location.href = targetList
        ? `list.html?listId=${encodeURIComponent(targetList)}`
        : "dashboard.html";
    } catch (e) {
      showError(errEl, e.message);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    mountLogin();
    mountLogout();

    // Page mounts (safe to call; they no-op if elements aren't present)
    await mountDashboard();
    await mountListPage();
    await mountCreateEditList();
    await mountCreateEditTask();
  } catch (e) {
    const errEl = qs("#pageError") || qs("#formError");
    if (errEl) showError(errEl, e.message);
    else console.error(e);
  }
});
