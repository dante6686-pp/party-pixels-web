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

function buildDemoForecast(youName, partnerName, vibe, timeframeText) {
  return (
    `${youName} & ${partnerName}: demo mode prophecy.\n\n` +
    `You two are giving strong “${vibe.replace("_", " ")}” energy. ` +
    `Expect at least one deep talk, two stupid inside jokes, ` +
    `and one moment of pure cringe ${timeframeText}. ` +
    `Whether it ends in cuddles, chaos or both – you definitely won't be bored.`
  );
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
      } catch (e) {}
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

    // jeśli dobity billing, lecimy w demo mode, żeby toy nie umarł
    if (
      err &&
      (err.code === "billing_hard_limit_reached" ||
        (err.error && err.error.code === "billing_hard_limit_reached"))
    ) {
      const body =
        typeof req.body === "string"
          ? (() => {
              try { return JSON.parse(req.body); } catch (e) { return {}; }
            })()
          : req.body || {};

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

    res.status(500).json({ error: "Generation failed" });
  }
};