"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { listingsApi, type Listing } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export default function MyListingsPage() {
    const { user } = useAuth()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMyListings = async () => {
            try {
                setLoading(true)
                const data = await listingsApi.getMyListings()
                setListings(data)
                setError(null)
            } catch {
                setError('Failed to fetch your listings')
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchMyListings()
        }
    }, [user])

    const handleDeleteListing = async (listingId: number) => {
        if (!confirm('Are you sure you want to delete this listing?')) {
            return
        }

        try {
            await listingsApi.deleteListing(listingId)
            setListings(listings.filter(listing => listing.id !== listingId))
        } catch {
            alert('Failed to delete listing')
        }
    }

    if (!user) {
        return (
            <ProtectedRoute>
                <div>Loading...</div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Navigation />
                
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
                            <Button onClick={() => window.location.href = '/add-listing'}>
                                Add New Listing
                            </Button>
                        </div>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        
                        {!loading && !error && listings.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">You haven&apos;t created any listings yet</p>
                                <Button onClick={() => window.location.href = '/add-listing'}>
                                    Create Your First Listing
                                </Button>
                            </div>
                        )}
                        
                        {!loading && !error && listings.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((listing) => (
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
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => window.location.href = `/search?id=${listing.id}`}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive"
                                                        onClick={() => handleDeleteListing(listing.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
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