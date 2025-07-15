"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { messagesApi, type Conversation, type Message } from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"

// Separate component for message input to prevent re-renders
function MessageInput({ 
    onSendMessage, 
    disabled 
}: { 
    onSendMessage: (message: string) => void
    disabled: boolean 
}) {
    const [inputValue, setInputValue] = useState("")

    const handleSend = useCallback(() => {
        if (inputValue.trim() && !disabled) {
            onSendMessage(inputValue)
            setInputValue("")
        }
    }, [inputValue, onSendMessage, disabled])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    return (
        <div className="flex gap-2">
            <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                className="flex-1 resize-none"
                onKeyDown={handleKeyDown}
            />
            <Button onClick={handleSend} disabled={!inputValue.trim() || disabled}>
                <Send className="w-4 h-4" />
            </Button>
        </div>
    )
}

export default function MessagesPage() {
    const { user } = useAuth()
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch conversations from API
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true)
                const data = await messagesApi.getConversations()
                setConversations(data)
                if (data.length > 0 && !selectedConversation) {
                    setSelectedConversation(data[0].id)
                }
                setError(null)
            } catch (err) {
                setError('Failed to fetch conversations')
                console.error('Error fetching conversations:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [selectedConversation])

    // Fetch messages when conversation is selected
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversation) return
            
            try {
                const conversation = conversations.find(c => c.id === selectedConversation)
                if (conversation) {
                    const data = await messagesApi.getConversationMessages(conversation.other_user_id, conversation.listing_id)
                    setMessages(data)
                }
            } catch (err) {
                console.error('Error fetching messages:', err)
            }
        }

        if (selectedConversation && conversations.length > 0) {
            fetchMessages()
        }
    }, [selectedConversation, conversations])

    const handleSendMessage = useCallback(async (messageText: string) => {
        if (messageText.trim() && selectedConversation) {
            try {
                const conversation = conversations.find(c => c.id === selectedConversation)
                if (conversation) {
                    const message = await messagesApi.sendMessage({
                        text: messageText,
                        listing_id: conversation.listing_id,
                        receiver_id: conversation.other_user_id
                    })
                    setMessages(prev => [...prev, message])
                }
            } catch (err) {
                console.error('Error sending message:', err)
            }
        }
    }, [selectedConversation, conversations])

    const selectedConv = useMemo(() => 
        conversations.find((c) => c.id === selectedConversation), 
        [conversations, selectedConversation]
    )

    const MessagesContent = () => {
        if (loading) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Navigation />
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading messages...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        if (error) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Navigation />
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Messages</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    {/* Conversations List */}
                    <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Conversations</CardTitle>
                        <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Search messages..." className="pl-10" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-1">
                        {conversations.map((conversation) => (
                            <div
                            key={conversation.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                                selectedConversation === conversation.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            }`}
                            onClick={() => setSelectedConversation(conversation.id)}
                            >
                            <div className="flex items-center gap-3">
                                <Avatar>
                                <AvatarImage src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%239ca3af'%3EUser%3C/text%3E%3C/svg%3E" />
                                <AvatarFallback>
                                    {conversation.other_user_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium truncate">{conversation.other_user_name}</h3>
                                    <span className="text-xs text-gray-500">{new Date(conversation.last_message_time).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                                <p className="text-xs text-blue-600 mt-1">{conversation.listing_title}</p>
                                </div>
                                {conversation.unread_count > 0 && (
                                <Badge className="bg-red-500 text-white text-xs">{conversation.unread_count}</Badge>
                                )}
                            </div>
                            </div>
                        ))}
                        </div>
                    </CardContent>
                    </Card>

                    {/* Chat Area */}
                    <Card className="lg:col-span-2 flex flex-col">
                    {selectedConv ? (
                        <>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%239ca3af'%3EUser%3C/text%3E%3C/svg%3E" />
                                <AvatarFallback>
                                {selectedConv.other_user_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium">{selectedConv.other_user_name}</h3>
                                <p className="text-sm text-gray-600">{selectedConv.listing_title}</p>
                            </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                key={message.id}
                                className={`flex ${user && message.sender_username === user.username ? "justify-end" : "justify-start"}`}
                                >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    user && message.sender_username === user.username ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                    <p
                                    className={`text-xs mt-1 ${user && message.sender_username === user.username ? "text-blue-100" : "text-gray-500"}`}
                                    >
                                    {new Date(message.created_at).toLocaleString()}
                                    </p>
                                </div>
                                </div>
                            ))}
                            </div>
                        </CardContent>

                        <div className="p-4 border-t">
                            <MessageInput 
                                onSendMessage={handleSendMessage}
                                disabled={!selectedConversation}
                            />
                        </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <p>Select a conversation to start messaging</p>
                        </div>
                        </div>
                    )}
                    </Card>
                </div>
                </div>
            </div>
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <MessagesContent />
        </ProtectedRoute>
    )
}