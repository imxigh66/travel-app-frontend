export enum AccountType {
  Personal = 0,
  Business = 1
}

export enum TravelInterest {
  Nature = 0,
  Food = 1,
  Adventure = 2,
  Culture = 3,
  CityLife = 4,
  Relax = 5,
  Photography = 6
}

export enum TravelStyle {
  FoodSeeker = 0,
  CultureExplorer = 1,
  DigitalNomad = 2,
  Backpacker = 3,
  LuxuryTraveler = 4,
  SlowTraveler = 5,
  Adventurer = 6
}

export enum BusinessType {
  Hotel = 0,
  Restaurant = 1,
  Cafe = 2,
  TravelAgency = 3,
  TourOperator = 4,
  Coworking = 5,
  LocalGuide = 6,
  ExperienceProvider = 7
}

export interface User {
  userId: number;
  username: string;
  email: string;
  name: string;
  country?: string;
  city?: string;
  bio?: string;
  profilePicture?: string;
  accountType: AccountType;
  
  // Personal fields
  travelInterest?: TravelInterest;
  travelStyle?: TravelStyle;
  
  // Business fields
  businessType?: BusinessType;
  businessAddress?: string;
  businessWebsite?: string;
  businessPhone?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePersonalProfileData {
  username?: string;
  name?: string;
  country?: string;
  city?: string;
  bio?: string;
  profilePicture?: string;
  travelInterest?: TravelInterest;
  travelStyle?: TravelStyle;
}

export interface UpdateBusinessProfileData {
  username?: string;
  name?: string;
  country?: string;
  city?: string;
  bio?: string;
  profilePicture?: string;
  businessType?: BusinessType;
  businessAddress?: string;
  businessWebsite?: string;
  businessPhone?: string;
}