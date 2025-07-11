"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, X, MapPin, Bed, Bath, Wifi, Car, Utensils, Search, Home, Star } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useRouter } from "next/navigation"

interface Listing {
    id: string
    title: string
    price: number
    location: string
    bedrooms: number
    bathrooms: number
    images: string[]
    amenities: string[]
    description: string
    available: string
    contact: string
    }

    const mockListings: Listing[] = [
    {
        id: "1",
        title: "Cozy Studio Near Campus",
        price: 800,
        location: "University District",
        bedrooms: 1,
        bathrooms: 1,
        images: ["/placeholder.svg?height=400&width=300"],
        amenities: ["WiFi", "Parking", "Kitchen"],
        description: "Perfect for students! Walking distance to campus with all utilities included.",
        available: "Jan 2024",
        contact: "sarah.j@email.com",
    },
    {
        id: "2",
        title: "Shared House Room",
        price: 600,
        location: "Downtown",
        bedrooms: 1,
        bathrooms: 2,
        images: ["/placeholder.svg?height=400&width=300"],
        amenities: ["WiFi", "Kitchen", "Laundry"],
        description: "Room in a 4-bedroom house with friendly roommates. Great location!",
        available: "Feb 2024",
        contact: "mike.r@email.com",
    },
    {
        id: "3",
        title: "Modern Apartment",
        price: 1200,
        location: "Midtown",
        bedrooms: 2,
        bathrooms: 1,
        images: ["/placeholder.svg?height=400&width=300"],
        amenities: ["WiFi", "Parking", "Kitchen", "Gym"],
        description: "Newly renovated apartment with modern amenities and great views.",
        available: "Mar 2024",
        contact: "alex.k@email.com",
    },
    ]

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
    const [likedListings, setLikedListings] = useState<string[]>([])
    const router = useRouter()

    const currentListing = mockListings[currentIndex]

    const handleSwipe = (direction: "left" | "right") => {
        setSwipeDirection(direction)
        setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mockListings.length)
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
                        src={currentListing.images[0] || "/placeholder.svg"}
                        alt={currentListing.title}
                        className="w-full h-64 object-cover rounded-t-lg"
                        />
                        <Badge className="absolute top-4 right-4 bg-green-500">Available {currentListing.available}</Badge>
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
                    {currentIndex + 1} of {mockListings.length} listings
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