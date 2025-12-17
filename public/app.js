const loginBtn = document.getElementById("login-btn");

if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    window.location.href = "/auth/google";
  });
}

// Create list and task links
// const listBtn = document.getElementById("createList");
// const taskBtn = document.getElementById("createTask");

// listBtn.addEventListener("click", function () {
//   window.location.href = "/create-list.html";
// });

// taskBtn.addEventListener("click", function () {
//   window.location.href = "/create-task.html";
// });

// Handle repeat radio button changes to show/hide frequency form
const repeatYes = document.getElementById("repeat-yes");
const repeatNo = document.getElementById("repeat-no");
const frequencyGroup = document.getElementById("frequency-group");

const frequency = document.getElementById("frequency");
const none = {
  value: "none",
  text: "None",
};

function addNone() {
  if (!frequency.querySelector(`option[value="${none.value}"]`)) {
    const option = document.createElement("option");
    option.value = none.value;
    option.textContent = none.text;
    frequency.appendChild(option);
    frequency.value = option.value;
  }
}

function removeNone() {
  const noneExists = frequency.querySelector(`option[value="${none.value}"]`);
  if (noneExists) {
    noneExists.remove();
  }
}

if (repeatYes && repeatNo && frequencyGroup) {
  function toggleFrequency() {
    if (repeatYes.checked) {
      frequencyGroup.style.display = "block";
      frequency.disabled = false;
      removeNone();
    }
    if (repeatNo.checked) {
      frequencyGroup.style.display = "block";
      frequency.disabled = true;
      addNone();
    }
  }

  repeatYes.addEventListener("change", toggleFrequency);
  repeatNo.addEventListener("change", toggleFrequency);
}

// Handle task creation form submission
const taskForm = document.querySelector("form");

if (taskForm) {
  taskForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(taskForm);
    const data = Object.fromEntries(formData);
    await fetch("/api/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    window.location.href = "/dashboard.html";
  });
}

// Handle task creation form submission
const listForm = document.querySelector("form");

if (listForm) {
  listForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(listForm);
    const data = Object.fromEntries(formData);
    await fetch("/api/lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    window.location.href = "/dashboard.html";
  });
}

// Api docs btn
// const apiBtn = document.getElementById("api");

// apiBtn.addEventListener("click", function () {
//   window.location.href = "/api-docs";
// });

// Connect to backend (database)
function loadLists() {
  document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/api/lists");

    if (!response.ok) {
      throw new Error("Network error");
    }

    const lists = await response.json();
    return lists;
  });
}

const listData = loadLists();
const listDiv = document.getElementById("list");

listData.forEach((list) => {
  const div = document.createElement("div");
  const h4 = document.createElement("h4");
  const editBtn = document.createElement("button");
  const viewBtn = document.createElement("button");

  h4.textContent = list.title;
  editBtn.textContent = "Edit";
  viewBtn.textContent = "View";

  editBtn.setAttribute("class", "edit-list");
  viewBtn.setAttribute("class", "view-list");

  div.appendChild(h4);
  div.appendChild(editBtn);
  div.appendChild(viewBtn);

  listDiv.appendChild(div);
});

const editList = document.querySelector("#edit-list");
const viewList = document.querySelector("#view-list");

if (editList) {
  editList.addEventListener("click", function () {
    window.location.href = "/create-list.html";
  });
}

if (viewList) {
  viewList.addEventListener("click", function () {
    window.location.href = "/list.html";
  });
}

function loadTasks() {
  document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
      throw new Error("Network error");
    }

    const tasks = await response.json();
    return tasks;
  });
}

const taskData = loadTasks();
const taskDiv = document.getElementById("task");

taskData.forEach((task) => {
  const div = document.createElement("div");
  const h4 = document.createElement("h4");
  const editBtn = document.createElement("button");

  h4.textContent = task.title;
  editBtn.textContent = "Edit";

  editBtn.setAttribute("class", "edit-task");

  div.appendChild(h4);
  div.appendChild(editBtn);

  taskDiv.appendChild(div);
});

const editTask = document.querySelector("#edit-task");

if (editTask) {
  editList.addEventListener("click", function () {
    window.location.href = "/create-task.html";
  });
}
