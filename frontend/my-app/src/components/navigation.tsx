"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, List, MessageCircle, Menu, X, User, Search, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const navItems = [
        { href: "/browse", label: "Browse", icon: Home },
        { href: "/search", label: "Search", icon: Search },
        { href: "/my-listings", label: "My Listings", icon: List },
        { href: "/messages", label: "Messages", icon: MessageCircle },
    ]

    const isActive = (href: string) => pathname === href

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
    }

    return (
        <>
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-800">SubLease</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button variant={isActive(item.href) ? "default" : "ghost"} className="flex items-center space-x-2">
                                            <Icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </Button>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="hidden md:flex items-center space-x-2">
                            {user ? (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">Welcome, {user.username}!</span>
                                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" onClick={handleSignIn}>
                                        Sign In
                                    </Button>
                                    <Button size="sm" onClick={handleSignUp}>
                                        Sign Up
                                    </Button>
                                </div>
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
                            <div className="space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                                            <Button variant={isActive(item.href) ? "default" : "ghost"} className="w-full justify-start">
                                                <Icon className="w-4 h-4 mr-2" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    )
                                })}
                                
                                {user ? (
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="px-3 py-2 text-sm text-gray-700">
                                            Welcome, {user.username}!
                                        </div>
                                        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign Out
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 pt-2 border-t">
                                        <Button variant="ghost" className="w-full justify-start" onClick={handleSignIn}>
                                            Sign In
                                        </Button>
                                        <Button className="w-full justify-start" onClick={handleSignUp}>
                                            Sign Up
                                        </Button>
                                    </div>
                                )}
                            </div>
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
