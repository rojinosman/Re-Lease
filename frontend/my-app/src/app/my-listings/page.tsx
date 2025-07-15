"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin, Bed, Bath } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import Link from "next/link"
import { listingsApi, type Listing } from "@/lib/api"

    export default function MyListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch user's listings from API
    useEffect(() => {
        const fetchMyListings = async () => {
            try {
                setLoading(true)
                const data = await listingsApi.getMyListings()
                setListings(data)
                setError(null)
            } catch (err) {
                setError('Failed to fetch your listings')
                console.error('Error fetching my listings:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchMyListings()
    }, [])

    const handleDelete = async (id: number) => {
        try {
            await listingsApi.deleteListing(id)
            setListings(listings.filter((listing) => listing.id !== id))
        } catch (err) {
            console.error('Error deleting listing:', err)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
        case "active":
            return "bg-green-500"
        case "pending":
            return "bg-yellow-500"
        case "rented":
            return "bg-gray-500"
        default:
            return "bg-gray-500"
        }
    }

    const MyListingsContent = () => {
        if (loading) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Navigation />
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading your listings...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        if (error) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Navigation />
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl mx-auto">
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

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
                    <Link href="/add-listing">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Listing
                    </Button>
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <Card className="text-center py-12">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-4">No listings yet</h2>
                        <p className="text-gray-600 mb-6">Create your first listing to start subleasing!</p>
                        <Link href="/add-listing">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Listing
                        </Button>
                        </Link>
                    </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                    {listings.map((listing) => (
                        <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{listing.title}</CardTitle>
                                <div className="flex items-center text-gray-600 mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">{listing.location}</span>
                                </div>
                            </div>
                            <Badge className={getStatusColor(listing.status)}>{listing.status}</Badge>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-green-600">${listing.price}/mo</span>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                <Bed className="w-4 h-4 mr-1" />
                                {listing.bedrooms}
                                </div>
                                <div className="flex items-center">
                                <Bath className="w-4 h-4 mr-1" />
                                {listing.bathrooms}
                                </div>
                            </div>
                            </div>

                            <div className="flex justify-between text-sm text-gray-600 mb-4">
                            <span>{listing.views} views</span>
                            <span>{listing.interested} interested</span>
                            </div>

                            <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                onClick={() => handleDelete(listing.id)}
                            >
                                <Trash2 className="w-4 h-4" />
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
        )
    }

    return (
        <ProtectedRoute>
            <MyListingsContent />
        </ProtectedRoute>
    )
}