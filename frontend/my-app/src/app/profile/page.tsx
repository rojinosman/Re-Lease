"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { listingsApi, type Listing } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function ProfilePage() {
    const { user } = useAuth()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUserListings = async () => {
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
            fetchUserListings()
        }
    }, [user])

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-xl font-semibold mb-4">You must be signed in to view your profile.</h2>
                        <Link href="/search">
                            <Button>Go to Search</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl">Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2"><span className="font-semibold">Username:</span> {user.username}</div>
                            <div className="mb-2"><span className="font-semibold">Email:</span> {user.email}</div>
                        </CardContent>
                    </Card>

                    <h2 className="text-xl font-bold mb-4">My Listings</h2>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : error ? (
                        <div className="text-center text-red-600 py-8">{error}</div>
                    ) : listings.length === 0 ? (
                        <Card className="text-center py-12 mb-8">
                            <CardContent>
                                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                                <p className="text-gray-600 mb-4">Create your first listing to start subleasing!</p>
                                <Link href="/add-listing">
                                    <Button>+ Add Listing</Button>
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
                                                    <span className="text-sm">{listing.location}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-500">{listing.status}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-2xl font-bold text-green-600">${listing.price}/mo</span>
                                            <div className="flex gap-4 text-sm text-gray-600">
                                                <span>{listing.bedrooms} bed</span>
                                                <span>{listing.bathrooms} bath</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                                            <span>{listing.views} views</span>
                                            <span>{listing.interested} interested</span>
                                        </div>
                                        <div className="text-gray-700 text-sm mb-2">{listing.description}</div>
                                        <Link href={`/edit-listing/${listing.id}`}>
                                            <Button size="sm" variant="outline">Edit Listing</Button>
                                        </Link>
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