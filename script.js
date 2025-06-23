
document.addEventListener("DOMContentLoaded", () => {
  let currentIndex = 0;
  let score = 0;
  let selectedQuestions = [];
  let userAnswers = {};
  let flaggedQuestions = new Set();
  let quizSubmitted = false;
  let timeLeft = 1800;
  let timerInterval;

  window.startQuiz = function () {
    const username = document.getElementById("username").value.trim();
    if (!username) return alert("Please enter your name");
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    document.getElementById("timer").style.display = "block";

    if (!window.questions || !Array.isArray(window.questions)) {
      alert("Questions not loaded.");
      return;
    }

    selectedQuestions = shuffle(window.questions).slice(0, 30);
    showQuestion();
    startTimer();
  };

  function startTimer() {
    const timerDisplay = document.getElementById("timer");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        alert("Time is up! Submitting your quiz.");
        submitQuiz();
      } else {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        timeLeft--;
      }
    }, 1000);
  }

  function showQuestion() {
    if (quizSubmitted || currentIndex >= selectedQuestions.length) return;
    const q = selectedQuestions[currentIndex];
    const savedAnswer = userAnswers[q.id] || "";
    let html = `<div class="question"><h3>Frage ${currentIndex + 1} von 30</h3>`;
    html += `<p>${q.text}</p>`;
    if (q.image) html += `<img src="${q.image}" alt="Fragebild" style="max-width:100%;height:auto;"><br>`;
    html += `<div class="options">`;
    for (const opt of q.options) {
      const checked = savedAnswer === opt.label ? "checked" : "";
      html += `<label><input type="radio" name="q${currentIndex}" value="${opt.label}" ${checked}> ${opt.label}: ${opt.text}</label>`;
    }
    html += `</div><div class="nav-buttons">`;
    if (currentIndex > 0) html += `<button onclick="goBack()">Back</button>`;
    html += `<button onclick="toggleFlag()">Flag</button>`;
    html += `<button onclick="goToReview()">Review Answers</button>`;
    html += `<button onclick="submitAnswer()">Next</button>`;
    html += `<button onclick="confirmSubmit()">Submit</button>`;
    html += `</div></div>`;
    document.getElementById("quiz-container").innerHTML = html;
  }

  window.submitAnswer = function () {
    const radios = document.getElementsByName("q" + currentIndex);
    let selected = null;
    for (const r of radios) if (r.checked) selected = r.value;
    if (selected) userAnswers[selectedQuestions[currentIndex].id] = selected;
    currentIndex++;
    if (currentIndex < selectedQuestions.length) {
      showQuestion();
    } else {
      goToReview();
    }
  };

  window.goBack = function () {
    if (currentIndex > 0) {
      currentIndex--;
      showQuestion();
    }
  };

  window.toggleFlag = function () {
    const qid = selectedQuestions[currentIndex].id;
    if (flaggedQuestions.has(qid)) flaggedQuestions.delete(qid);
    else flaggedQuestions.add(qid);
    alert("Question " + (currentIndex + 1) + (flaggedQuestions.has(qid) ? " flagged." : " unflagged."));
  };

  window.goToReview = function () {
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("result-screen").style.display = "block";
    showReviewScreen();
  };

  function showReviewScreen() {
    let html = `<h2>Review Answers</h2><div class="review-nav">`;
    selectedQuestions.forEach((q, idx) => {
      const flagged = flaggedQuestions.has(q.id);
      const userAns = userAnswers[q.id] || "-";
      html += `<button onclick="jumpTo(${idx})" style="${flagged ? 'background-color: yellow;' : ''}">Q${idx + 1} (${userAns})</button> `;
    });
    html += `</div><br><button onclick="confirmSubmit()">Submit Quiz</button>`;
    document.getElementById("result-screen").innerHTML = html;
  }

  window.jumpTo = function (index) {
    currentIndex = index;
    document.getElementById("result-screen").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    showQuestion();
  };

  window.confirmSubmit = function () {
    if (confirm("Are you sure you want to submit the quiz? You will not be able to go back.")) {
      submitQuiz();
    }
  };

  function submitQuiz() {
    quizSubmitted = true;
    clearInterval(timerInterval);
    document.getElementById("quiz-container").style.display = "none";
    let finalScore = calculateScore();
    let html = `<h2>Quiz Completed</h2><p>Your score: ${finalScore} / 30</p>`;
    html += `<h3>Review of All Questions:</h3><ul style="list-style:none;padding-left:0;">`;

    selectedQuestions.forEach((q, idx) => {
      const userAns = userAnswers[q.id];
      const correctAns = correctAnswers[q.id];
      html += `<li><strong>Q${idx + 1}:</strong> ${q.text}<br>`;
      if (q.image) {
        html += `<img src="${q.image}" alt="Bild" style="max-width:100%;height:auto;"><br>`;
      }
      html += `<ul>`;
      q.options.forEach(opt => {
        let color = "";
        if (userAns === opt.label && opt.label === correctAns) {
          color = "green";
        } else if (userAns === opt.label && opt.label !== correctAns) {
          color = "red";
        } else if (userAns !== opt.label && opt.label === correctAns) {
          color = "green";
        }
        html += `<li style="color:${color}">${opt.label}: ${opt.text}</li>`;
      });
      html += `</ul></li><br>`;
    });

    html += `</ul><p>Thank you for completing the quiz.</p>`;
    document.getElementById("result-screen").innerHTML = html;
  }

  function calculateScore() {
    let s = 0;
    selectedQuestions.forEach(q => {
      if (userAnswers[q.id] && typeof correctAnswers !== "undefined" && correctAnswers[q.id] === userAnswers[q.id]) {
        s++;
      }
    });
    return s;
  }

  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }
});
