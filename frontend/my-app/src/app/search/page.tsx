"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin, Bed, Bath, Wifi, Car, Utensils, Heart, Filter, Home, Star } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { useRouter } from "next/navigation"
import { listingsApi, type Listing, messagesApi } from "@/lib/api"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const amenityIcons = {
    WiFi: Wifi,
    Parking: Car,
    Kitchen: Utensils,
    Gym: Heart,
    Laundry: Bath,
    Pool: Heart,
    Yard: Heart,
}

type TabType = "browse" | "search" | "liked"

export default function SearchPage() {
    const [activeTab, setActiveTab] = useState<TabType>("search")
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [priceRange, setPriceRange] = useState([0, 2000])
    const [selectedLocation, setSelectedLocation] = useState("Any location")
    const [selectedBedrooms, setSelectedBedrooms] = useState("Any")
    const [showFilters, setShowFilters] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
    const [likedListings, setLikedListings] = useState<number[]>([])
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    const { user } = useAuth()
    const [messageModalOpen, setMessageModalOpen] = useState(false)
    const [messageTarget, setMessageTarget] = useState<{ownerId: number, ownerUsername: string, listingId: number} | null>(null)
    const [messageText, setMessageText] = useState("")
    const [messageSending, setMessageSending] = useState(false)
    const [messageSent, setMessageSent] = useState(false)
    const [messageError, setMessageError] = useState<string | null>(null)

    // Fetch listings from API
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true)
                const params: any = {}
                
                if (searchQuery) params.search = searchQuery
                if (priceRange[0] > 0) params.min_price = priceRange[0]
                if (priceRange[1] < 2000) params.max_price = priceRange[1]
                if (selectedLocation !== "Any location") params.location = selectedLocation
                if (selectedBedrooms !== "Any") params.bedrooms = parseInt(selectedBedrooms)
                
                const data = await listingsApi.getListings(params)
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
    }, [searchQuery, priceRange, selectedLocation, selectedBedrooms])

    const likedListingsData = listings.filter(listing => likedListings.includes(listing.id))
    const locations = [...new Set(listings.map((listing) => listing.location))]

    const handleContactOwner = (listing: Listing) => {
        if (!user) {
            setAuthMode("signin")
            setShowAuthModal(true)
        } else {
            setMessageTarget({
                ownerId: listing.user_id,
                ownerUsername: listing.user_username,
                listingId: listing.id
            })
            setMessageModalOpen(true)
        }
    }

    const handleLikeListing = (listingId: number) => {
        if (!user) {
            setAuthMode("signin")
            setShowAuthModal(true)
            return
        }
        
        setLikedListings(prev => 
            prev.includes(listingId) 
                ? prev.filter(id => id !== listingId)
                : [...prev, listingId]
        )
    }

    const sendMessageToOwner = async () => {
        if (!messageTarget || !messageText.trim()) return
        setMessageSending(true)
        setMessageError(null)
        try {
            await messagesApi.sendMessage({
                text: messageText,
                listing_id: messageTarget.listingId,
                receiver_id: messageTarget.ownerId
            })
            setMessageSent(true)
            setMessageText("")
            setTimeout(() => {
                setMessageModalOpen(false)
                setMessageSent(false)
            }, 1200)
        } catch (err) {
            setMessageError("Failed to send message")
        } finally {
            setMessageSending(false)
        }
    }

    const renderListings = (listings: Listing[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                        <img
                            src={listing.images[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%239ca3af'%3ENo Image Available%3C/text%3E%3C/svg%3E"}
                            alt={listing.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Badge className="absolute top-4 right-4 bg-green-500">
                            Available {new Date(listing.available_from).toLocaleDateString()}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`absolute top-4 left-4 w-8 h-8 p-0 rounded-full ${
                                likedListings.includes(listing.id) 
                                    ? "bg-red-500 text-white hover:bg-red-600" 
                                    : "bg-white/80 hover:bg-white"
                            }`}
                            onClick={() => handleLikeListing(listing.id)}
                        >
                            <Heart className={`w-4 h-4 ${likedListings.includes(listing.id) ? "fill-current" : ""}`} />
                        </Button>
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
                            onClick={() => handleContactOwner(listing)}
                        >
                            {user ? "Contact Owner" : "Sign In to Contact"}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    const renderTabContent = () => {
        switch (activeTab) {
            case "browse":
                return (
                    <div>
                        {user && (
                            <div className="mb-4 flex justify-end">
                                <Link href="/add-listing">
                                    <Button className="bg-blue-600 hover:bg-blue-700">+ Add Listing</Button>
                                </Link>
                            </div>
                        )}
                        <div className="mb-6">
                            <p className="text-gray-600">
                                {listings.length} listing{listings.length !== 1 ? "s" : ""} available
                            </p>
                        </div>
                        {renderListings(listings)}
                    </div>
                )
            case "search":
                return (
                    <div>
                        {user && (
                            <div className="mb-4 flex justify-end">
                                <Link href="/add-listing">
                                    <Button className="bg-blue-600 hover:bg-blue-700">+ Add Listing</Button>
                                </Link>
                            </div>
                        )}
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

                        <div className="mb-6">
                            <p className="text-gray-600">
                                {listings.length} listing{listings.length !== 1 ? "s" : ""} found
                            </p>
                        </div>

                        {listings.length > 0 ? (
                            renderListings(listings)
                        ) : (
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
                )
            case "liked":
                return (
                    <div>
                        <div className="mb-6">
                            <p className="text-gray-600">
                                {likedListingsData.length} liked listing{likedListingsData.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        {likedListingsData.length > 0 ? (
                            renderListings(likedListingsData)
                        ) : (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No liked listings yet</h3>
                                    <p className="text-gray-600">
                                        Start browsing and like listings to see them here.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen">
            <Navigation />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-lg p-1 shadow-sm">
                            <div className="flex space-x-1">
                                <Button
                                    variant={"ghost"}
                                    onClick={() => router.push("/swipe")}
                                    className="flex items-center space-x-2"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Swipe</span>
                                </Button>
                                <Button
                                    variant={activeTab === "search" ? "default" : "ghost"}
                                    onClick={() => setActiveTab("search")}
                                    className="flex items-center space-x-2"
                                >
                                    <Search className="w-4 h-4" />
                                    <span>Search</span>
                                </Button>
                                <Button
                                    variant={activeTab === "liked" ? "default" : "ghost"}
                                    onClick={() => setActiveTab("liked")}
                                    className="flex items-center space-x-2"
                                >
                                    <Star className="w-4 h-4" />
                                    <span>Liked ({likedListings.length})</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {renderTabContent()}
                </div>
            </div>

            <AuthModal 
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultMode={authMode}
            />

            <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Message Owner</DialogTitle>
                    </DialogHeader>
                    {messageTarget && (
                        <div>
                            <div className="mb-2 text-sm text-gray-700">To: <span className="font-semibold">{messageTarget.ownerUsername}</span></div>
                            <Textarea
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                placeholder="Type your message..."
                                rows={4}
                                className="mb-2"
                            />
                            {messageError && <div className="text-red-600 text-sm mb-2">{messageError}</div>}
                            {messageSent ? (
                                <div className="text-green-600 text-sm mb-2">Message sent!</div>
                            ) : (
                                <Button onClick={sendMessageToOwner} disabled={messageSending || !messageText.trim()}>
                                    {messageSending ? "Sending..." : "Send Message"}
                                </Button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}