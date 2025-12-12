const loginBtn = document.getElementById("login-btn");

if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    window.location.href = "/auth/google";
  });
}

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
