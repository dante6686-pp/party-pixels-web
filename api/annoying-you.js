const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function vibeToTone(vibe) {
  switch (vibe) {
    case "soft":
      return "soft, kind, gently teasing, reassuring but still honest";
    case "playful":
      return "playful roast, meme-y, funny but not actually cruel";
    case "spicy":
      return "chaotic, spicy, slightly unhinged but still light-hearted";
    case "toxic_fun":
      return "toxic but funny, brutally honest, dark humor but not truly abusive";
    default:
      return "funny, slightly unhinged but ultimately affectionate";
  }
}

function relationshipToText(rel) {
  switch (rel) {
    case "partner":
      return "romantic partner or crush";
    case "friend":
      return "best friend or chaos friend";
    case "situationship":
      return "undefined situationship";
    case "coworker":
      return "coworker, boss or colleague";
    case "family":
      return "family member";
    case "roommate":
      return "roommate or shared-flat goblin";
    default:
      return "important person";
  }
}

// demo fallback
function buildDemoAnalysis(youName, otherName, relationship, vibe, score) {
  const pair = `${youName} & ${otherName}`;
  const relText = relationshipToText(relationship);
  const vibePretty = vibe.replace(/_/g, " ");

  const templates = [
    `${pair}: according to very serious fake science, you annoy them at ${score}%. This is the kind of irritation where they roll their eyes, complain in emojis, and then still choose to hang out with you anyway.`,
    `${pair}: as a ${relText}, your annoyance level at ${score}% is legally classified as “endearing menace”. They sigh, they groan, but deep down they’d be bored if you stopped.`,
    `${pair}: ${score}% annoyance detected. That’s the sweet spot where they threaten to block you at least once a week but never actually do it.`,
    `${pair}: vibe: ${vibePretty}. Score: ${score}%. Translation: you get on their nerves just enough to keep things interesting, but not enough to be replaced.`,
    `${pair}: emotionally, they’re mildly exhausted. Spiritually, they’re obsessed with you. ${score}% annoyance is exactly the level where every “you’re so annoying” secretly means “don’t go anywhere.”`,
    `${pair}: your chaos output is at ${score}%. That’s ideal for a ${relText}: slightly feral, occasionally too much, but impossible to ignore.`,
    `${pair}: ${score}% annoyance means you’ve unlocked “limited edition gremlin” status. They complain, but they also screenshot your messages and send them to their friends.`,
    `${pair}: you generate ${score}% emotional noise in their brain. Yet somehow, you are still their favorite notification.`,
  ];

  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx];
}

function randomScoreForDemo() {
  // trochę bardziej realistyczne: 35–95
  return Math.floor(35 + Math.random() * 61);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    } else {
      body = body || {};
    }

    const youName = body.youName || "You";
    const otherName = body.otherName || "Them";
    const relationship = body.relationship || "partner";
    const vibe = body.vibe || "playful";

    const tone = vibeToTone(vibe);
    const relText = relationshipToText(relationship);

    const systemPrompt =
      "You are a playful, meme-aware fake relationship psychologist. " +
      "You rate how annoying one person is to another with a percentage, " +
      "and then explain it in a short, funny, slightly chaotic way. " +
      "You NEVER encourage real abuse or serious toxicity. " +
      "Your style is half roast, half affection. " +
      "Keep the answer under 3 short paragraphs.";

    const userPrompt =
      `We have two people: ${youName} and ${otherName}. ` +
      `${youName} wants to know how much they annoy ${otherName}. ` +
      `Their relationship: ${relText}. Vibe: ${vibe}.\n\n` +
      "First, choose an Annoyance Score from 0 to 100 (higher means more annoying, " +
      "but still in a mostly playful, not truly harmful way). " +
      "Then write a short, funny explanation of what this score means, " +
      "in this tone: " + tone + ". " +
      "Don’t ask questions, just give the reading. " +
      "Do not explicitly say 'this is a joke' – the tone itself should show it.";

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 260,
      temperature: 0.9,
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const text = raw.trim();

    // spróbuj wyciągnąć liczbowy procent z tekstu
    const match = text.match(/(\d{1,3})\s*%/);
    let score = 0;
    if (match) {
      score = Math.max(0, Math.min(100, parseInt(match[1], 10)));
    } else {
      // jak nie ma %, losujemy sensowny zakres
      score = randomScoreForDemo();
    }

    if (!text) {
      res.status(500).json({ error: "No analysis returned from model" });
      return;
    }

    res.status(200).json({
      score,
      analysis: text,
      mode: "ai",
    });
  } catch (err) {
    console.error("ANNOYING-YOU ERROR:", err);

    const isBillingProblem =
      err &&
      (
        err.code === "billing_hard_limit_reached" ||
        err.code === "insufficient_quota" ||
        (err.error && (
          err.error.code === "billing_hard_limit_reached" ||
          err.error.code === "insufficient_quota"
        )) ||
        err.status === 429 ||
        err.statusCode === 429
      );

    if (isBillingProblem) {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {
          body = {};
        }
      } else {
        body = body || {};
      }

      const youName = body.youName || "You";
      const otherName = body.otherName || "Them";
      const relationship = body.relationship || "partner";
      const vibe = body.vibe || "playful";

      const score = randomScoreForDemo();
      const demoText = buildDemoAnalysis(youName, otherName, relationship, vibe, score);

      res.status(200).json({
        score,
        analysis: demoText,
        mode: "demo",
      });
      return;
    }

    res.status(500).json({ error: "Generation failed" });
  }
};
