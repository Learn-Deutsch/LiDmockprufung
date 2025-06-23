
const ADMIN_PASSWORD = "secure123"; // Change this in production

function adminLogin() {
  const input = document.getElementById("admin-password").value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    renderQuestions();
  } else {
    alert("Incorrect password");
  }
}

function renderQuestions() {
  const container = document.getElementById("question-list");
  container.innerHTML = "";
  for (const q of questions) {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `
      <p><strong>${q.id}:</strong> ${q.text}</p>
      ${q.image ? `<img src="${q.image}" alt="">` : ""}
      ${q.options.map(opt => `
        <label>
          <input type="radio" name="q_${q.id}" value="${opt.label}"
            ${getSavedAnswer(q.id) === opt.label ? "checked" : ""}>
          ${opt.label}: ${opt.text}
        </label>
      `).join("")}
      <hr/>
    `;
    container.appendChild(div);
  }
}

function getSavedAnswer(qid) {
  const saved = JSON.parse(localStorage.getItem("correctAnswers") || "{}");
  return saved[qid] || null;
}

function saveAnswers() {
  const answers = {};
  for (const q of questions) {
    const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
    if (selected) answers[q.id] = selected.value;
  }
  localStorage.setItem("correctAnswers", JSON.stringify(answers));
  alert("Answers saved successfully!");
}
