const questions = [
  {
    text: "When someone tells a story, you usually:",
    answers: [
      { text: "Listen like a functioning human", score: 0 },
      { text: "Wait for your turn to speak", score: 1 },
      { text: "Interrupt with your own better story", score: 2 },
      { text: "Correct small details nobody asked about", score: 3 }
    ]
  },
  {
    text: "In a group chat, your natural role is:",
    answers: [
      { text: "Quiet observer", score: 0 },
      { text: "Normal participant", score: 1 },
      { text: "Meme goblin", score: 2 },
      { text: "Chaos distributor", score: 3 }
    ]
  },
  {
    text: "A friend says they're upset. You:",
    answers: [
      { text: "Support them properly", score: 0 },
      { text: "Try to help with advice", score: 1 },
      { text: "Tell them they’re overthinking", score: 2 },
      { text: "Send a meme and vanish", score: 3 }
    ]
  },
  {
    text: "How often do you restart drama that should have died yesterday?",
    answers: [
      { text: "Never", score: 0 },
      { text: "Rarely", score: 1 },
      { text: "Sometimes", score: 2 },
      { text: "Like it's my part-time job", score: 3 }
    ]
  },
  {
    text: "Someone leaves you on read. Your first thought is:",
    answers: [
      { text: "They're busy", score: 0 },
      { text: "That’s a bit weird", score: 1 },
      { text: "Rude", score: 2 },
      { text: "This is now a political conflict", score: 3 }
    ]
  },
  {
    text: "How do you apologize?",
    answers: [
      { text: "Directly and sincerely", score: 0 },
      { text: "Awkwardly, but honestly", score: 1 },
      { text: "Half apology, half explanation", score: 2 },
      { text: "I explain why I was actually right", score: 3 }
    ]
  },
  {
    text: "When plans go wrong, you tend to:",
    answers: [
      { text: "Adapt and move on", score: 0 },
      { text: "Get annoyed for a minute", score: 1 },
      { text: "Complain dramatically", score: 2 },
      { text: "Treat it like a betrayal arc", score: 3 }
    ]
  },
  {
    text: "Your relationship with attention is:",
    answers: [
      { text: "Healthy enough", score: 0 },
      { text: "I enjoy it a little", score: 1 },
      { text: "I may perform for the room", score: 2 },
      { text: "Every room is my stage", score: 3 }
    ]
  },
  {
    text: "How often do people say 'bro, relax' to you?",
    answers: [
      { text: "Almost never", score: 0 },
      { text: "Sometimes", score: 1 },
      { text: "Pretty often", score: 2 },
      { text: "That is basically my title", score: 3 }
    ]
  },
  {
    text: "Be honest. Are you the problem?",
    answers: [
      { text: "No", score: 0 },
      { text: "Only a little", score: 1 },
      { text: "Potentially", score: 2 },
      { text: "Yes, but I’m funny", score: 3 }
    ]
  }
];

const results = [
  {
    min: 0,
    max: 7,
    title: "Not The Problem",
    subtitle: "Suspiciously functional.",
    description:
      "You seem mostly normal, emotionally survivable, and not especially committed to chaos. Either you are genuinely innocent, or you are incredibly good at letting other people take the blame."
  },
  {
    min: 8,
    max: 14,
    title: "Mild Menace",
    subtitle: "Manageable, but memorable.",
    description:
      "You are not a full disaster, but you definitely add flavor to the situation. People probably roll their eyes at you sometimes, then laugh five minutes later. Annoying? A bit. Dangerous? Usually not."
  },
  {
    min: 15,
    max: 22,
    title: "Certified Problem",
    subtitle: "People absolutely have stories about you.",
    description:
      "You are not always the issue, but you are very often somewhere near the blast radius. You escalate, poke things that should be left alone, and then act shocked when chaos shows up wearing your fingerprints."
  },
  {
    min: 23,
    max: 30,
    title: "Walking Disaster",
    subtitle: "A one-person plot twist.",
    description:
      "You are the issue. The full issue. The deluxe edition of the issue. Group chats recover from your presence in stages and at least one person has muted you for survival reasons. Charismatic? Yes. Safe? Absolutely not."
  }
];

let currentQuestion = -1;
let userAnswers = new Array(questions.length).fill(null);

const startBtn = document.getElementById("startBtn");
const quizCard = document.getElementById("quizCard");
const resultCard = document.getElementById("resultCard");
const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const answersWrap = document.getElementById("answers");
const backBtn = document.getElementById("backBtn");
const progressFill = document.getElementById("progressFill");

const resultTitle = document.getElementById("resultTitle");
const resultSubtitle = document.getElementById("resultSubtitle");
const resultDescription = document.getElementById("resultDescription");
const scoreText = document.getElementById("scoreText");
const shareText = document.getElementById("shareText");
const restartBtn = document.getElementById("restartBtn");
const copyBtn = document.getElementById("copyBtn");

startBtn.addEventListener("click", startQuiz);
backBtn.addEventListener("click", goBack);
restartBtn.addEventListener("click", restartQuiz);
copyBtn.addEventListener("click", copyResult);

function startQuiz() {
  currentQuestion = 0;
  quizCard.classList.remove("hidden");
  resultCard.classList.add("hidden");
  quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
  renderQuestion();
}

function renderQuestion() {
  const q = questions[currentQuestion];
  questionNumber.textContent = `${currentQuestion + 1} / ${questions.length}`;
  questionText.textContent = q.text;
  answersWrap.innerHTML = "";

  const progressPercent = (currentQuestion / questions.length) * 100;
  progressFill.style.width = `${progressPercent}%`;

  q.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    button.textContent = answer.text;

    if (userAnswers[currentQuestion] === index) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      userAnswers[currentQuestion] = index;
      nextQuestion();
    });

    answersWrap.appendChild(button);
  });

  backBtn.disabled = currentQuestion === 0;
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    showResult();
  }
}

function goBack() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

function calculateScore() {
  return userAnswers.reduce((sum, answerIndex, questionIndex) => {
    if (answerIndex === null) return sum;
    return sum + questions[questionIndex].answers[answerIndex].score;
  }, 0);
}

function getResult(score) {
  return results.find((result) => score >= result.min && score <= result.max);
}

function showResult() {
  const score = calculateScore();
  const result = getResult(score);

  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");

  resultTitle.textContent = result.title;
  resultSubtitle.textContent = result.subtitle;
  resultDescription.textContent = result.description;
  scoreText.textContent = `${score} / 30`;

  const shareMessage =
`I got "${result.title}" on Party Pixels: Am I the Problem? 💀

${result.subtitle}
Chaos score: ${score} / 30

${result.description}

Take the test: ${window.location.href}`;

  shareText.value = shareMessage;
  progressFill.style.width = "100%";

  try {
    localStorage.setItem(
      "pp_am_i_the_problem_last_result",
      JSON.stringify({
        score,
        title: result.title,
        subtitle: result.subtitle
      })
    );
  } catch (error) {
    // ignore storage issues
  }

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function restartQuiz() {
  currentQuestion = 0;
  userAnswers = new Array(questions.length).fill(null);
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
  renderQuestion();
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(shareText.value);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy result";
    }, 1400);
  } catch (error) {
    copyBtn.textContent = "Copy failed";
    setTimeout(() => {
      copyBtn.textContent = "Copy result";
    }, 1400);
  }
        }
