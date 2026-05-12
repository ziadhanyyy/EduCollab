import type { Message } from '@/types';

export default function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  const time = new Date(msg.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isMe) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary text-white px-3.5 py-2 text-sm leading-relaxed">
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground">{time}</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <span className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase text-muted-foreground shrink-0 select-none">
        {msg.senderName.charAt(0)}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-muted-foreground ml-1">{msg.senderName}</span>
        <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white border px-3.5 py-2 text-sm leading-relaxed">
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground ml-1">{time}</span>
      </div>
    </div>
  );
}
