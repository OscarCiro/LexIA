
import type { FC, ReactNode } from 'react';
import type { Message } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react'; // Bot as a generic AI icon
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  userDisplayName?: string | null;
  userPhotoURL?: string | null;
  children?: ReactNode; // To allow passing custom content like the thinking indicator
}

const MessageBubble: FC<MessageBubbleProps> = ({ message, userDisplayName, userPhotoURL, children }) => {
  const isUser = message.role === 'user';
  const avatarInitial = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : (isUser ? 'U' : 'L');

  // Use a simple text formatting for newlines
  const formattedText = message.text.split('\n').map((line, index, array) => (
    <span key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </span>
  ));

  return (
    <div className={cn("flex items-start gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-10 w-10 self-start shadow-sm shrink-0">
          {/* For AI, always use Bot icon, no image */}
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <Card 
        className={cn(
          "max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl rounded-xl shadow-md",
          isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border"
        )}
      >
        <CardContent className="p-3 text-sm">
          {children ? children : <p className="whitespace-pre-wrap">{formattedText}</p>}
        </CardContent>
      </Card>
      {isUser && (
         <Avatar className="h-10 w-10 self-start shadow-sm shrink-0">
            <AvatarImage src={userPhotoURL || undefined} alt={userDisplayName || "Usuario"} />
            <AvatarFallback className={cn(userPhotoURL ? "" : "bg-accent text-accent-foreground")}>
                {avatarInitial}
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
