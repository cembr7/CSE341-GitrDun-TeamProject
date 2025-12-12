const loginBtn = document.getElementById("login-btn");

if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    window.location.href = "/auth/google";
  });
}

// Create list and task links
const listBtn = document.getElementById("createList");
const taskBtn = document.getElementById("createTask");

listBtn.addEventListener("click", function () {
  window.location.href = "/create-list.html";
});

taskBtn.addEventListener("click", function () {
  window.location.href = "/create-task.html";
});

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

// Api docs btn
const apiBtn = document.getElementById("api");

apiBtn.addEventListener("click", function () {
  window.location.href = "/api-docs";
});

// Connect to backend (database)
async function loadLists() {
  const response = await fetch(); //fill with appropriate route
  const lists = await response.json();

  const listDiv = querySelector("#list");
  lists.forEach((list) => {
    const div = document.createElement("div");
    const title = document.createElement("h4");
    //const tasks = document.createElement("p");
    const edit = document.createElement("button");
    const view = document.createElement("button");

    title.innerHTML = list.name;
    edit.textContent = "Edit";
    view.textContent = "View";

    div.appendChild(title);
    div.appendChild(edit);
    div.appendChild(view);
  });
}
