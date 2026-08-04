const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export async function sendMessageToGemini(messages, systemPrompt) {
  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

export function buildSystemPrompt(theme, userData) {
  const personalities = {
    galaxy: {
      name: "Nova",
      tone: "curious, futuristic, and motivational",
      style: "Use space metaphors. Stars, constellations, universe, cosmos.",
    },
    sakura: {
      name: "Hana",
      tone: "gentle, calm, and encouraging",
      style: "Use nature and blossom metaphors. Flowers, gardens, seasons, growth.",
    },
    autumn: {
      name: "Akio",
      tone: "warm, reflective, and peaceful",
      style: "Use autumn metaphors. Leaves, seasons, forests, quiet change.",
    },
  };

  const p = personalities[theme] || personalities.galaxy;

  return `You are ${p.name}, the AI habit coach inside HabitFlow, a premium habit tracking app.
Your tone is ${p.tone}. ${p.style}
You are NOT a generic chatbot. You are a personal habit coach who knows the user's data.

Here is the user's current data:
- Habits: ${userData.habits.map((h) => h.name).join(", ") || "No habits yet"}
- Habits completed today: ${userData.completedToday} out of ${userData.totalHabits}
- Current streak: ${userData.currentStreak} days
- Total completions: ${userData.totalCompletions}
- Weekly completion: ${userData.weeklyPercentage}%

Rules:
- Always use the user's actual habit names in responses
- Never give generic advice — always personalize based on their data
- Keep responses concise and conversational (2-4 sentences max unless asked for a report)
- Use emojis sparingly but meaningfully
- Never say you are an AI or mention Gemini
- Always respond as ${p.name}`;
}