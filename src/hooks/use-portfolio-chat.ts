'use client';

import { useCallback, useRef, useState } from 'react';

import { decodeEvents, type ChatMessage, type ToolInvocation } from '@/lib/ai/protocol';
import { uid } from '@/lib/utils';

export type ChatStatus = 'idle' | 'submitted' | 'streaming';

interface UsePortfolioChat {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  /** True while a tool is running but no text has arrived yet. */
  toolPending: boolean;
  send: (text: string) => void;
  stop: () => void;
  retry: () => void;
  reset: () => void;
}

/**
 * A focused replacement for `useChat`.
 *
 * Owns exactly what this site needs: append a user message, stream one
 * assistant reply, track tool invocations so the renderer can mount components,
 * and support abort + retry. Roughly 120 lines instead of a dependency whose
 * API has changed three times in a year.
 */
export function usePortfolioChat(): UsePortfolioChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [toolPending, setToolPending] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  /** Kept in a ref so `send` never goes stale inside async work. */
  const messagesRef = useRef<ChatMessage[]>([]);
  const lastPromptRef = useRef<string>('');

  const commit = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const run = useCallback(
    async (history: ChatMessage[]) => {
      const assistantId = uid('a');
      const assistant: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        tools: [],
        createdAt: Date.now(),
      };

      commit([...history, assistant]);
      setStatus('submitted');
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      /** Mutates just the in-flight assistant message. */
      const patch = (fn: (draft: ChatMessage) => void) => {
        const next = messagesRef.current.map((m) => {
          if (m.id !== assistantId) return m;
          const draft: ChatMessage = { ...m, tools: [...m.tools] };
          fn(draft);
          return draft;
        });
        commit(next);
      };

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!response.body) throw new Error('The server did not return a stream.');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let sawText = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = decodeEvents(buffer);
          buffer = rest;

          for (const event of events) {
            switch (event.type) {
              case 'text':
                if (!sawText) {
                  sawText = true;
                  setStatus('streaming');
                  setToolPending(false);
                }
                patch((d) => {
                  d.content += event.delta;
                });
                break;

              case 'tool': {
                setToolPending(true);
                const invocation: ToolInvocation = { id: event.id, name: event.name, state: 'running' };
                patch((d) => {
                  d.tools.push(invocation);
                });
                break;
              }

              case 'tool-result':
                patch((d) => {
                  const found = d.tools.find((t) => t.id === event.id);
                  if (found) {
                    found.result = event.result;
                    found.state = 'done';
                  } else {
                    d.tools.push({ id: event.id, name: event.name, result: event.result, state: 'done' });
                  }
                });
                break;

              case 'error':
                setError(event.message);
                patch((d) => {
                  d.failed = true;
                  if (!d.content) d.content = event.message;
                });
                break;

              case 'done':
              case 'start':
                break;
            }
          }
        }
      } catch (caught) {
        const aborted = caught instanceof Error && caught.name === 'AbortError';
        if (!aborted) {
          const message =
            caught instanceof Error ? caught.message : 'Could not reach the server. Check your connection.';
          setError(message);
          patch((d) => {
            d.failed = true;
            if (!d.content) d.content = message;
          });
        }
      } finally {
        abortRef.current = null;
        setStatus('idle');
        setToolPending(false);

        // Drop an assistant turn that produced literally nothing.
        const last = messagesRef.current[messagesRef.current.length - 1];
        if (last && last.id === assistantId && !last.content && last.tools.length === 0) {
          commit(messagesRef.current.slice(0, -1));
        }
      }
    },
    [commit],
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || abortRef.current) return;

      lastPromptRef.current = trimmed;
      const user: ChatMessage = {
        id: uid('u'),
        role: 'user',
        content: trimmed,
        tools: [],
        createdAt: Date.now(),
      };

      void run([...messagesRef.current, user]);
    },
    [run],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
    setToolPending(false);
  }, []);

  const retry = useCallback(() => {
    if (abortRef.current) return;

    // Walk back to the last user message and replay from there.
    const history = [...messagesRef.current];
    while (history.length > 0 && history[history.length - 1].role === 'assistant') history.pop();
    if (history.length === 0) return;

    void run(history);
  }, [run]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    commit([]);
    setStatus('idle');
    setError(null);
    setToolPending(false);
  }, [commit]);

  return { messages, status, error, toolPending, send, stop, retry, reset };
}
