const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function vibeToStyle(vibe) {
  switch (vibe) {
    case "wholesome":
      return "soft, warm, supportive, slightly funny but kind";
    case "goofy":
      return "chaotic, meme-like, playful, teasing and ridiculous";
    case "dramatic":
      return "overly dramatic, telenovela-level, full of metaphors and intensity";
    case "toxic":
      return "brutally honest, darkly humorous, calling out red flags with savage comedy";
    case "situationship":
      return "confused, hazy, playful, self-aware about the lack of labels";
    case "long_distance":
      return "romantic but realistic about distance, bittersweet and hopeful";
    case "friends_with_benefits":
      return "spicy, playful, honest about emotional risk";
    case "office_romance":
      return "secretive, flirty, corporate-drama, slightly unhinged";
    case "its_complicated":
      return "messy, self-aware, half-therapy half-roast";
    default:
      return "funny, slightly unhinged but ultimately light-hearted";
  }
}

function timeframeToText(timeframe) {
  switch (timeframe) {
    case "next_week":
      return "over the next week";
    case "next_month":
      return "over the next month";
    case "six_months":
      return "over the next six months";
    case "one_year":
      return "over the next year";
    default:
      return "in the near future";
  }
}

// 🎲 lista szalonych forecastów demo
function buildDemoForecast(youName, partnerName, vibe, timeframeText) {
  const pair = `${youName} & ${partnerName}`;
  const vibePretty = vibe.replace(/_/g, " ");

  const templates = [
    `${pair}: you two are giving strong “${vibePretty}” energy. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, expect at least one deep talk at a stupid hour, one inside joke that refuses to die, and one moment where you both pretend you're totally fine while clearly not being fine.`,
    `${pair}: astrology is fake, but the chaos is real. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)} you'll ping-pong between “we're so cute” and “who allowed this situationship to exist”. Somehow it still works. Mostly because you're both too stubborn to admit you care.`,
    `${pair}: emotional Wi-Fi signal is unstable but still connected. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)} there will be: one suspiciously perfect day, two petty arguments about nothing, and a random moment when you look at each other and think “oh no, I might actually be in trouble here”.`,
    `${pair}: this is less soulmates, more co-op roguelike. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, you'll level up your communication, die emotionally once or twice, then respawn with snacks and a meme apology.`,
    `${pair}: if red flags were push notifications, both of your phones would be on do not disturb. Still, ${timeframeText} there's at least 73% chance of accidental tenderness, unexpected honesty and one dangerously good hug.`,
    `${pair}: canonically, this ship should not work, but the fanfic version absolutely does. ${timeframeText} expect plot twists, chaotic chemistry and one scene that feels like the season finale nobody ordered.`,
  ];

  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx];
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
    }

    const youName = (body && body.youName) || "You";
    const partnerName = (body && body.partnerName) || "Them";
    const vibe = (body && body.vibe) || "wholesome";
    const timeframe = (body && body.timeframe) || "next_month";

    const vibeStyle = vibeToStyle(vibe);
    const timeframeText = timeframeToText(timeframe);

    const systemPrompt =
      "You are a playful, meme-aware 'fake astrologer' and relationship oracle. " +
      "You generate short relationship forecasts that sound dramatic, funny and slightly chaotic, " +
      "but you NEVER claim to be real astrology, therapy or serious advice. " +
      "Keep it under 3 short paragraphs. Swear lightly if it fits, but don't go full offensive. " +
      "Talk directly to the user in second person. Include 1–2 very specific, weird details to make it feel personal. " +
      "Always remind implicitly that this is just for fun.";

    const userPrompt =
      `Create a relationship forecast for ${youName} and ${partnerName} ` +
      `${timeframeText}. The requested vibe is: ${vibe}.\n\n` +
      `Tone style: ${vibeStyle}.\n` +
      "Output only the forecast text, no headings, no disclaimers.";

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 260,
      temperature: 0.9,
    });

    const forecast =
      completion.choices &&
      completion.choices[0] &&
      completion.choices[0].message &&
      (completion.choices[0].message.content || "").trim();

    if (!forecast) {
      res.status(500).json({ error: "No forecast returned from model" });
      return;
    }

    res.status(200).json({
      forecast,
      mode: "ai",
    });
  } catch (err) {
    console.error("RELATIONSHIP FORECAST ERROR:", err);

    // 🔴 fallback na demo przy problemach z billingiem / limitem / kwotą
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

      const youName = (body && body.youName) || "You";
      const partnerName = (body && body.partnerName) || "Them";
      const vibe = (body && body.vibe) || "wholesome";
      const timeframe = (body && body.timeframe) || "next_month";
      const timeframeText = timeframeToText(timeframe);

      const demo = buildDemoForecast(youName, partnerName, vibe, timeframeText);

      res.status(200).json({
        forecast: demo,
        mode: "demo",
      });
      return;
    }

    // inne błędy – normalny 500
    res.status(500).json({ error: "Generation failed" });
  }
};
