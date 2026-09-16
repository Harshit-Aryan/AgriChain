const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: RegisterData) =>
      request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    profile: () => request<User>('/auth/profile'),
  },
  products: {
    list: () => request<Product[]>('/products'),
  },
  farmers: {
    profile: () => request<FarmerProfile>('/farmers/profile'),
    fpoProfile: () => request<FPOProfile>('/farmers/fpo/profile'),
    listings: () => request<ProduceListing[]>('/farmers/listings'),
    createListing: (data: CreateListingData) =>
      request<ProduceListing>('/farmers/listings', { method: 'POST', body: JSON.stringify(data) }),
    demands: () => request<Demand[]>('/farmers/demands'),
    matching: () => request<SupplierMatch[]>('/farmers/matching'),
    orders: () => request<OrderItem[]>('/farmers/orders'),
    earnings: () => request<EarningsData>('/farmers/earnings'),
    reliability: () => request<ReliabilityData>('/farmers/reliability'),
  },
  buyers: {
    profile: () => request<BuyerProfile>('/buyers/profile'),
    demands: () => request<Demand[]>('/buyers/demands'),
    createDemand: (data: CreateDemandData) =>
      request<Demand>('/buyers/demands', { method: 'POST', body: JSON.stringify(data) }),
    supply: () => request<ProduceListing[]>('/buyers/supply'),
    orders: () => request<Order[]>('/buyers/orders'),
  },
  matching: {
    run: (demandId: string) => request<MatchingResult>(`/matching/demand/${demandId}`),
    results: (demandId: string) => request<MatchingResult>(`/matching/demand/${demandId}/results`),
    confirm: (demandId: string, matchIds: string[]) =>
      request<{ confirmed: number }>('/matching/confirm', { method: 'POST', body: JSON.stringify({ demandId, matchIds }) }),
  },
  orders: {
    create: (demandId: string, matchIds?: string[]) =>
      request<Order>('/orders', { method: 'POST', body: JSON.stringify({ demandId, matchIds }) }),
    get: (id: string) => request<Order>(`/orders/${id}`),
    priceBreakdown: (id: string) => request<PriceBreakdown>(`/orders/${id}/price-breakdown`),
    updateStatus: (id: string, status: string, note?: string) =>
      request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  },
  logistics: {
    profile: () => request<LogisticsProfile>('/logistics/profile'),
    jobs: () => request<LogisticsJob[]>('/logistics/jobs'),
    myJobs: () => request<LogisticsJob[]>('/logistics/jobs/my'),
    getJob: (id: string) => request<LogisticsJob>(`/logistics/jobs/${id}`),
    createJob: (orderId: string) =>
      request<LogisticsJob>('/logistics/jobs', { method: 'POST', body: JSON.stringify({ orderId }) }),
    assignJob: (jobId: string, providerId: string, vehicleId: string) =>
      request<LogisticsJob>(`/logistics/jobs/${jobId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ providerId, vehicleId }),
      }),
    updateStatus: (jobId: string, status: string) =>
      request<LogisticsJob>(`/logistics/jobs/${jobId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  forecast: {
    get: (product: string, location: string) =>
      request<ForecastData>(`/forecast/${encodeURIComponent(product)}/${encodeURIComponent(location)}`),
    all: () => request<ForecastData[]>('/forecast'),
  },
  analytics: {
    dashboard: () => request<AnalyticsDashboard>('/analytics/dashboard'),
  },
  routes: {
    optimize: (data: RouteOptimizeData) =>
      request<RouteResult>('/routes/optimize', { method: 'POST', body: JSON.stringify(data) }),
  },
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  farmer?: FarmerProfile;
  fpo?: FPOProfile;
  buyer?: BuyerProfile;
  logisticsProvider?: LogisticsProfile;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
  location?: string;
  company?: string;
  farmName?: string;
  fpoName?: string;
  buyerType?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
}

export interface FarmerProfile {
  id: string;
  farmName: string;
  location: string;
  reliabilityScore: number;
  user?: { name: string; email: string };
}

export interface FPOProfile {
  id: string;
  name: string;
  location: string;
  memberCount: number;
  reliabilityScore: number;
}

export interface BuyerProfile {
  id: string;
  company: string;
  buyerType: string;
  location: string;
}

export interface LogisticsProfile {
  id: string;
  company: string;
  location: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  type: string;
  registration: string;
  capacity: number;
  isAvailable: boolean;
}

export interface ProduceListing {
  id: string;
  quantity: number;
  availableQty: number;
  grade: string;
  expectedPrice: number;
  harvestDate: string;
  location: string;
  status: string;
  product: Product;
  farmer?: { user: { name: string } };
  fpo?: { name: string };
}

export interface CreateListingData {
  productId: string;
  quantity: number;
  grade: string;
  expectedPrice: number;
  harvestDate: string;
  location: string;
}

export interface Demand {
  id: string;
  quantity: number;
  grade: string;
  maxPrice: number;
  deliveryLocation: string;
  requiredBy: string;
  status: string;
  notes?: string;
  product: Product;
  buyer?: BuyerProfile;
  supplierMatches?: SupplierMatch[];
  orders?: Order[];
}

export interface CreateDemandData {
  productId: string;
  quantity: number;
  grade: string;
  maxPrice: number;
  deliveryLocation: string;
  requiredBy: string;
  notes?: string;
}

export interface SupplierMatch {
  id: string;
  allocatedQty: number;
  matchScore: number;
  priceScore: number;
  distanceScore: number;
  quantityScore: number;
  qualityScore: number;
  deliveryScore: number;
  reliabilityScore: number;
  isSelected: boolean;
  supplierName?: string;
  supplierType?: string;
  scoreBreakdown?: Record<string, number>;
  farmer?: { user: { name: string } };
  fpo?: { name: string };
  demand?: Demand;
}

export interface MatchingResult {
  demand: Demand;
  matches: SupplierMatch[];
  consolidation: {
    totalRequired: number;
    totalAllocated: number;
    shortage: number;
    supplierCount: number;
    isFullyMatched: boolean;
  };
  isEstimate: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalQuantity: number;
  totalAmount: number;
  logisticsCost: number;
  platformFee: number;
  pricePerKg: number;
  deliveryLocation: string;
  deliveryLat?: number;
  deliveryLng?: number;
  requiredBy: string;
  traditionalRealization?: number;
  platformRealization?: number;
  items?: OrderItemDetail[];
  logisticsJob?: LogisticsJob;
  payments?: Payment[];
  statusHistory?: StatusHistory[];
  demand?: Demand;
  buyer?: BuyerProfile;
}

export interface OrderItemDetail {
  id: string;
  productName: string;
  quantity: number;
  grade: string;
  pricePerKg: number;
  totalPrice: number;
  farmerPayout: number;
  farmer?: { user: { name: string } };
  fpo?: { name: string };
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  farmerPayout: number;
  order: Order;
}

export interface StatusHistory {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  platformFee: number;
  logisticsFee: number;
  farmerPayout: number;
  status: string;
  breakdown?: Record<string, unknown>;
}

export interface PriceBreakdown {
  orderId: string;
  orderNumber: string;
  totalQuantity: number;
  priceBreakdown: {
    buyerPaysPerKg: number;
    logisticsPerKg: number;
    platformFeePerKg: number;
    farmerRealizationPerKg: number;
    traditionalRealizationPerKg: number;
    estimatedSavingsPerKg: number;
  };
  totals: Record<string, number>;
  comparison: {
    traditional: number;
    platform: number;
    difference: number;
    label: string;
  };
  isEstimate: boolean;
}

export interface LogisticsJob {
  id: string;
  status: string;
  totalLoad: number;
  totalDistance?: number;
  estimatedCost?: number;
  consolidatedSaving?: number;
  separateTripsCost?: number;
  pickupSequence?: RoutePoint[];
  routePoints?: RoutePoint[];
  route?: RouteData;
  routeOptimization?: RouteResult;
  vehicle?: Vehicle;
  provider?: LogisticsProfile;
  order?: Order;
  isEstimate?: boolean;
}

export interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  load: number;
  type: string;
}

export interface RouteData {
  waypoints: RoutePoint[];
  totalDistance: number;
  estimatedTime: number;
  estimatedCost: number;
  vehicleCapacity: number;
}

export interface RouteOptimizeData {
  pickups: { name: string; lat?: number; lng?: number; load: number }[];
  delivery: { name: string; lat?: number; lng?: number; load: number };
  costPerKm?: number;
  vehicleCapacity?: number;
}

export interface RouteResult {
  points: RoutePoint[];
  totalDistance: number;
  estimatedTimeHours: number;
  estimatedCost: number;
  consolidatedSaving: number;
  separateTripsCost: number;
  totalLoad: number;
  vehicleCapacity: number;
  pickupSequence: string[];
  isEstimate: boolean;
}

export interface ForecastData {
  product: string;
  location: string;
  currentWeeklyDemand: number;
  predictedDemand: number;
  expectedChangePercent: number;
  potentialShortage: number;
  season: string;
  isEstimate: boolean;
  disclaimer: string;
}

export interface AnalyticsDashboard {
  summary: {
    totalFarmers: number;
    totalFPOs: number;
    totalBuyers: number;
    activeDemands: number;
    activeListings: number;
    activeOrders: number;
    totalTransactionValue: number;
    estimatedFarmerImprovement: number;
    estimatedLogisticsSavings: number;
    isEstimate: boolean;
  };
  charts: {
    demandTrend: { month: string; quantity: number }[];
    supplyVsDemand: { crop: string; demand: number; supply: number }[];
    ordersByCrop: { crop: string; count: number }[];
    regionalDemand: { region: string; quantity: number }[];
    farmerEarnings: { date: string; amount: number }[];
  };
  topDemandedCrops: { crop: string; quantity: number }[];
  supplyDemandGaps: { product: string; location: string; demand: number; shortage: number }[];
}

export interface EarningsData {
  totalEarnings: number;
  orderCount: number;
  orders: OrderItem[];
}

export interface ReliabilityData {
  score: number;
  onTimeRate: number;
  orderCompletion: number;
  qualityConsistency: number;
  cancellationRate: number;
  avgRating: number;
}

export function setAuth(token: string, user: User) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}
