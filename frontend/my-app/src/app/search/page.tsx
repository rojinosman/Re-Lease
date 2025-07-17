"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { listingsApi, type Listing } from "@/lib/api"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { messagesApi } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Search as SearchIcon, Home, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { Heart as HeartIcon } from "lucide-react"

export default function SearchPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [listings, setListings] = useState<Listing[]>([])
    const [filteredListings, setFilteredListings] = useState<Listing[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [location, setLocation] = useState("")
    const [bedrooms, setBedrooms] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [messageModalOpen, setMessageModalOpen] = useState(false)
    const [messageTarget, setMessageTarget] = useState<Listing | null>(null)
    const [messageText, setMessageText] = useState("")
    const [messageSending, setMessageSending] = useState(false)
    const [messageSent, setMessageSent] = useState(false)
    const [messageError, setMessageError] = useState<string | null>(null)
    const [likedListings, setLikedListings] = useState<Listing[]>([])
    const [activeTab, setActiveTab] = useState<'search' | 'liked'>("search")
    const [likeLoadingId, setLikeLoadingId] = useState<number | null>(null)
    const [likeError, setLikeError] = useState<string | null>(null)

    // Fetch listings from API
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setIsLoading(true)
                const data = await listingsApi.getListings()
                // Only show listings not created by the current user and not already liked
                const filtered = user
                    ? data.filter(listing => listing.user_id !== user.id && !likedListings.some(l => l.id === listing.id))
                    : data.filter(listing => !likedListings.some(l => l.id === listing.id))
                setListings(filtered)
                setFilteredListings(filtered)
                setError(null)
            } catch {
                setError('Failed to fetch listings')
            } finally {
                setIsLoading(false)
            }
        }

        fetchListings()
    }, [user, likedListings])

    // Fetch liked listings on mount and whenever a like/unlike happens
    const fetchLikedListings = async () => {
        try {
            const liked = await listingsApi.getLikedListings()
            setLikedListings(liked)
        } catch {
            setLikedListings([])
        }
    }
    useEffect(() => {
        fetchLikedListings()
    }, [])

    // Apply filters
    useEffect(() => {
        let filtered = listings

        // Search term filter
        if (searchTerm) {
            filtered = filtered.filter(listing =>
                listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                listing.location.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Price filters
        if (minPrice) {
            filtered = filtered.filter(listing => listing.price >= parseFloat(minPrice))
        }
        if (maxPrice) {
            filtered = filtered.filter(listing => listing.price <= parseFloat(maxPrice))
        }

        // Location filter
        if (location && location !== "Any location") {
            filtered = filtered.filter(listing => listing.location === location)
        }

        // Bedrooms filter
        if (bedrooms) {
            filtered = filtered.filter(listing => listing.bedrooms === parseInt(bedrooms))
        }

        setFilteredListings(filtered)
    }, [listings, searchTerm, minPrice, maxPrice, location, bedrooms])

    const handleContactOwner = (listing: Listing) => {
        setMessageTarget(listing)
        setMessageModalOpen(true)
        setMessageText("")
        setMessageError(null)
        setMessageSent(false)
    }

    const sendMessageToOwner = async () => {
        if (!messageTarget || !messageText.trim()) return
        setMessageSending(true)
        setMessageError(null)
        try {
            await messagesApi.sendMessage({
                text: messageText,
                listing_id: messageTarget.id,
                receiver_id: messageTarget.user_id
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

    const isLiked = (listingId: number) => likedListings.some(l => l.id === listingId)

    const handleLike = async (listing: Listing) => {
        setLikeLoadingId(listing.id)
        setLikeError(null)
        setLikedListings(prev => [...prev, listing])
        try {
            await listingsApi.likeListing(listing.id)
            await fetchLikedListings()
        } catch {
            setLikedListings(prev => prev.filter(l => l.id !== listing.id))
            setLikeError('Failed to like listing. Please try again.')
        } finally {
            setLikeLoadingId(null)
        }
    }
    const handleUnlike = async (listing: Listing) => {
        setLikeLoadingId(listing.id)
        setLikeError(null)
        setLikedListings(prev => prev.filter(l => l.id !== listing.id))
        try {
            await listingsApi.unlikeListing(listing.id)
            await fetchLikedListings()
        } catch {
            setLikedListings(prev => [...prev, listing])
            setLikeError('Failed to unlike listing. Please try again.')
        } finally {
            setLikeLoadingId(null)
        }
    }

    const locations = Array.from(new Set(listings.map(listing => listing.location)))

    const TabBar = () => (
        <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
                <div className="flex space-x-1">
                    <Button
                        variant={"ghost"}
                        onClick={() => { setActiveTab("search"); router.push("/swipe") }}
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
                        <SearchIcon className="w-4 h-4" />
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
    )

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Navigation />
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Navigation />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <TabBar />
                        {activeTab === "liked" ? (
                            likedListings.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 mb-4">You have not liked any listings yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {likedListings.map((listing) => (
                                        <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                                            <CardHeader className="p-0">
                                                {listing.images && listing.images.length > 0 ? (
                                                    <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                                                        <Image
                                                            src={listing.images[0]}
                                                            alt={listing.title}
                                                            width={400}
                                                            height={200}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <Badge className="absolute top-2 right-2 bg-blue-500">
                                                            ${listing.price}/month
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                                        <span className="text-gray-500">No image available</span>
                                                    </div>
                                                )}
                                            </CardHeader>
                                            <CardContent className="p-4">
                                                <CardTitle className="text-lg mb-2">{listing.title}</CardTitle>
                                                <p className="text-gray-600 mb-2">{listing.location}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <span>{listing.bedrooms} bed</span>
                                                    <span>{listing.bathrooms} bath</span>
                                                    <span>{listing.views} views</span>
                                                </div>
                                                <p className="text-gray-700 mb-4 line-clamp-2">{listing.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold text-blue-600">
                                                        ${listing.price}/month
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant={isLiked(listing.id) ? "destructive" : "outline"}
                                                        onClick={() => isLiked(listing.id) ? handleUnlike(listing) : handleLike(listing)}
                                                        disabled={likeLoadingId === listing.id}
                                                    >
                                                        <HeartIcon className={isLiked(listing.id) ? "fill-red-500 text-red-500" : ""} />
                                                        {isLiked(listing.id) ? "Unlike" : "Like"}
                                                    </Button>
                                                </div>
                                                {likeError && <div className="text-red-600 text-xs mt-1">{likeError}</div>}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )
                        ) : (
                            <>
                                {/* Search and Filter Controls */}
                                <Card className="mb-8">
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                                <Input
                                                    placeholder="Search listings..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                    <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                                                <Input
                                                    type="number"
                                                    placeholder="Min price"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                />
                    </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                                                <Input
                                                    type="number"
                                                    placeholder="Max price"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                <select
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Any location</option>
                                                    {locations.map((loc) => (
                                                        <option key={loc} value={loc}>{loc}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                                <select
                                                    value={bedrooms}
                                                    onChange={(e) => setBedrooms(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Any</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4+</option>
                                                </select>
                    </div>
                    </div>
                </CardContent>
            </Card>

                                {/* Results */}
                                <div className="mb-4">
                <p className="text-gray-600">
                                        Found {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
                </p>
            </div>

            {filteredListings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 mb-4">No listings found matching your criteria</p>
                                        <Button onClick={() => {
                                            setSearchTerm("")
                                            setMinPrice("")
                                            setMaxPrice("")
                                            setLocation("")
                                            setBedrooms("")
                                        }}>
                                            Clear Filters
                    </Button>
                                    </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                                            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                                                <CardHeader className="p-0">
                                                    {listing.images && listing.images.length > 0 ? (
                                                        <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                                                            <Image
                                                                src={listing.images[0]}
                        alt={listing.title}
                                                                width={400}
                                                                height={200}
                                                                className="w-full h-full object-cover"
                        />
                                                            <Badge className="absolute top-2 right-2 bg-blue-500">
                                                                ${listing.price}/month
                                                            </Badge>
                    </div>
                                                    ) : (
                                                        <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                                            <span className="text-gray-500">No image available</span>
                        </div>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="p-4">
                                                    <CardTitle className="text-lg mb-2">{listing.title}</CardTitle>
                                                    <p className="text-gray-600 mb-2">{listing.location}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                        <span>{listing.bedrooms} bed</span>
                                                        <span>{listing.bathrooms} bath</span>
                                                        <span>{listing.views} views</span>
                        </div>
                                                    <p className="text-gray-700 mb-4 line-clamp-2">{listing.description}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-semibold text-blue-600">
                                                            ${listing.price}/month
                                                        </span>
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleContactOwner(listing)}
                                                        >
                                                            Contact Owner
                        </Button>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-4">
                                                        <span className="text-sm text-gray-500">
                                                            {isLiked(listing.id) ? "Liked" : "Like"}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant={isLiked(listing.id) ? "destructive" : "outline"}
                                                            onClick={() => isLiked(listing.id) ? handleUnlike(listing) : handleLike(listing)}
                                                            disabled={likeLoadingId === listing.id}
                                                        >
                                                            <HeartIcon className={isLiked(listing.id) ? "fill-red-500 text-red-500" : ""} />
                                                            {isLiked(listing.id) ? "Unlike" : "Like"}
                        </Button>
                        </div>
                                                    {likeError && <div className="text-red-600 text-xs mt-1">{likeError}</div>}
                    </CardContent>
                    </Card>
                ))}
                </div>
            )}
                            </>
                        )}
                        <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Message Owner</DialogTitle>
                                </DialogHeader>
                                {messageTarget && (
                                    <div>
                                        <div className="mb-2 text-sm text-gray-700">To: <span className="font-semibold">{messageTarget.user_username}</span></div>
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
        </div>
        </div>
        </ProtectedRoute>
    )
}