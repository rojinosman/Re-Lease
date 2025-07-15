"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Menu, X, LogOut, MessageCircle, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import Image from "next/image"

export function Navigation() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
    const [showUserDropdown, setShowUserDropdown] = useState(false)

    const handleSignIn = () => {
        setAuthMode("signin")
        setShowAuthModal(true)
    }

    const handleSignUp = () => {
        setAuthMode("signup")
        setShowAuthModal(true)
    }

    const handleLogout = () => {
        logout()
        setIsOpen(false)
        setShowUserDropdown(false)
    }

    return (
        <>
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href={user ? "/search" : "/"} className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                                <Image src="/favicon.ico" alt="Release Logo" width={32} height={32} />
                            </div>
                            <span className="text-xl font-bold text-green-600">Release</span>
                        </Link>

                        {/* User Menu */}
                        <div className="hidden md:flex items-center space-x-2">
                            {user ? (
                                <>
                                    {/* User Name Dropdown */}
                                    <div className="relative">
                                        <button
                                            className="flex items-center space-x-1 text-sm text-blue-700 font-semibold hover:underline focus:outline-none"
                                            onClick={() => setShowUserDropdown((v) => !v)}
                                            onBlur={() => setTimeout(() => setShowUserDropdown(false), 150)}
                                        >
                                            <span>{user.username}</span>
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        {showUserDropdown && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                                                <Link
                                                    href="/profile"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setShowUserDropdown(false)}
                                                >
                                                    Profile
                                                </Link>
                                                <button
                                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                    onClick={handleLogout}
                                                >
                                                    Log Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Message Icon */}
                                    <Link href="/messages">
                                        <Button size="sm" variant="outline">
                                            <MessageCircle className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    {/* Add Listing */}
                                    <Link href="/add-listing">
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                            + Add Listing
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" onClick={handleSignIn}>
                                        Sign In
                                    </Button>
                                    <Button size="sm" onClick={handleSignUp}>
                                        Sign Up
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    {isOpen && (
                        <div className="md:hidden py-4 border-t">
                            <Link href="/messages">
                                <Button variant="ghost" className="w-full justify-start">
                                    <MessageCircle className="w-5 h-5" />
                                </Button>
                            </Link>
                            {user ? (
                                <>
                                    <Link href="/profile">
                                        <Button variant="ghost" className="w-full justify-start">
                                            Profile
                                        </Button>
                                    </Link>
                                    <Link href="/add-listing">
                                        <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                                            + Add Listing
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Log Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" className="w-full justify-start" onClick={handleSignIn}>
                                        Sign In
                                    </Button>
                                    <Button className="w-full justify-start" onClick={handleSignUp}>
                                        Sign Up
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            <AuthModal 
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultMode={authMode}
            />
        </>
    )
}
