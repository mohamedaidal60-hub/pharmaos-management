import { motion } from "framer-motion";
import { MessageSquare, Search, Send, Star, Clock, ChevronRight } from "lucide-react";
import { messages } from "@/data/mockData";
import { useState } from "react";

const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const selected = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Messagerie Interne</h1>
        <p className="page-subtitle">Communication entre le personnel — {messages.filter(m => !m.read).length} non lu(s)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Message List */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Rechercher..." className="w-full h-8 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg.id)}
                className={`w-full text-left p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${selectedMessage === msg.id ? "bg-primary/5" : ""} ${!msg.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold mt-0.5">{msg.fromAvatar}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${!msg.read ? "font-bold" : "font-medium"}`}>{msg.from}</span>
                      {msg.urgent && <span className="badge-danger text-[9px] px-1">!</span>}
                    </div>
                    <p className={`text-xs truncate ${!msg.read ? "font-semibold" : ""}`}>{msg.subject}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{msg.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div className="glass-card lg:col-span-2 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-sm">{selected.fromAvatar}</div>
                  <div>
                    <p className="font-semibold text-sm">{selected.from}</p>
                    <p className="text-xs text-muted-foreground">{new Date(selected.timestamp).toLocaleString("fr-FR")}</p>
                  </div>
                  {selected.urgent && <span className="badge-danger ml-auto">Urgent</span>}
                </div>
                <h3 className="font-display font-semibold mt-3">{selected.subject}</h3>
              </div>
              <div className="flex-1 p-5 overflow-y-auto">
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.preview}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                  Ceci est un aperçu du message. Le contenu complet sera disponible une fois le système de messagerie connecté au backend.
                </p>
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Répondre..."
                    className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                    <Send size={14} /> Envoyer
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare size={48} className="mb-3 opacity-20" />
              <p className="text-sm">Sélectionnez un message pour le lire</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
