import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ChatView } from '@/components/chat/chat-view';
import { PROFILE } from '@/lib/data/profile';

export const metadata: Metadata = {
  title: 'Chat',
  description: `Ask ${PROFILE.fullName} anything about his work, stack and availability.`,
};

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatView />
    </Suspense>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="flex items-center gap-2.5">
        <span className="bg-muted-foreground/40 size-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
        <span className="bg-muted-foreground/40 size-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
        <span className="bg-muted-foreground/40 size-2 animate-bounce rounded-full" />
      </div>
    </div>
  );
}
