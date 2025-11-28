import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mapujemy wartości z selecta na tekstowy prompt stylu
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

// Standardowy handler Vercel serverless (Node)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { style } = req.body || {};

    if (!style) {
      res.status(400).json({ error: "Missing style" });
      return;
    }

    const stylePrompt = styleToPrompt(style);

    const prompt = `
      High quality portrait of a person, shoulders up, clean background.
      ${stylePrompt}
    `.trim();

    // Wołamy OpenAI images API
    const response = await client.images.generate({
  model: "gpt-image-1",
  prompt,
  size: "1024x1024",
  n: 1,
  // gpt-image-1 ZAWSZE zwraca base64 w data[0].b64_json,
  // więc nie podajemy już response_format.
});

    const image = response.data[0]?.b64_json;

    if (!image) {
      res.status(500).json({ error: "No image returned from model" });
      return;
    }

    // Zwracamy base64 do frontendu
    res.status(200).json({
      imageBase64: image,
    });
  } catch (err) {
    console.error("FACE REMIX ERROR:", err);
    res.status(500).json({ error: "Generation failed" });
  }
}