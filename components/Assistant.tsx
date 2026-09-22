"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { GREETING, HONORIFIC, SUGGESTIONS, answer } from "@/lib/assistant";
import { assetPath, profile } from "@/lib/content";
import { requestPublicationSearch } from "@/lib/pub-search";
import { Icon } from "./Icon";

interface Message {
  id: number;
  role: "bot" | "user";
  /** Plain text for user turns; assistant HTML for bot turns. */
  body: string;
  pending?: boolean;
}

let nextId = 0;

/** Short pause before the reply appears, scaled to question length. */
function thinkingDelay(text: string): number {
  return 380 + Math.min(text.length * 8, 420);
}

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const t of pending) clearTimeout(t);
    };
  }, []);

  /* Keep the newest message in view. */
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const focus = setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(focus);
    };
  }, [open, close]);

  const ask = useCallback((text: string) => {
    const question = text.trim();
    if (!question) return;

    const pendingId = nextId++;
    setMessages((prev) => [
      ...prev,
      { id: nextId++, role: "user", body: question },
      { id: pendingId, role: "bot", body: "", pending: true },
    ]);

    let reply: string;
    try {
      reply = answer(question);
    } catch {
      reply = "Sorry, something went wrong answering that. Please try rephrasing.";
    }

    const timer = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === pendingId ? { ...m, body: reply, pending: false } : m)),
      );
    }, thinkingDelay(question));
    timers.current.push(timer);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draft;
    setDraft("");
    ask(value);
  }

  /* The reply HTML contains jump buttons; handle them by delegation. */
  function handleLogClick(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest<HTMLElement>(".ai-jump");
    if (!button) return;

    const pubSearch = button.getAttribute("data-pubsearch");
    const target = pubSearch !== null ? "publications" : button.getAttribute("data-jump");
    if (pubSearch !== null) requestPublicationSearch(pubSearch);

    if (target) {
      const section = document.getElementById(target);
      section?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }
    if (window.innerWidth < 640) close();
  }

  function toggle() {
    setOpen((wasOpen) => {
      if (!wasOpen && messages.length === 0) {
        setMessages([{ id: nextId++, role: "bot", body: GREETING }]);
      }
      return !wasOpen;
    });
  }

  const photo = assetPath(profile.photo.src);

  return (
    <div className="no-print">
      <button
        ref={launcherRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="assistant-panel"
        className={`fixed right-[18px] bottom-5 z-[950] inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-accent px-0 font-sans text-[0.98rem] font-semibold text-white transition-transform hover:-translate-y-0.5 hover:scale-[1.03] min-[521px]:h-[54px] min-[521px]:pr-5 min-[521px]:pl-4 ${
          open ? "shadow-glow" : "animate-launcher"
        } w-14 min-[521px]:w-auto`}
      >
        <Icon name="chat" className="size-[22px] shrink-0" strokeWidth={1.9} />
        <span className="hidden min-[521px]:inline">Ask me</span>
      </button>

      <section
        id="assistant-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="assistant-title"
        hidden={!open}
        className={`fixed right-[18px] bottom-[86px] z-[960] flex h-[min(600px,calc(100vh-120px))] w-[min(390px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_-20px_rgba(16,21,28,0.55),0_0_0_1px_rgba(16,21,28,0.06)] transition-[opacity,transform] duration-200 max-[520px]:inset-x-2 max-[520px]:bottom-[84px] max-[520px]:h-[calc(100dvh-104px)] max-[520px]:w-auto ${
          open ? "scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-[0.98] opacity-0"
        }`}
      >
        <header className="relative flex items-center gap-3 bg-dark-wash py-4 pr-4 pl-[18px] text-white after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-accent after:content-['']">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- tiny fixed-size avatar, no optimiser needed
            <img
              src={photo}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full border-2 border-white/80 bg-white object-cover object-top"
            />
          ) : (
            <span className="size-10 shrink-0 rounded-full bg-accent" />
          )}
          <div className="min-w-0 flex-1">
            <h2 id="assistant-title" className="m-0 font-sans text-base font-bold text-white">
              Ask about {HONORIFIC}
            </h2>
            <p className="m-0 mt-0.5 flex items-center gap-1.5 text-[0.8rem] text-white/72">
              <span className="size-2 rounded-full bg-[#3ddc97] shadow-[0_0_0_3px_rgba(61,220,151,0.25)]" />
              Instant answers from this website
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close assistant"
            className="flex size-9.5 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white hover:bg-white/20"
          >
            <Icon name="close" className="size-5" strokeWidth={2} />
          </button>
        </header>

        <div
          ref={logRef}
          onClick={handleLogClick}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-[linear-gradient(#fbfbfc,#f4f5f7)] p-4 [overscroll-behavior:contain]"
        >
          {messages.map((message) =>
            message.role === "user" ? (
              <div
                key={message.id}
                className="ai-msg max-w-[88%] animate-msg-in self-end rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-[0.93rem] leading-relaxed break-words text-white"
              >
                {message.body}
              </div>
            ) : (
              <div
                key={message.id}
                className="ai-msg max-w-[88%] animate-msg-in self-start rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-2.5 text-[0.93rem] leading-relaxed break-words text-ink-900 shadow-card"
              >
                {message.pending ? (
                  <span className="inline-flex gap-1 py-1" aria-label="Thinking">
                    {[0, 1, 2].map((i) => (
                      <i
                        key={i}
                        className="size-[7px] rounded-full bg-blush-500"
                        style={{
                          animation: "typing-dot 1s infinite ease-in-out",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </span>
                ) : (
                  // Built in lib/assistant.ts from our own content, escaped there.
                  <span dangerouslySetInnerHTML={{ __html: message.body }} />
                )}
              </div>
            ),
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto bg-[#f4f5f7] px-3.5 pt-2.5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => ask(suggestion)}
              className="shrink-0 cursor-pointer rounded-full border border-line bg-white px-3.5 py-[7px] font-sans text-[0.84rem] font-medium whitespace-nowrap text-ink-700 hover:border-blush-500 hover:text-maroon-600"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="flex gap-2 bg-[#f4f5f7] px-3.5 py-3">
          <label htmlFor="assistant-input" className="sr-only">
            Your question
          </label>
          <input
            ref={inputRef}
            id="assistant-input"
            type="text"
            maxLength={200}
            placeholder="Ask a question…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-11.5 min-w-0 flex-1 rounded-full border border-line bg-white px-4 font-sans text-base text-ink-900 focus:border-blush-500 focus:shadow-[0_0_0_3px_rgba(224,86,107,0.18)] focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex size-11.5 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-accent text-white shadow-glow"
          >
            <Icon name="send" className="size-5" strokeWidth={2} />
          </button>
        </form>

        <p className="m-0 bg-[#f4f5f7] px-3.5 pb-2.5 text-center text-[0.72rem] text-ink-500">
          Answers come only from the content on this page.
        </p>
      </section>
    </div>
  );
}
