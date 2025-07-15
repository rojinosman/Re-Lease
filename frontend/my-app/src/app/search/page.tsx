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

export default function SearchPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [filteredListings, setFilteredListings] = useState<Listing[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [location, setLocation] = useState("")
    const [bedrooms, setBedrooms] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch listings from API
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setIsLoading(true)
                const data = await listingsApi.getListings()
                setListings(data)
                setFilteredListings(data)
                setError(null)
            } catch {
                setError('Failed to fetch listings')
            } finally {
                setIsLoading(false)
            }
        }

        fetchListings()
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

    const handleContactOwner = async (listing: Listing) => {
        try {
            // This would open a modal or navigate to messages
            console.log('Contacting owner for listing:', listing.id)
            // You can implement the contact functionality here
        } catch {
            console.error('Failed to contact owner')
        }
    }

    const locations = Array.from(new Set(listings.map(listing => listing.location)))

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
                        <h1 className="text-3xl font-bold text-gray-800 mb-8">Search Listings</h1>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

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
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}