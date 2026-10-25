
const $ = id => document.getElementById(id);

const sections = ["registration", "game", "quiz", "results"];

function showSection(id) {
  sections.forEach(section => $(section).classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const items = [
  { name: "Banana Peel", emoji: "🍌", bin: "green" },
  { name: "Newspaper", emoji: "📰", bin: "blue" },
  { name: "Plastic Bottle", emoji: "🧴", bin: "blue" },
  { name: "Vegetable Peels", emoji: "🥕", bin: "green" },
  { name: "Cardboard Box", emoji: "📦", bin: "blue" },
  { name: "Leftover Food", emoji: "🍚", bin: "green" },
  { name: "Metal Can", emoji: "🥫", bin: "blue" },
  { name: "Dry Leaves", emoji: "🍂", bin: "green" },
  { name: "Glass Bottle", emoji: "🍾", bin: "blue" },
  { name: "Used Tea Leaves", emoji: "🍵", bin: "green" }
];

const questions = [
  {
    question: "Why separate wet and dry waste?",
    options: [
      "To improve recycling and composting",
      "To increase waste",
      "It is unnecessary"
    ],
    answer: 0
  },
  {
    question: "Where do vegetable peels usually go?",
    options: ["Blue bin", "Green bin", "Anywhere"],
    answer: 1
  },
  {
    question: "Where should used batteries go?",
    options: [
      "With food waste",
      "A designated collection point",
      "On the ground"
    ],
    answer: 1
  },
  {
    question: "Which is dry waste?",
    options: ["Leftover food", "Vegetable peels", "Clean cardboard"],
    answer: 2
  },
  {
    question: "How can you keep the campus clean?",
    options: [
      "Mix all waste",
      "Use the designated bins",
      "Leave waste outside"
    ],
    answer: 1
  }
];

let student = {};
let itemIndex = 0;
let sortingScore = 0;
let quizScore = 0;
let attempts = [];
let quizResponses = [];
let answered = false;
let finished = false;
let record = null;

// Registration
$("registrationForm").addEventListener("submit", event => {
  event.preventDefault();

  student = {
    name: $("studentName").value.trim(),
    enrollmentId: $("enrollment").value.trim(),
    startedAt: new Date().toISOString()
  };

  if (!student.name || !student.enrollmentId) {
    alert("Enter your name and enrollment ID.");
    return;
  }

  renderItem();
  showSection("game");
});

// Render each waste item
function renderItem() {
  answered = false;

  const item = items[itemIndex];

  $("wasteEmoji").textContent = item.emoji;
  $("wasteName").textContent = item.name;
  $("progress").textContent =
    `Item ${itemIndex + 1} of ${items.length}`;

  $("feedback").textContent = "";
  $("nextButton").classList.add("hidden");

  $("blueBin").disabled = false;
  $("greenBin").disabled = false;
}

// Sorting
function selectBin(selectedBin) {
  if (answered) return;
  answered = true;

  const item = items[itemIndex];
  const correct = selectedBin === item.bin;

  if (correct) sortingScore++;

  attempts.push({
    item: item.name,
    selectedBin,
    correctBin: item.bin,
    correct,
    timestamp: new Date().toISOString()
  });

  $("feedback").textContent = correct
    ? "✅ Correct! Well done."
    : `❌ The correct bin is ${item.bin.toUpperCase()}.`;

  $("feedback").style.color = correct ? "#176c43" : "#c62828";

  $("blueBin").disabled = true;
  $("greenBin").disabled = true;

  $("nextButton").textContent =
    itemIndex === items.length - 1
      ? "Continue to Quiz →"
      : "Next Item →";

  $("nextButton").classList.remove("hidden");
}

$("blueBin").addEventListener("click", () => selectBin("blue"));
$("greenBin").addEventListener("click", () => selectBin("green"));

$("nextButton").addEventListener("click", () => {
  itemIndex++;

  if (itemIndex < items.length) {
    renderItem();
  } else {
    renderQuiz();
    showSection("quiz");
  }
});

// Create quiz questions
function renderQuiz() {
  $("quizForm").innerHTML = questions.map((q, index) => `
    <div class="question">
      <p>${index + 1}. ${q.question}</p>
      ${q.options.map((option, optionIndex) => `
        <label>
          <input type="radio"
                 name="question${index}"
                 value="${optionIndex}"
                 required>
          ${option}
        </label>
      `).join("")}
    </div>
  `).join("") + `<button type="submit">Submit Answers</button>`;
}

// Score the quiz
$("quizForm").addEventListener("submit", event => {
  event.preventDefault();
  if (finished) return;

  quizScore = 0;
  quizResponses = [];

  questions.forEach((q, index) => {
    const selected = document.querySelector(
      `input[name="question${index}"]:checked`
    );

    const selectedIndex = Number(selected.value);
    const correct = selectedIndex === q.answer;

    if (correct) quizScore++;

    quizResponses.push({
      question: q.question,
      selectedAnswer: q.options[selectedIndex],
      correctAnswer: q.options[q.answer],
      correct
    });
  });

  finished = true;
  displayResults();
});

// Display final score
function displayResults() {
  const total = sortingScore + quizScore;
  const maximum = items.length + questions.length;
  const accuracy = Math.round(total / maximum * 100);

  $("resultDetails").innerHTML = `
    <p>Student: <strong>${escapeHTML(student.name)}</strong></p>
    <p>Enrollment ID: <strong>${escapeHTML(student.enrollmentId)}</strong></p>
    <p>Sorting score: <strong>${sortingScore}/${items.length}</strong></p>
    <p>Quiz score: <strong>${quizScore}/${questions.length}</strong></p>
    <p>Total score: <strong>${total}/${maximum}</strong></p>
    <p>Accuracy: <strong>${accuracy}%</strong></p>
    <p>${accuracy >= 80
      ? "🌟 Excellent! You are a Waste Wise champion."
      : "🌱 Thanks for participating. Keep practising!"}</p>
  `;

  record = {
    ...student,
    completedAt: new Date().toISOString(),
    sortingScore,
    quizScore,
    totalScore: total,
    accuracy,
    attempts,
    quizResponses
  };

  showSection("results");
}

// Prevent student text from being interpreted as HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// Save locally in the current browser
$("saveButton").addEventListener("click", () => {
  try {
    const key = "vigyanBhawanWasteWiseResults";
    const saved = JSON.parse(localStorage.getItem(key) || "[]");

    saved.push(record);
    localStorage.setItem(key, JSON.stringify(saved));

    $("saveStatus").textContent =
      "✅ Results saved in this browser.";

  } catch (error) {
    $("saveStatus").textContent =
      "Could not save results. Check browser storage.";
  }
});

// Start a fresh session
$("restartButton").addEventListener("click", () => {
  window.location.reload();
});
