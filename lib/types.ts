export type User = {
  sub: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STAFF';
  /** Present on POST /auth/login; same JWT as httpOnly cookie (for API tools). */
  accessToken?: string;
};

export type AvailabilitySearchResponse = {
  roomTypes: RoomType[];
  meta: {
    checkInDate: string;
    checkOutDate: string;
    roomsRequested: number;
    totalRoomTypesMatched: number;
    hint?: string;
  };
};

export type RoomType = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number | string;
  amenities: string[];
  availableCount?: number;
  _count?: { rooms: number };
  rooms?: Array<{
    id: string;
    roomNumber: string;
    floor: number;
    housekeepingStatus?: string;
  }>;
};

export type Room = {
  id: string;
  roomNumber: string;
  floor: number;
  housekeepingStatus: string;
  roomTypeId: string;
  roomType: RoomType;
};

export type Reservation = {
  id: string;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  notes?: string | null;
  totalAmount: number | string;
  status: string;
  paytabsTranRef?: string | null;
  guest: Guest;
  reservationRooms: Array<{
    id: string;
    roomId: string;
    room: Room;
  }>;
};

/** POST /reservations/public when `withPayment: true` and PayTabs is configured */
export type PublicReservationResponse = Reservation & {
  payment?: { redirectUrl: string };
};

export type PaymentsConfig = {
  paytabs: boolean;
};

export type Guest = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  idNumber?: string | null;
  createdAt: string;
  reservations?: Reservation[];
};

export type DashboardSummary = {
  kpis: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    arrivalsToday: number;
    departuresToday: number;
    activeReservations: number;
    occupancyRate: number;
    monthRevenue: number;
  };
  recentReservations: Reservation[];
};
