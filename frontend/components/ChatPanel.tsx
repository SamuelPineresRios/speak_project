"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sent_at: string;
  isStreaming?: boolean;
}

interface ChatPanelProps {
  guideId: string;
  guideTopic?: string;
  guideCefr?: string;
}

export function ChatPanel({ guideId, guideTopic = "esta lección", guideCefr = "B1" }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`/api/guides/${guideId}/chat`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [guideId]);

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  

  async function handleSendMessage() {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: inputValue,
      sent_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(`/api/guides/${guideId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputValue }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.assistantMessage) {
          setMessages((prev) => [...prev, data.assistantMessage]);
        }
      } else {
        // Fallback - simulated response if the backend doesn't respond
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content:
            "Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.",
          sent_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content:
          "Error de conexión. Asegúrate de que el servicio está disponible.",
        sent_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card className="border-cyan-500/30 bg-slate-900/50 flex flex-col min-h-[700px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 to-slate-900">
        <h3 className="text-cyan-300 font-semibold flex items-center gap-2">
          🤖 {guideTopic} - Tutor Asistente
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Escribe tu pregunta | Nivel: {guideCefr} | Powered by Claude
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" />
            <span className="ml-2 text-slate-400 text-sm">
              Cargando historial...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm mb-3">
              👋 ¡Hola! Soy tu asistente de IA
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Puedo ayudarte a:
            </p>
            <ul className="text-slate-500 text-xs mt-2 space-y-1">
              <li>✓ Explicar conceptos difíciles</li>
              <li>✓ Dar más ejemplos</li>
              <li>✓ Responder dudas específicas</li>
              <li>✓ Sugerir ejercicios adicionales</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-lg border border-slate-700 rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span className="text-xs">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t border-cyan-500/30 bg-slate-900/50">
        <div className="flex gap-2">
          <Input
            placeholder="¿Qué quieres saber?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !loading) {
                handleSendMessage();
              }
            }}
            disabled={loading}
            className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm focus:border-cyan-500 focus:ring-cyan-500/20"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-3"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
