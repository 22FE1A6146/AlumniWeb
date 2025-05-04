
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  onNewConversation: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  onNewConversation
}) => {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="p-3">
        <Button 
          onClick={onNewConversation}
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <MessageSquare className="h-4 w-4" />
          New Message
        </Button>
      </div>
      
      <div className="mt-4 space-y-1">
        {conversations.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No conversations yet
          </p>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 cursor-pointer hover:bg-accent rounded-md ${
                conversation.id === conversationId ? 'bg-accent' : ''
              }`}
              onClick={() => navigate(`/messages/${conversation.id}`)}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {conversation.participants[0].substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {/* This would be replaced with actual name once user data is available */}
                    User {conversation.participants[0].substring(0, 5)}
                  </p>
                  
                  {conversation.lastMessage && (
                    <>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage.content.substring(0, 30)}
                        {conversation.lastMessage.content.length > 30 && '...'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { 
                          addSuffix: true 
                        })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
