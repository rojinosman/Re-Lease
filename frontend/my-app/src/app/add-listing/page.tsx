"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Navigation } from "@/components/navigation"
import { useRouter } from "next/navigation"
import { listingsApi } from "@/lib/api"
import Image from 'next/image'

export default function AddListingPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        location: "",
        bedrooms: "",
        bathrooms: "",
        description: "",
        available: "",
        amenities: [] as string[],
        images: [] as string[],
    })

    const amenityOptions = ["WiFi", "Parking", "Kitchen", "Laundry", "Gym", "Pool", "Air Conditioning", "Heating"]

    const handleAmenityChange = (amenity: string, checked: boolean) => {
        setFormData((prev) => ({
        ...prev,
        amenities: checked ? [...prev.amenities, amenity] : prev.amenities.filter((a) => a !== amenity),
        }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            const newImages: string[] = []
            Array.from(files).forEach(file => {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const target = event.target as FileReader
                    if (target && target.result) {
                        newImages.push(target.result as string)
                        setFormData((prev) => ({ ...prev, images: [...prev.images, target.result as string] }))
                    }
                }
                reader.readAsDataURL(file)
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const listingData = {
                ...formData,
                price: parseFloat(formData.price),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseFloat(formData.bathrooms),
                available_from: new Date(formData.available).toISOString(),
            }
            await listingsApi.createListing(listingData)
            router.push("/my-listings")
        } catch (err) {
            console.error('Error creating listing:', err)
            // You might want to show an error message to the user here
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                <CardTitle className="text-2xl">Add New Listing</CardTitle>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                        id="title"
                        placeholder="e.g., Cozy Studio Near Campus"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <Label htmlFor="price">Monthly Rent ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="800"
                            value={formData.price}
                            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                            required
                        />
                        </div>
                        <div>
                        <Label htmlFor="available">Available From</Label>
                        <Input
                            id="available"
                            type="date"
                            value={formData.available}
                            onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.value }))}
                            required
                        />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                        id="location"
                        placeholder="e.g., University District"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                        required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, bedrooms: value }))}>
                            <SelectTrigger>
                            <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                        <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, bathrooms: value }))}>
                            <SelectTrigger>
                            <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="1.5">1.5</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="2.5">2.5</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>
                    <div>
                        <Label>Images</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                        />
                        {formData.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <Image
                                            src={image}
                                            alt={`Listing image ${index + 1}`}
                                            width={200}
                                            height={150}
                                            className="rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <Label>Amenities</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                        {amenityOptions.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                                id={amenity}
                                checked={formData.amenities.includes(amenity)}
                                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                            />
                            <Label htmlFor={amenity} className="text-sm">
                                {amenity}
                            </Label>
                            </div>
                        ))}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                        id="description"
                        placeholder="Describe your place, neighborhood, and what makes it special..."
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        required
                        />
                    </div>
                    </div>
                    <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                        Create Listing
                    </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
            </div>
        </div>
        </div>
    )
}