// Use environment variable for API base URL, fallback to production domain
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://moshandymanservices.org';

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  available_from: string;
  amenities: string[];
  images: string[];
  status: string;
  views: number;
  interested: number;
  created_at: string;
  updated_at: string | null;
  user_id: number;
  user_username: string;
}

export interface ListingCreate {
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  available_from: string;
  amenities: string[];
  images: string[];
}

export interface Message {
  id: number;
  text: string;
  sender_id: number;
  receiver_id: number;
  listing_id: number;
  is_read: boolean;
  created_at: string;
  sender_username: string;
  receiver_username: string;
}

export interface Conversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  listing_id: number;
  listing_title: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Listings API
export const listingsApi = {
  // Get all listings with optional filters
  async getListings(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    location?: string;
    bedrooms?: number;
  }): Promise<Listing[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/listings/?${searchParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }

    return response.json();
  },

  // Get a specific listing by ID
  async getListing(id: number): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch listing');
    }

    return response.json();
  },

  // Get user's own listings
  async getMyListings(): Promise<Listing[]> {
    const response = await fetch(`${API_BASE_URL}/listings/my/listings`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch my listings');
    }

    return response.json();
  },

  // Create a new listing
  async createListing(listing: ListingCreate): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(listing),
    });

    if (!response.ok) {
      throw new Error('Failed to create listing');
    }

    return response.json();
  },

  // Update a listing
  async updateListing(id: number, listing: Partial<ListingCreate>): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(listing),
    });

    if (!response.ok) {
      throw new Error('Failed to update listing');
    }

    return response.json();
  },

  // Delete a listing
  async deleteListing(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete listing');
    }
  },

  // Mark listing as interested
  async markAsInterested(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}/interested`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark listing as interested');
    }
  },
};

// Messages API
export const messagesApi = {
  // Get user conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/listings/messages/conversations`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return response.json();
  },

  // Get messages for a specific conversation
  async getConversationMessages(otherUserId: number, listingId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/listings/messages/${otherUserId}/${listingId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  },

  // Send a message
  async sendMessage(message: {
    text: string;
    listing_id: number;
    receiver_id: number;
  }): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/listings/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  // Mark messages as read
  async markMessagesAsRead(otherUserId: number, listingId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/listings/messages/${otherUserId}/${listingId}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark messages as read');
    }
  },
}; 