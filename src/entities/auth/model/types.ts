export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  accountType: AccountType;
  travelInterest: TravelInterest;
  travelStyle: TravelStyle;
}

export enum AccountType {
  Personal = 'Personal',
  Business = 'Business',
}

export enum TravelInterest {
  Nature = 'Nature',
  Food = 'Food',
  Adventure = 'Adventure',
  Culture = 'Culture',
  CityLife = 'CityLife',
  Relax = 'Relax',
  Photography = 'Photography',
}

export enum TravelStyle {
  FoodSeeker = 'FoodSeeker',
  CultureExplorer = 'CultureExplorer',
  DigitalNomad = 'DigitalNomad',
  Backpacker = 'Backpacker',
  LuxuryTraveler = 'LuxuryTraveler',
  SlowTraveler = 'SlowTraveler',
  Adventurer = 'Adventurer',
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;

  token?: string;
  jwt?: string;
}