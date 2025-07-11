"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin, Bed, Bath, Wifi, Car, Utensils, Heart, Filter } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"

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
        images: ["/placeholder.svg?height=300&width=400"],
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
        images: ["/placeholder.svg?height=300&width=400"],
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
        images: ["/placeholder.svg?height=300&width=400"],
        amenities: ["WiFi", "Parking", "Kitchen", "Gym"],
        description: "Newly renovated apartment with modern amenities and great views.",
        available: "Mar 2024",
        contact: "alex.k@email.com",
    },
    {
        id: "4",
        title: "Luxury Studio Downtown",
        price: 1500,
        location: "Downtown",
        bedrooms: 1,
        bathrooms: 1,
        images: ["/placeholder.svg?height=300&width=400"],
        amenities: ["WiFi", "Parking", "Kitchen", "Gym", "Pool"],
        description: "High-end studio with premium amenities and city views.",
        available: "Apr 2024",
        contact: "emma.w@email.com",
    },
    {
        id: "5",
        title: "Budget-Friendly Room",
        price: 450,
        location: "University District",
        bedrooms: 1,
        bathrooms: 1,
        images: ["/placeholder.svg?height=300&width=400"],
        amenities: ["WiFi", "Kitchen"],
        description: "Affordable option for students on a budget. Clean and safe.",
        available: "Jan 2024",
        contact: "john.d@email.com",
    },
    {
        id: "6",
        title: "Spacious 3BR House",
        price: 2000,
        location: "Suburbs",
        bedrooms: 3,
        bathrooms: 2,
        images: ["/placeholder.svg?height=300&width=400"],
        amenities: ["WiFi", "Parking", "Kitchen", "Laundry", "Yard"],
        description: "Perfect for group of friends. Large house with backyard.",
        available: "May 2024",
        contact: "lisa.m@email.com",
    },
    ]

    const amenityIcons = {
    WiFi: Wifi,
    Parking: Car,
    Kitchen: Utensils,
    Gym: Heart,
    Laundry: Bath,
    Pool: Heart,
    Yard: Heart,
    }

    export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [priceRange, setPriceRange] = useState([0, 2000])
    const [selectedLocation, setSelectedLocation] = useState("Any location")
    const [selectedBedrooms, setSelectedBedrooms] = useState("Any")
    const [showFilters, setShowFilters] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
    
    const { user } = useAuth()

    const filteredListings = mockListings.filter((listing) => {
        const matchesSearch =
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1]

        const matchesLocation = selectedLocation === "Any location" || listing.location === selectedLocation

        const matchesBedrooms = selectedBedrooms === "Any" || listing.bedrooms.toString() === selectedBedrooms

        return matchesSearch && matchesPrice && matchesLocation && matchesBedrooms
    })

    const locations = [...new Set(mockListings.map((listing) => listing.location))]

    const handleContactOwner = () => {
        if (!user) {
            setAuthMode("signin")
            setShowAuthModal(true)
        } else {
            // Handle contact owner logic for authenticated users
            console.log("Contacting owner...")
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Search Listings</h1>

            {/* Search Bar */}
            <Card className="mb-6">
                <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by title, location, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12"
                    />
                    </div>
                    <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:w-auto w-full h-12 bg-white"
                    >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                            <SelectValue placeholder="Any location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Any location">Any location</SelectItem>
                            {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                                {location}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                        <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
                        <SelectTrigger>
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Any">Any</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                        </label>
                        <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={2000}
                        min={0}
                        step={50}
                        className="w-full"
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery("")
                            setPriceRange([0, 2000])
                            setSelectedLocation("Any location")
                            setSelectedBedrooms("Any")
                        }}
                        className="w-full h-10 bg-white"
                        >
                        Clear Filters
                        </Button>
                    </div>
                    </div>
                )}
                </CardContent>
            </Card>

            {/* Results */}
            <div className="mb-6">
                <p className="text-gray-600">
                {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} found
                </p>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                    <img
                        src={listing.images[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-4 right-4 bg-green-500">
                        Available {listing.available}
                    </Badge>
                    </div>

                    <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold">{listing.title}</h3>
                        <span className="text-xl font-bold text-green-600">${listing.price}/mo</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{listing.location}</span>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        <span className="text-sm">{listing.bedrooms} bed</span>
                        </div>
                        <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        <span className="text-sm">{listing.bathrooms} bath</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {listing.amenities.slice(0, 3).map((amenity) => {
                        const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Heart
                        return (
                            <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {amenity}
                            </Badge>
                        )
                        })}
                        {listing.amenities.length > 3 && (
                        <Badge variant="secondary">+{listing.amenities.length - 3} more</Badge>
                        )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleContactOwner}
                    >
                        <Heart className="w-4 h-4 mr-2" />
                        {user ? "Contact Owner" : "Sign In to Contact"}
                    </Button>
                    </CardContent>
                </Card>
                ))}
            </div>

            {filteredListings.length === 0 && (
                <Card className="text-center py-12">
                <CardContent>
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                    <p className="text-gray-600">
                    Try adjusting your search criteria or filters to find more listings.
                    </p>
                </CardContent>
                </Card>
            )}
            </div>
        </div>

        <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            defaultMode={authMode}
        />
        </div>
    )
}