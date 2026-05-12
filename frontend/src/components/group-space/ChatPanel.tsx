import { Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { Message } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';
import MessageBubble from './MessageBubble';

interface Props {
  messages: Message[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  send: (content: string) => Promise<Message>;
  userId: string | undefined;
}

export default function ChatPanel({
  messages,
  loading,
  hasMore,
  loadingMore,
  loadMore,
  send,
  userId,
}: Props) {
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages is used as a trigger to scroll; refs don't need to be listed
  useEffect(() => {
    if (autoScrollRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!loading) chatEndRef.current?.scrollIntoView();
  }, [loading]);

  function handleChatScroll() {
    const el = chatContainerRef.current;
    if (!el) return;
    autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  async function handleSend() {
    const content = messageInput.trim();
    if (!content || sending) return;
    setMessageInput('');
    autoScrollRef.current = true;
    setSending(true);
    try {
      await send(content);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to send message.'));
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div
        ref={chatContainerRef}
        onScroll={handleChatScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
      >
        {hasMore && (
          <div className="text-center pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMore}
              disabled={loadingMore}
              className="text-xs text-muted-foreground"
            >
              {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
              Load earlier messages
            </Button>
          </div>
        )}
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'items-end gap-2'}`}>
                {i % 2 !== 0 && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
                <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-40' : 'w-52'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-16">
            <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isMe={userId === msg.senderId} />
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="border-t px-4 py-3 flex gap-2 bg-white shrink-0">
        <Input
          placeholder="Type a message…"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={sending}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!messageInput.trim() || sending} size="icon">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
}
