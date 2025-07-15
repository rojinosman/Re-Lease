"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, X, MapPin, Bed, Bath, Wifi, Car, Utensils, Search, Home, Star } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useRouter } from "next/navigation"
import { listingsApi, type Listing } from "@/lib/api"

    const amenityIcons = {
    WiFi: Wifi,
    Parking: Car,
    Kitchen: Utensils,
    Gym: Heart,
    Laundry: Bath,
    }

    export default function BrowsePage() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
    const [likedListings, setLikedListings] = useState<number[]>([])
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Fetch listings from API
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true)
                const data = await listingsApi.getListings()
                setListings(data)
                setError(null)
            } catch (err) {
                setError('Failed to fetch listings')
                console.error('Error fetching listings:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchListings()
    }, [])

    const currentListing = listings[currentIndex]

    const handleSwipe = (direction: "left" | "right") => {
        setSwipeDirection(direction)
        setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % listings.length)
        setSwipeDirection(null)
        }, 300)
    }

    const TabBar = () => (
        <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
                <div className="flex space-x-1">
                    <Button
                        variant={"default"}
                        className="flex items-center space-x-2"
                    >
                        <Home className="w-4 h-4" />
                        <span>Swipe</span>
                    </Button>
                    <Button
                        variant={"ghost"}
                        onClick={() => router.push("/search")}
                        className="flex items-center space-x-2"
                    >
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                    </Button>
                    <Button
                        variant={"ghost"}
                        onClick={() => router.push("/search?tab=liked")}
                        className="flex items-center space-x-2"
                    >
                        <Star className="w-4 h-4" />
                        <span>Liked ({likedListings.length})</span>
                    </Button>
                </div>
            </div>
        </div>
    )

    const BrowseContent = () => {
        if (loading) {
            return (
                <div className="min-h-screen">
                    <Navigation />
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-md mx-auto">
                            <TabBar />
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading listings...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        if (error) {
            return (
                <div className="min-h-screen">
                    <Navigation />
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-md mx-auto">
                            <TabBar />
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

        if (!currentListing) {
            return (
            <div className="min-h-screen">
                <Navigation />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto">
                        <TabBar />
                        <h2 className="text-2xl font-bold text-primary mb-4">No more listings!</h2>
                        <p className="text-accent">Check back later for new sublease opportunities.</p>
                    </div>
                </div>
            </div>
            )
        }

        return (
            <div className="min-h-screen">
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <TabBar />
                    <h1 className="text-3xl font-bold text-center mb-8 text-primary">Find Your Perfect Sublease</h1>

                <div className="relative">
                    <Card
                    className={`w-full transition-transform duration-300 ${
                        swipeDirection === "left"
                        ? "-translate-x-full opacity-0"
                        : swipeDirection === "right"
                            ? "translate-x-full opacity-0"
                            : ""
                    }`}
                    >
                    <div className="relative">
                        <img
                        src={currentListing.images[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%239ca3af'%3ENo Image Available%3C/text%3E%3C/svg%3E"}
                        alt={currentListing.title}
                        className="w-full h-64 object-cover rounded-t-lg"
                        />
                        <Badge className="absolute top-4 right-4 bg-green-500">Available {new Date(currentListing.available_from).toLocaleDateString()}</Badge>
                    </div>

                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">{currentListing.title}</h2>
                        <span className="text-2xl font-bold text-green-600">${currentListing.price}/mo</span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{currentListing.location}</span>
                        </div>

                        <div className="flex gap-4 mb-4">
                        <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            <span className="text-sm">{currentListing.bedrooms} bed</span>
                        </div>
                        <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            <span className="text-sm">{currentListing.bathrooms} bath</span>
                        </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                        {currentListing.amenities.map((amenity) => {
                            const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Heart
                            return (
                            <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                                <Icon className="w-3 h-3" />
                                {amenity}
                            </Badge>
                            )
                        })}
                        </div>

                        <p className="text-gray-600 text-sm mb-6">{currentListing.description}</p>

                        <div className="flex gap-4 justify-center">
                        <Button
                            size="lg"
                            variant="outline"
                            className="flex-1 border-red-200 hover:bg-red-50 bg-transparent"
                            onClick={() => handleSwipe("left")}
                        >
                            <X className="w-6 h-6 text-red-500" />
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            onClick={() => handleSwipe("right")}
                        >
                            <Heart className="w-6 h-6" />
                        </Button>
                        </div>
                    </CardContent>
                    </Card>
                </div>

                <div className="text-center mt-6 text-sm text-gray-600">
                    {currentIndex + 1} of {listings.length} listings
                </div>
                </div>
            </div>
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <BrowseContent />
        </ProtectedRoute>
    )
}