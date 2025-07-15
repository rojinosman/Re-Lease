"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, MessageCircle, Shield, Star, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { listingsApi } from "@/lib/api"

export default function LandingPage() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [totalListings, setTotalListings] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch total listings count from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const listings = await listingsApi.getListings()
        setTotalListings(listings.length)
      } catch (err) {
        console.error('Error fetching listings count:', err)
        setTotalListings(0)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const features = [
    {
      icon: Heart,
      title: "Swipe to Find",
      description:
        "Discover your perfect sublease with our intuitive swipe interface - just like dating, but for apartments!",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Filter by price, location, amenities, and more to find exactly what you're looking for.",
    },
    {
      icon: MessageCircle,
      title: "Direct Messaging",
      description: "Connect directly with other students through our built-in messaging system.",
    },
    {
      icon: Shield,
      title: "Student Verified",
      description: "All users are verified students, ensuring a safe and trusted community.",
    },
  ]

  const stats = [
    { number: loading ? "..." : `${totalListings}`, label: "Active Listings" },
    { number: "0", label: "Students Helped" },
    { number: "0", label: "Universities" },
    { number: "0★", label: "Average Rating" },
  ]

  const handleProtectedAction = (action: string) => {
    if (!user) {
      setAuthMode("signin")
      setShowAuthModal(true)
    }
  }

  const handleBrowseClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      handleProtectedAction("browse")
    }
  }

  const handleListYourPlaceClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      handleProtectedAction("list")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">🎓 Made by Students, for Students</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-blue-600"> Student Sublease</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The easiest way to find and list student housing. Swipe through listings, connect with fellow students, and
            secure your next home in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse" onClick={handleBrowseClick}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                <Heart className="w-5 h-5 mr-2" />
                Start Swiping
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-white">
                <Search className="w-5 h-5 mr-2" />
                Search Listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Students Love SubLease</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built the perfect platform for student housing with features designed specifically for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl mx-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse & Swipe</h3>
              <p className="text-gray-600">
                Swipe through curated listings or use our advanced search to find your perfect match.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Chat</h3>
              <p className="text-gray-600">
                Message other students directly through our secure platform to ask questions and arrange viewings.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Move In</h3>
              <p className="text-gray-600">Finalize the details and move into your new home. It's that simple!</p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Next Home?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who have already found their perfect sublease
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse" onClick={handleBrowseClick}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                  Start Browsing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/my-listings" onClick={handleListYourPlaceClick}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 text-lg px-8 py-3 bg-transparent"
                >
                  List Your Place
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">SubLease</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-600">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-600">
                Contact Us
              </a>
              <a href="#" className="hover:text-blue-600">
                Help
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            © 2024 SubLease. Made with ❤️ for students, by students.
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </div>
  )
}