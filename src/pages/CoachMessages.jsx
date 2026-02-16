import React, { useState, useEffect, useRef } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Clock, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { it } from "date-fns/locale";

export default function CoachMessages() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await mindflow.auth.me();
    setUser(userData);
  };

  const { data: allMessages } = useQuery({
    queryKey: ['coach-messages', user?.id],
    queryFn: async () => {
      const sent = await mindflow.entities.Message.filter({ sender_id: user?.id });
      const received = await mindflow.entities.Message.filter({ receiver_id: user?.id });
      return [...sent, ...received].sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    initialData: [],
    enabled: !!user,
    refetchInterval: 3000
  });

  const conversations = React.useMemo(() => {
    if (!user || !allMessages) return [];
    
    const convMap = new Map();
    
    allMessages.forEach(msg => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const otherName = msg.sender_id === user.id ? 
        (msg.receiver_id === user.id ? msg.sender_name : "Coachee") : 
        msg.sender_name;
      
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          id: otherId,
          name: otherName,
          lastMessage: msg.content,
          lastMessageDate: msg.created_date,
          unreadCount: 0,
          messages: []
        });
      }
      
      const conv = convMap.get(otherId);
      conv.messages.push(msg);
      
      if (msg.receiver_id === user.id && !msg.is_read) {
        conv.unreadCount++;
      }
    });
    
    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
    );
  }, [allMessages, user]);

  const selectedMessages = React.useMemo(() => {
    if (!selectedConversation) return [];
    const conv = conversations.find(c => c.id === selectedConversation);
    return conv ? conv.messages.sort((a, b) => 
      new Date(a.created_date) - new Date(b.created_date)
    ) : [];
  }, [selectedConversation, conversations]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      await mindflow.entities.Message.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-messages'] });
      setNewMessage("");
      setTimeout(scrollToBottom, 100);
    }
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedMessages]);

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Ieri ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'dd/MM/yyyy HH:mm');
    }
  };

  const getLastMessageTime = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) return '';
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    return formatDistanceToNow(new Date(lastMsg.created_date), { addSuffix: true, locale: it });
  };

  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds) => {
      await Promise.all(messageIds.map(id => 
        mindflow.entities.Message.update(id, { is_read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-messages'] });
    }
  });

  useEffect(() => {
    if (selectedConversation && user) {
      const unreadMessages = selectedMessages
        .filter(msg => msg.receiver_id === user.id && !msg.is_read)
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        markAsReadMutation.mutate(unreadMessages);
      }
    }
  }, [selectedConversation, selectedMessages, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversation_id: `${user.id}_${selectedConversation}`,
      sender_id: user.id,
      sender_name: user.full_name,
      sender_role: "coach",
      receiver_id: selectedConversation,
      content: newMessage,
      is_read: false
    });
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Messaggi Real-Time
          </h1>
          <p className="text-gray-600">Comunica in tempo reale con i tuoi coachee</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="shadow-xl lg:col-span-1 border-2 border-indigo-100">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <MessageSquare className="w-5 h-5" />
                Conversazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Nessuna conversazione</p>
                    <p className="text-sm mt-2">I tuoi messaggi appariranno qui</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-3">
                    {conversations.map((conv) => (
                      <motion.button
                        key={conv.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full p-4 text-left rounded-xl transition-all ${
                          selectedConversation === conv.id
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 shadow-md'
                            : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                {conv.name?.[0] || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm truncate text-gray-900">
                                {conv.name}
                              </h4>
                              {conv.unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white shadow-sm animate-pulse">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 truncate mb-1">
                              {conv.lastMessage}
                            </p>
                            <p className="text-xs text-gray-400">
                              {getLastMessageTime(conv)}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="shadow-xl lg:col-span-2 border-2 border-indigo-100">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle>
                {selectedConversation ? (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {conversations.find(c => c.id === selectedConversation)?.name?.[0] || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {conversations.find(c => c.id === selectedConversation)?.name}
                      </h3>
                      <p className="text-xs text-green-600 font-medium">Online</p>
                    </div>
                  </div>
                ) : (
                  "Seleziona una conversazione"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!selectedConversation ? (
                <div className="h-[600px] flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-indigo-50">
                  <div className="text-center">
                    <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">Seleziona una conversazione</p>
                    <p className="text-sm">Inizia a chattare con i tuoi coachee</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-[600px]">
                  <ScrollArea ref={scrollAreaRef} className="flex-1 bg-gradient-to-br from-gray-50 to-white">
                    <div className="p-4 space-y-4">
                      {selectedMessages.map((msg, index) => {
                        const isOwn = msg.sender_id === user?.id;
                        const showDate = index === 0 || 
                          new Date(msg.created_date).toDateString() !== 
                          new Date(selectedMessages[index - 1].created_date).toDateString();
                        
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <span className="text-xs text-gray-500 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
                                  {format(new Date(msg.created_date), 'dd MMMM yyyy', { locale: it })}
                                </span>
                              </div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[75%] ${
                                isOwn
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                                  : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                              } rounded-2xl px-4 py-3`}>
                                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                                <div className={`flex items-center gap-1.5 mt-2 ${
                                  isOwn ? 'justify-end' : 'justify-start'
                                }`}>
                                  <Clock className={`w-3 h-3 ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`} />
                                  <span className={`text-xs ${
                                    isOwn ? 'text-indigo-100' : 'text-gray-500'
                                  }`}>
                                    {formatMessageTime(msg.created_date)}
                                  </span>
                                  {isOwn && msg.is_read && (
                                    <CheckCheck className="w-4 h-4 text-indigo-200" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Scrivi un messaggio..."
                        className="flex-1 bg-gray-50 border-gray-300 focus:border-indigo-500 rounded-full px-5 py-6"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full px-8 py-6 shadow-md"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}