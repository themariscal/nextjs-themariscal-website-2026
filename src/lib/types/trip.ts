export interface TripFormData {
  country: string;
  originCity: string;
  travelStyle: string;
  interest: string;
  budget: string;
  duration: number;
  groupType: string;
}

export interface Country {
  name: string;
  coordinates: [number, number];
  value: string;
  openStreetMap?: string;
}

export interface TripActivity {
  time: string;
  description: string;
  place?: string;
}

export interface TripDay {
  day: number;
  location: string;
  activities: TripActivity[];
}

export interface TripLocation {
  city: string;
  coordinates: [number, number];
  openStreetMap: string;
}

export interface PriceBreakdown {
  accommodation: string;
  food: string;
  transportation: string;
  activities: string;
  miscellaneous: string;
}

export interface PlaceRecommendation {
  name: string;
  type?: string;
  cuisine?: string;
  priceRange?: string;
  description: string;
  googleMapsLink: string;
}

export interface Recommendations {
  accommodation: PlaceRecommendation[];
  restaurants: PlaceRecommendation[];
  attractions: PlaceRecommendation[];
  activities: PlaceRecommendation[];
}

export interface Trip {
  name: string;
  description: string;
  estimatedPrice: string;
  priceBreakdown: PriceBreakdown;
  duration: number;
  budget: string;
  travelStyle: string;
  country: string;
  interests: string[];
  groupType: string;
  bestTimeToVisit: string[];
  weatherInfo: string[];
  location: TripLocation;
  itinerary: TripDay[];
  recommendations: Recommendations;
}

export interface CreateTripResponse {
  id: string;
}

export interface TripCardProps {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  tags: string[];
  price: string;
}
