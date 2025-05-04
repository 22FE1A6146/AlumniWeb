
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Conversation, Message } from '@/types';
import { useAuthContext } from '@/context/AuthContext';
import apiService from '@/lib/api';
import ConversationList from '@/components/messaging/ConversationList';
import MessageList from '@/components/messaging/MessageList';
import MessageInput from '@/components/messaging/MessageInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

const Messages = () => {
  const { conversationId } = useParams();
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showMobileConversations, setShowMobileConversations] = useState(!conversationId);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch conversations
  const { 
    data: conversations = [], 
    isLoading: isLoadingConversations 
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiService.getConversations();
      return response.data;
    }
  });

  // Fetch messages for the current conversation
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages 
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await apiService.getMessages(conversationId);
      return response.data;
    },
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId || !content.trim()) return null;
      return await apiService.sendMessage(conversationId, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast.error("Failed to send message", {
        description: error.message,
      });
    }
  });

  // Start new conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      return await apiService.startConversation(recipientId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate(`/messages/${data.data.id || data.data.conversationId}`);
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error("Failed to start conversation", {
        description: error.message,
      });
    }
  });

  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to send messages");
      return;
    }
    sendMessageMutation.mutate(content);
  };

  // Handle starting a new conversation
  const handleStartConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageRecipient.trim()) {
      toast.error("Please enter a recipient ID");
      return;
    }
    startConversationMutation.mutate(newMessageRecipient);
  };
  
  // Update mobile view when conversation changes
  useEffect(() => {
    if (conversationId) {
      setShowMobileConversations(false);
    }
  }, [conversationId]);

  return (
    <div className="container mx-auto my-8 px-4">
      <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-[300px_1fr] h-[600px]">
          {/* Mobile view toggle */}
          {conversationId && !showMobileConversations && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden absolute top-4 left-4"
              onClick={() => setShowMobileConversations(true)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Conversations sidebar */}
          <div className={`border-r ${showMobileConversations ? 'block' : 'hidden'} md:block`}>
            <div className="p-3 border-b">
              <h2 className="font-semibold">Messages</h2>
            </div>
            <ConversationList
              conversations={conversations}
              isLoading={isLoadingConversations}
              onNewConversation={() => setIsDialogOpen(true)}
            />
          </div>

          {/* Message area */}
          <div className={`flex flex-col ${showMobileConversations ? 'hidden' : 'flex'} md:flex`}>
            {conversationId ? (
              <>
                <div className="p-3 border-b">
                  <h3 className="font-medium">
                    Conversation
                  </h3>
                </div>
                <div className="flex-grow overflow-auto">
                  <MessageList
                    messages={messages}
                    isLoading={isLoadingMessages}
                  />
                </div>
                <MessageInput
                  onSendMessage={handleSendMessage}
                  isLoading={sendMessageMutation.isPending}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="font-medium mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground mb-4">Select a conversation or start a new one</p>
                  <Button onClick={() => setIsDialogOpen(true)}>Start a conversation</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New conversation dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a new conversation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStartConversation} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="recipientId" className="text-sm font-medium">
                Recipient User ID
              </label>
              <Input
                id="recipientId"
                value={newMessageRecipient}
                onChange={(e) => setNewMessageRecipient(e.target.value)}
                placeholder="Enter recipient user ID"
              />
              <p className="text-xs text-muted-foreground">
                Enter the user ID of the person you want to message
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={startConversationMutation.isPending}
            >
              {startConversationMutation.isPending ? "Starting..." : "Start Conversation"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
