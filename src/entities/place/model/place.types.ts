export enum PlaceCategory {
  Food = 0,
  Accommodation = 1,
  Culture = 2,
  Nature = 3,
  Entertainment = 4,
  Shopping = 5,
  Transport = 6,
  Services = 7
}

export enum PlaceType {
  // Food
  Restaurant = 0,
  Cafe = 1,
  Bar = 2,
  FastFood = 3,
  Bakery = 4,
  // Accommodation
  Hotel = 100,
  Hostel = 101,
  Apartment = 102,
  Guesthouse = 103,
  Resort = 104,
  // Culture
  Museum = 200,
  Gallery = 201,
  Theater = 202,
  Monument = 203,
  Library = 204,
  // Nature
  Park = 300,
  Beach = 301,
  Mountain = 302,
  Forest = 303,
  Lake = 304,
  // Entertainment
  Cinema = 400,
  NightClub = 401,
  Casino = 402,
  AmusementPark = 403,
  Zoo = 404,
  // Shopping
  ShoppingMall = 500,
  Market = 501,
  Boutique = 502,
  Supermarket = 503,
  // Transport
  Airport = 600,
  TrainStation = 601,
  BusStation = 602,
  Port = 603,
  // Services
  Hospital = 700,
  Bank = 701,
  PostOffice = 702,
  TouristInfo = 703
}

export enum MoodType {
  // С кем
  WithCompany = 0,
  Solo = 1,
  WithFamily = 2,
  RomanticDate = 3,
  Corporate = 4,
  // Вайб
  Special = 10,
  Calm = 11,
  Surprise = 12,
  Active = 13,
  Cultural = 14,
  Foodie = 15,
  NightOut = 16,
  Nature = 17
}

// ── Additional Info типы по категории ──

export interface FoodPlaceInfo {
  cuisine?: string
  priceRange?: string        // "$" | "$$" | "$$$"
  hasDelivery?: boolean
  hasTakeaway?: boolean
  hasDineIn?: boolean
  openingHours?: string
  phoneNumber?: string
  website?: string
  hasWifi?: boolean
  seatingCapacity?: number
}

export interface AccommodationPlaceInfo {
  stars?: number
  pricePerNight?: string
  hasPool?: boolean
  hasParking?: boolean
  hasBreakfast?: boolean
  checkIn?: string
  checkOut?: string
  phoneNumber?: string
  website?: string
}

export interface CulturePlaceInfo {
  openingHours?: string
  entryFee?: string
  hasAudioGuide?: boolean
  hasGuidedTours?: boolean
  languages?: string[]
  phoneNumber?: string
  website?: string
  accessibleForDisabled?: boolean
}

export interface NaturePlaceInfo {
  area?: string
  hasBoatRental?: boolean
  hasBikeRental?: boolean
  hasPlayground?: boolean
  hasBBQZone?: boolean
  openingHours?: string
  entryFee?: string
  hasCafe?: boolean
  petFriendly?: boolean
}

export interface EntertainmentPlaceInfo {
  openingHours?: string
  phoneNumber?: string
  website?: string
  pricePerPerson?: string
  minGroupSize?: number
  maxGroupSize?: number
  durationMinutes?: number
  ageRestriction?: number
}

export type PlaceAdditionalInfo =
  | FoodPlaceInfo
  | AccommodationPlaceInfo
  | CulturePlaceInfo
  | NaturePlaceInfo
  | EntertainmentPlaceInfo

// ── Основной DTO ──

export interface PlaceDto {
  placeId: number
  name: string
  description?: string
  countryCode: string
  city: string
  address?: string
  latitude?: number
  longitude?: number
  category: PlaceCategory
  placeType: PlaceType
  averageRating: number
  reviewsCount: number
  savesCount: number
  viewsCount?: number
  moods: MoodType[]
  imageUrls: string[]
  coverImageUrl?: string
  additionalInfo?: PlaceAdditionalInfo
  createdAt: string
}

// ── Запрос для списка ──

export interface GetPlacesParams {
  pageNumber?: number
  pageSize?: number
  city?: string
  countryCode?: string
  category?: number        // ← было string, должен быть number
  placeType?: number
  mood?: string            // ← строка "WithCompany"
  categoryTagId?: number
  sortBy?: string          // ← не было
}

export interface PaginatedList<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}


export interface PostDto {
  postId:               number
  userId:               number
  username:             string
  userProfilePicture?:  string
  placeId?:             number
  title?:               string
  content:              string
  imageUrls:            string[]
  likesCount:           number
  createdAt:            string
  updatedAt:            string
}