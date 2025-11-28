const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function styleToPrompt(style) {
  switch (style) {
    case "disney_princess":
      return "soft colorful fairytale animated princess illustration, disney-like, detailed eyes, gentle lighting";
    case "retro_anime":
      return "90s retro anime character portrait, cel shading, bold lines, grainy texture";
    case "cyberpunk":
      return "cyberpunk mercenary in neon city, glowing accents, futuristic sci-fi portrait";
    case "dark_knight":
      return "dark fantasy knight, moody lighting, dramatic shadows, detailed armor";
    case "pixar_toy":
      return "cute stylized 3D toy character, pixar-like proportions, soft lighting";
    case "90s_cartoon":
      return "90s cartoon character, thick outlines, flat colors, simple shading";
    case "space_captain":
      return "space opera starship captain, sci-fi uniform, cosmic background";
    case "romcom_main":
      return "rom-com movie main character, cinematic portrait, warm tones";
    case "vampire_lord":
      return "elegant vampire aristocrat, gothic mood, pale skin, red accents";
    case "magical_girl":
      return "magical girl/boy anime hero, sparkles, pastel colors, dynamic pose";
    default:
      return "stylized character portrait, digital art";
  }
}

// Vercel Node API route – CommonJS
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    let body = req.body;

    // na wszelki wypadek: jak przyszło jako string, spróbuj zparsować
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // ignorujemy, wtedy body zostaje stringiem
      }
    }

    const style = body && body.style;

    if (!style) {
      res.status(400).json({ error: "Missing style" });
      return;
    }

    const stylePrompt = styleToPrompt(style);

    const prompt = (
      "High quality portrait of a person, shoulders up, clean background. " +
      stylePrompt
    ).trim();

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
      // bez response_format – gpt-image-1 i tak zwraca b64_json
    });

    const image = response.data && response.data[0] && response.data[0].b64_json;

    if (!image) {
      res.status(500).json({ error: "No image returned from model" });
      return;
    }

    res.status(200).json({
      imageBase64: image,
    });
  } catch (err) {
    console.error("FACE REMIX ERROR:", err);

    // specjalny case: limit billing
    if (
      err && (
        err.code === "billing_hard_limit_reached" ||
        (err.error && err.error.code === "billing_hard_limit_reached")
      )
    ) {
      res.status(402).json({
        error: "billing_limit",
        message: "Billing hard limit has been reached.",
      });
      return;
    }

    res.status(500).json({ error: "Generation failed" });
  }
};
