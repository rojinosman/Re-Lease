"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface Message {
    id: string
    text: string
    sender: "me" | "other"
    timestamp: string
    }

    interface Conversation {
    id: string
    name: string
    avatar: string
    lastMessage: string
    timestamp: string
    unread: number
    listing: string
    }

    const mockConversations: Conversation[] = [
    {
        id: "1",
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "Is the apartment still available?",
        timestamp: "2 min ago",
        unread: 2,
        listing: "Cozy Studio Near Campus",
    },
    {
        id: "2",
        name: "Mike Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "Thanks for the info!",
        timestamp: "1 hour ago",
        unread: 0,
        listing: "Shared House Room",
    },
    {
        id: "3",
        name: "Alex Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "When can I schedule a viewing?",
        timestamp: "3 hours ago",
        unread: 1,
        listing: "Modern Apartment",
    },
    ]

    const mockMessages: Message[] = [
    {
        id: "1",
        text: "Hi! I'm interested in your listing for the cozy studio.",
        sender: "other",
        timestamp: "10:30 AM",
    },
    {
        id: "2",
        text: "Great! It's still available. Would you like to know more details?",
        sender: "me",
        timestamp: "10:32 AM",
    },
    {
        id: "3",
        text: "Yes, please! Is the apartment still available?",
        sender: "other",
        timestamp: "10:35 AM",
    },
    ]

    export default function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState<string | null>("1")
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState(mockMessages)

    const handleSendMessage = () => {
        if (newMessage.trim()) {
        const message: Message = {
            id: Date.now().toString(),
            text: newMessage,
            sender: "me",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages([...messages, message])
        setNewMessage("")
        }
    }

    const selectedConv = mockConversations.find((c) => c.id === selectedConversation)

    const MessagesContent = () => {
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
                        {mockConversations.map((conversation) => (
                            <div
                            key={conversation.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                                selectedConversation === conversation.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            }`}
                            onClick={() => setSelectedConversation(conversation.id)}
                            >
                            <div className="flex items-center gap-3">
                                <Avatar>
                                <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                    {conversation.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium truncate">{conversation.name}</h3>
                                    <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                                <p className="text-xs text-blue-600 mt-1">{conversation.listing}</p>
                                </div>
                                {conversation.unread > 0 && (
                                <Badge className="bg-red-500 text-white text-xs">{conversation.unread}</Badge>
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
                                <AvatarImage src={selectedConv.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                {selectedConv.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium">{selectedConv.name}</h3>
                                <p className="text-sm text-gray-600">{selectedConv.listing}</p>
                            </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                key={message.id}
                                className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                                >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                    <p
                                    className={`text-xs mt-1 ${message.sender === "me" ? "text-blue-100" : "text-gray-500"}`}
                                    >
                                    {message.timestamp}
                                    </p>
                                </div>
                                </div>
                            ))}
                            </div>
                        </CardContent>

                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                className="flex-1"
                            />
                            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                            </div>
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