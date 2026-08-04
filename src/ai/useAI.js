import { useState, useCallback } from "react";
import { sendMessageToGemini, buildSystemPrompt } from "./geminiService";

export function useAI(theme, userData) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userMessage) => {
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    setError(null);

    try {
      const systemPrompt = buildSystemPrompt(theme, userData);
      const response = await sendMessageToGemini(newMessages, systemPrompt);
      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [messages, theme, userData]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
}