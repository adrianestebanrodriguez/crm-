export interface Burger {
  id: string;
  name: string;
  tagline: string;
  price: number;
  category: 'Smash' | 'Gourmet' | 'Clásica' | 'Spicy' | 'Veggie';
  description: string;
  badgeColor: string;
  markerColor: string;
  image?: string;
}

export interface OrderItem {
  burgerId: string;
  burgerName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string; // Ticket e.g., "TK-9402"
  timestamp: string; // ISO string
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'Tarjeta' | 'Efectivo' | 'Transferencia' | 'Online';
  notes?: string;
}

export interface CustomerCoordinates {
  lat: number;
  lng: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zone: string;
  birthDate: string; // YYYY-MM-DD
  coordinates: CustomerCoordinates;
  orders: Order[];
  createdAt: string;
  notes?: string;
}

export interface TopProductStats {
  burgerId: string;
  burgerName: string;
  count: number;
  percentage: number;
  totalSpentOnProduct: number;
}

export interface PromotionRecommendation {
  id: string;
  title: string;
  badge: string;
  description: string;
  couponCode: string;
  discountValue: string;
  reason: string;
  whatsappMessage: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
}

export interface CustomerAnalytics {
  totalOrders: number;
  totalSpent: number;
  averageTicket: number;
  topProducts: TopProductStats[];
  favoriteBurgerId: string;
  favoriteBurgerName: string;
  dayFrequency: { [dayName: string]: number };
  hourFrequency: { [hour: number]: number };
  peakDay: string;
  peakHourSlot: string;
  lastOrderDate: string | null;
  daysSinceLastOrder: number | null;
  isBirthdayThisMonth: boolean;
  daysUntilBirthday: number;
  customerSegment: 'VIP High-Ticket' | 'Cliente Frecuente' | 'Ocasional' | 'En Riesgo (>35d)' | 'Nuevo';
  recommendedPromotions: PromotionRecommendation[];
}

export interface KitchenStats {
  totalCustomers: number;
  totalOrders: number;
  globalAverageTicket: number;
  topSellingBurger: { name: string; totalUnits: number };
  peakHours: string;
  activeCustomersCount: number;
  atRiskCustomersCount: number;
}
