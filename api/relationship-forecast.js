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

//  lista szalonych forecastów demo
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
    `${pair}: the chemistry is giving ‘chaotic good with a touch of emotional damage’. ${timeframeText} you'll alternate between flirting like you're in a rom-com and communicating like two NPCs using preset dialogue options.`,
    `${pair}: both of you pretend you don’t care, but your search history says otherwise. ${timeframeText} expect one dangerously long voice note, a shared meme at 2am, and a moment where eye contact lasts half a second too long.`,
    `${pair}: relationship status: “vibing, but also panicking”. ${timeframeText} at least one conversation will begin with “this might sound crazy but…”. The other person will absolutely love it and pretend they don’t.`,
    `${pair}: emotionally? mid. energetically? unhinged. ${timeframeText} you’ll experience soulmate-level synchronicity followed by an argument about who forgot the charger.`,
    `${pair}: both of you have ‘main character energy’, which means absolutely nothing gets resolved. ${timeframeText} expect plot twists, cliffhangers and at least one “accidental” cuddle.`,
    `${pair}: this connection is like a cursed TikTok filter: chaotic but somehow accurate. ${timeframeText}, one of you will say something too honest and the other will pretend not to hear it while blushing like an idiot.`,
    `${pair}: your dynamic is 40% flirting, 40% avoiding the truth, and 20% sending memes instead of expressing feelings. ${timeframeText}, the emotional Wi-Fi signal will improve slightly — but only when both of you are sleepy.`,
    `${pair}: you two are a perfect example of “they act like a couple but they insist they're not.” ${timeframeText} expect one moment so romantic it scares you both into running in opposite directions for 48 hours.`,
    `${pair}: there's undeniable chemistry, but also undeniable stupidity. ${timeframeText} at least one decision will be made based purely on vibes and it will somehow work out.`,
    `${pair}: your hearts say “maybe”, your brains say “absolutely not”, and your texts say “wyd?”. ${timeframeText} you'll grow closer through pure coincidence and questionable timing.`,
    `${pair}: living proof that two crackheads can balance each other out. ${timeframeText} expect a surprise emotional breakthrough disguised as a joke.`,
    `${pair}: love language? Bullying each other affectionately until someone blushes. ${timeframeText}, you will unexpectedly get soft and it will break the space-time continuum.`,
    `${pair}: there’s enough tension here to power a small city. ${timeframeText}, someone will say something uncomfortably sincere and then immediately pretend they didn’t.`,
    `${pair}: the connection is real, the flags are red, and the banter is elite. ${timeframeText} expect chaotic flirting, one misunderstanding, and a reconciliation worthy of season finales.`,
    `${pair}: you two communicate emotionally like two raccoons fighting over a slice of pizza. ${timeframeText} you’ll still somehow bond over a shared craving or niche fandom.`,
    `${pair}: the universe keeps pushing you together like it’s shipping you. ${timeframeText} expect strange synchronicities, like texting at the exact same time or craving the same meal.`,
    `${pair}: this relationship could either be iconic or a cautionary tale. ${timeframeText}, fate will give you a dumb little sign — and you'll both pretend it's not a sign.`,
    `${pair}: both of you have 'I could fix them' syndrome. ${timeframeText}, neither of you will be fixed, but you will have an emotionally cinematic moment in the rain — or in the Uber.`,
    `${pair}: the tension is giving “slow burn enemies-to-lovers but you skipped the enemies part.” ${timeframeText} expect a moment that feels like a confession even though it's technically not.`,
    `${pair}: you two are one intrusive thought away from being a power couple. ${timeframeText}, at least one of you will accidentally overshare in a way that brings you closer.`,
    `${pair}: this bond is like a playlist made at 3am — weird, intimate, chaotic, strangely perfect. ${timeframeText}, someone will say something stupidly adorable and pretend it wasn’t serious.`,
    `${pair}: the sexual tension between you two could power a small neon city. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, expect one ‘accidental’ touch that lasts way too long and immediately ruins both of your concentration for hours.`,
    `${pair}: let’s be honest — the flirting is basically foreplay at this point. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, someone will send a message that toes the line between “cute” and “I want you”, and the other one will absolutely NOT handle it well.`,
    `${pair}: this is giving “we pretend it’s a joke but we’d totally make out if the lighting was right.” ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, expect a moment of eye contact that feels like PG-13 but implies R-rated intentions.`,
    `${pair}: you two have chemistry that would get flagged by HR. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, someone will ‘accidentally’ compliment something way too specific — jawline, hands, voice — and then pretend it wasn’t sexual. It absolutely was.`,
    `${pair}: the vibe? dangerously flirty. emotionally? questionable. physically? if you stood too close, the air would combust. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, expect at least one moment where both of you pretend you’re not imagining the same thing.`,
    `${pair}: both of you are one bad decision away from making memories you'd never admit in public. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, the tension spikes — especially when one of you says something unintentionally hot.`,
    `${pair}: this connection screams “we’d be a disaster but the sex would be immaculate.” ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, prepare for a flirt so spicy it short-circuits your common sense.`,
    `${pair}: this isn’t love language, this is thirst language. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, someone will say something playful that sounds suspiciously like an invitation. The other will blush, laugh, and save it for later.`,
    `${pair}: you two radiate ‘should we?’ energy. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, something small — a look, a sentence, a stupid inside joke — will flip the vibe from wholesome to horny in 0.4 seconds.`,
    `${pair}: if sexual tension paid rent, you’d own real estate by now. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, expect one situation where you’re both dangerously close, neither of you moves away, and the universe holds its breath.`,
    `${pair}: emotionally unstable, physically compatible, spiritually feral. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, the forecast shows elevated risk of “accidental intimacy” — touches, whispers, leaning in a bit too close.`,
    `${pair}: there’s a high chance of thirst-driven decisions. ${timeframeText.charAt(0).toUpperCase() + timeframeText.slice(1)}, someone will say “stop, you’re so annoying” and mean “please keep flirting with me until I fold.”`,
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
