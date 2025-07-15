"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { listingsApi, type Listing } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export default function HomePage() {
    const { user } = useAuth()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true)
                const data = await listingsApi.getListings({ limit: 6 })
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

    const handleSearch = async (searchTerm: string) => {
        try {
            setLoading(true)
            const data = await listingsApi.getListings({ 
                search: searchTerm,
                limit: 6 
            })
            setListings(data)
            setError(null)
        } catch (err) {
            setError('Failed to search listings')
            console.error('Error searching listings:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Navigation />
                
                <div className="container mx-auto px-4 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                            Find Your Perfect Home
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Discover amazing rental properties in your area. From cozy apartments to spacious houses, we&apos;ve got you covered.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search by location, price, or features..."
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch(e.currentTarget.value)
                                        }
                                    }}
                                />
                                <Button onClick={() => {
                                    const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
                                    if (input) handleSearch(input.value)
                                }}>
                                    Search
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Featured Listings */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Listings</h2>
                        
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        
                        {error && (
                            <div className="text-center py-8">
                                <p className="text-red-600 mb-4">{error}</p>
                                <Button onClick={() => window.location.reload()}>Try Again</Button>
                            </div>
                        )}
                        
                        {!loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>{listing.bedrooms} bed</span>
                                                <span>{listing.bathrooms} bath</span>
                                                <span>{listing.views} views</span>
                                            </div>
                                            <p className="text-gray-700 mt-2 line-clamp-2">{listing.description}</p>
                                            <div className="mt-4 flex justify-between items-center">
                                                <span className="text-lg font-semibold text-blue-600">
                                                    ${listing.price}/month
                                                </span>
                                                <Button size="sm" onClick={() => window.location.href = `/search?id=${listing.id}`}>
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                        
                        {!loading && !error && listings.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">No listings found</p>
                                <Button onClick={() => window.location.href = '/search'}>
                                    Browse All Listings
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Call to Action */}
                    <div className="text-center bg-white rounded-lg p-8 shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Ready to Find Your Home?
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Join thousands of happy renters who found their perfect home through our platform. Start your search today!
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button size="lg" onClick={() => window.location.href = '/search'}>
                                Browse Listings
                            </Button>
                            {user && (
                                <Button size="lg" variant="outline" onClick={() => window.location.href = '/add-listing'}>
                                    Add Your Listing
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}