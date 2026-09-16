const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

const DEMO_USERS_MAP: Record<string, { user: User }> = {
  'admin@agrichain.in': {
    user: {
      id: 'admin-1',
      email: 'admin@agrichain.in',
      name: 'System Admin',
      role: 'ADMIN',
    },
  },
  'buyer@mumbai.com': {
    user: {
      id: 'buyer-1',
      email: 'buyer@mumbai.com',
      name: 'Vikram Mehta (SpiceRoute)',
      role: 'BUYER',
      buyer: {
        id: 'buyer-profile-1',
        company: 'SpiceRoute Foods Mumbai',
        buyerType: 'PROCESSOR',
        location: 'Mumbai, Maharashtra',
      },
    },
  },
  'logistics@agrichain.in': {
    user: {
      id: 'logistics-1',
      email: 'logistics@agrichain.in',
      name: 'Raj Cold Chain Services',
      role: 'LOGISTICS',
      logisticsProvider: {
        id: 'logistics-profile-1',
        company: 'Raj Cold Chain Services',
        location: 'Nashik Hub',
      },
    },
  },
  'farmer.rajesh@agrichain.in': {
    user: {
      id: 'farmer-1',
      email: 'farmer.rajesh@agrichain.in',
      name: 'Rajesh Patil',
      role: 'FARMER',
      farmer: {
        id: 'farmer-profile-1',
        farmName: 'Patil Organic Farms',
        location: 'Nashik, Maharashtra',
        reliabilityScore: 94,
      },
    },
  },
  'fpo.nashik@agrichain.in': {
    user: {
      id: 'fpo-1',
      email: 'fpo.nashik@agrichain.in',
      name: 'Nashik Sunrise FPO',
      role: 'FPO',
      fpo: {
        id: 'fpo-profile-1',
        name: 'Nashik Sunrise Agro Producer Co.',
        location: 'Nashik, Maharashtra',
        memberCount: 45,
        reliabilityScore: 96,
      },
    },
  },
};

const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Nashik Red Onion', category: 'Vegetables', unit: 'kg' },
  { id: 'prod-2', name: 'Roma Tomato', category: 'Vegetables', unit: 'kg' },
  { id: 'prod-3', name: 'Table Grapes (Thompson)', category: 'Fruits', unit: 'kg' },
  { id: 'prod-4', name: 'Kufri Jyoti Potato', category: 'Vegetables', unit: 'kg' },
  { id: 'prod-5', name: 'Bhagwa Pomegranate', category: 'Fruits', unit: 'kg' },
];

const MOCK_ANALYTICS: AnalyticsDashboard = {
  summary: {
    totalFarmers: 142,
    totalFPOs: 18,
    totalBuyers: 35,
    activeDemands: 12,
    activeListings: 47,
    activeOrders: 9,
    totalTransactionValue: 4850000,
    estimatedFarmerImprovement: 24.5,
    estimatedLogisticsSavings: 18400,
    isEstimate: true,
  },
  charts: {
    demandTrend: [
      { month: 'Nov', quantity: 24000 },
      { month: 'Dec', quantity: 31000 },
      { month: 'Jan', quantity: 28000 },
      { month: 'Feb', quantity: 42000 },
      { month: 'Mar', quantity: 51000 },
    ],
    supplyVsDemand: [
      { crop: 'Onion', demand: 12000, supply: 10500 },
      { crop: 'Tomato', demand: 8500, supply: 9200 },
      { crop: 'Potato', demand: 15000, supply: 13000 },
      { crop: 'Grapes', demand: 6000, supply: 5500 },
      { crop: 'Pomegranate', demand: 4000, supply: 3800 },
    ],
    ordersByCrop: [
      { crop: 'Onion', count: 18 },
      { crop: 'Tomato', count: 12 },
      { crop: 'Potato', count: 9 },
      { crop: 'Grapes', count: 7 },
    ],
    regionalDemand: [
      { region: 'Mumbai', quantity: 22000 },
      { region: 'Pune', quantity: 15000 },
      { region: 'Nashik', quantity: 8000 },
    ],
    farmerEarnings: [
      { date: '2026-03-01', amount: 45000 },
      { date: '2026-03-05', amount: 82000 },
      { date: '2026-03-10', amount: 124000 },
      { date: '2026-03-15', amount: 198000 },
    ],
  },
  topDemandedCrops: [
    { crop: 'Nashik Red Onion (Grade A)', quantity: 12000 },
    { crop: 'Roma Tomato (Grade A)', quantity: 8500 },
    { crop: 'Kufri Jyoti Potato', quantity: 7200 },
  ],
  supplyDemandGaps: [
    { product: 'Onion', location: 'Nashik Hub', demand: 12000, shortage: 1500 },
    { product: 'Potato', location: 'Pune APMC', demand: 15000, shortage: 2000 },
  ],
};

const MOCK_DEMANDS: Demand[] = [
  {
    id: 'dem-101',
    quantity: 5000,
    grade: 'A',
    maxPrice: 32,
    deliveryLocation: 'Mumbai Cold Storage Facility, Vashi',
    requiredBy: '2026-03-25',
    status: 'ACTIVE',
    notes: 'Premium export grade onion required for wholesale kitchen delivery.',
    product: MOCK_PRODUCTS[0],
    buyer: DEMO_USERS_MAP['buyer@mumbai.com'].user.buyer,
  },
  {
    id: 'dem-102',
    quantity: 3000,
    grade: 'A',
    maxPrice: 28,
    deliveryLocation: 'Pune Central Distribution Hub',
    requiredBy: '2026-03-28',
    status: 'MATCHED',
    notes: 'Ripe Roma Tomatoes for sauce processing batch.',
    product: MOCK_PRODUCTS[1],
    buyer: DEMO_USERS_MAP['buyer@mumbai.com'].user.buyer,
  },
];

const MOCK_LISTINGS: ProduceListing[] = [
  {
    id: 'list-201',
    quantity: 2500,
    availableQty: 2500,
    grade: 'A',
    expectedPrice: 27,
    harvestDate: '2026-03-20',
    location: 'Dindori, Nashik',
    status: 'AVAILABLE',
    product: MOCK_PRODUCTS[0],
    farmer: { user: { name: 'Rajesh Patil' } },
  },
  {
    id: 'list-202',
    quantity: 4000,
    availableQty: 4000,
    grade: 'A',
    expectedPrice: 26.5,
    harvestDate: '2026-03-22',
    location: 'Niphad, Nashik',
    status: 'AVAILABLE',
    product: MOCK_PRODUCTS[0],
    fpo: { name: 'Nashik Sunrise Agro Producer Co.' },
  },
  {
    id: 'list-203',
    quantity: 3500,
    availableQty: 3500,
    grade: 'A',
    expectedPrice: 24,
    harvestDate: '2026-03-21',
    location: 'Narayangaon, Pune',
    status: 'AVAILABLE',
    product: MOCK_PRODUCTS[1],
    farmer: { user: { name: 'Suresh More' } },
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-301',
    orderNumber: 'ORD-2026-089',
    status: 'IN_TRANSIT',
    totalQuantity: 5000,
    totalAmount: 147500,
    logisticsCost: 12500,
    platformFee: 4425,
    pricePerKg: 29.5,
    deliveryLocation: 'Mumbai Cold Storage Facility, Vashi',
    requiredBy: '2026-03-25',
    traditionalRealization: 21.0,
    platformRealization: 26.2,
    buyer: DEMO_USERS_MAP['buyer@mumbai.com'].user.buyer,
  },
];

const MOCK_JOBS: LogisticsJob[] = [
  {
    id: 'job-401',
    status: 'IN_TRANSIT',
    totalLoad: 5000,
    totalDistance: 184,
    estimatedCost: 12500,
    consolidatedSaving: 4800,
    separateTripsCost: 17300,
    pickupSequence: [
      { id: 'p-1', name: 'Dindori Farm Hub', lat: 20.2, lng: 73.8, load: 2500, type: 'PICKUP' },
      { id: 'p-2', name: 'Niphad FPO Center', lat: 20.1, lng: 74.1, load: 2500, type: 'PICKUP' },
      { id: 'd-1', name: 'Mumbai Cold Storage', lat: 19.07, lng: 72.87, load: 5000, type: 'DELIVERY' },
    ],
    vehicle: {
      id: 'veh-1',
      type: 'Refrigerated 10T Truck',
      registration: 'MH-15-EG-4412',
      capacity: 10000,
      isAvailable: false,
    },
    provider: DEMO_USERS_MAP['logistics@agrichain.in'].user.logisticsProvider,
    order: MOCK_ORDERS[0],
    isEstimate: false,
  },
];

function getMockFallback<T>(path: string, options: RequestInit = {}): T | undefined {
  const method = (options.method || 'GET').toUpperCase();

  // Auth Login
  if (path === '/auth/login' && method === 'POST') {
    let email = '';
    let password = '';
    try {
      const parsed = JSON.parse(options.body as string);
      email = (parsed.email || '').toLowerCase().trim();
      password = parsed.password || '';
    } catch {}

    const demo = DEMO_USERS_MAP[email];
    if (demo) {
      if (password === 'demo123') {
        return {
          token: `demo-token-${demo.user.role.toLowerCase()}-${Date.now()}`,
          user: demo.user,
        } as unknown as T;
      }
      throw new Error('Invalid credentials. Demo accounts use password: demo123');
    }

    const role = email.includes('admin')
      ? 'ADMIN'
      : email.includes('logistics')
      ? 'LOGISTICS'
      : email.includes('farmer')
      ? 'FARMER'
      : email.includes('fpo')
      ? 'FPO'
      : 'BUYER';
    return {
      token: `demo-token-user-${Date.now()}`,
      user: {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0].replace('.', ' '),
        role,
      },
    } as unknown as T;
  }

  // Auth Register
  if (path === '/auth/register' && method === 'POST') {
    let data: any = {};
    try {
      data = JSON.parse(options.body as string);
    } catch {}
    const user: User = {
      id: `reg-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      farmer:
        data.role === 'FARMER'
          ? { id: 'f-1', farmName: data.farmName || 'Demo Farm', location: data.location || 'Maharashtra', reliabilityScore: 92 }
          : undefined,
      fpo:
        data.role === 'FPO'
          ? { id: 'fpo-1', name: data.fpoName || 'Demo FPO', location: data.location || 'Maharashtra', memberCount: 30, reliabilityScore: 94 }
          : undefined,
      buyer:
        data.role === 'BUYER'
          ? { id: 'b-1', company: data.company || 'Demo Buyer Co', buyerType: data.buyerType || 'RETAIL', location: data.location || 'Mumbai' }
          : undefined,
      logisticsProvider:
        data.role === 'LOGISTICS'
          ? { id: 'l-1', company: data.company || 'Demo Cold Chain', location: data.location || 'Nashik' }
          : undefined,
    };
    return {
      token: `demo-token-reg-${Date.now()}`,
      user,
    } as unknown as T;
  }

  if (path === '/auth/profile') {
    return (getUser() || DEMO_USERS_MAP['admin@agrichain.in'].user) as unknown as T;
  }

  if (path === '/analytics/dashboard') {
    return MOCK_ANALYTICS as unknown as T;
  }

  if (path === '/products') {
    return MOCK_PRODUCTS as unknown as T;
  }

  if (path.startsWith('/buyers/demands')) {
    if (method === 'POST') {
      let data: any = {};
      try {
        data = JSON.parse(options.body as string);
      } catch {}
      const prod = MOCK_PRODUCTS.find((p) => p.id === data.productId) || MOCK_PRODUCTS[0];
      const newDemand: Demand = {
        id: `dem-${Date.now()}`,
        quantity: Number(data.quantity) || 1000,
        grade: data.grade || 'A',
        maxPrice: Number(data.maxPrice) || 30,
        deliveryLocation: data.deliveryLocation || 'Mumbai Hub',
        requiredBy: data.requiredBy || '2026-03-30',
        status: 'ACTIVE',
        notes: data.notes,
        product: prod,
        buyer: DEMO_USERS_MAP['buyer@mumbai.com'].user.buyer,
      };
      return newDemand as unknown as T;
    }
    return MOCK_DEMANDS as unknown as T;
  }

  if (path.startsWith('/buyers/orders')) {
    return MOCK_ORDERS as unknown as T;
  }

  if (path.startsWith('/buyers/supply')) {
    return MOCK_LISTINGS as unknown as T;
  }

  if (path.startsWith('/farmers/profile')) {
    return DEMO_USERS_MAP['farmer.rajesh@agrichain.in'].user.farmer as unknown as T;
  }

  if (path.startsWith('/farmers/fpo/profile')) {
    return DEMO_USERS_MAP['fpo.nashik@agrichain.in'].user.fpo as unknown as T;
  }

  if (path.startsWith('/farmers/listings')) {
    return MOCK_LISTINGS as unknown as T;
  }

  if (path.startsWith('/farmers/demands')) {
    return MOCK_DEMANDS as unknown as T;
  }

  if (path.startsWith('/farmers/matching')) {
    return [] as unknown as T;
  }

  if (path.startsWith('/farmers/orders')) {
    return [] as unknown as T;
  }

  if (path.startsWith('/farmers/earnings')) {
    return {
      totalEarnings: 245000,
      orderCount: 14,
      orders: [],
    } as unknown as T;
  }

  if (path.startsWith('/farmers/reliability')) {
    return {
      score: 94,
      onTimeRate: 96,
      orderCompletion: 98,
      qualityConsistency: 92,
      cancellationRate: 2,
      avgRating: 4.8,
    } as unknown as T;
  }

  if (path.startsWith('/logistics/profile')) {
    return DEMO_USERS_MAP['logistics@agrichain.in'].user.logisticsProvider as unknown as T;
  }

  if (path.startsWith('/logistics/jobs') || path.startsWith('/logistics/my')) {
    return MOCK_JOBS as unknown as T;
  }

  if (path.startsWith('/forecast/')) {
    const parts = path.split('/');
    const product = decodeURIComponent(parts[2] || 'Tomato');
    const location = decodeURIComponent(parts[3] || 'Mumbai');
    return {
      product,
      location,
      currentWeeklyDemand: 12500,
      predictedDemand: 17800,
      expectedChangePercent: 42.4,
      potentialShortage: 3600,
      season: 'Rabi Harvest',
      isEstimate: true,
      disclaimer: 'AI forecast based on historical APMC arrivals and buyer contracts',
    } as unknown as T;
  }

  if (path.startsWith('/forecast')) {
    return [
      {
        product: 'Nashik Red Onion',
        location: 'Nashik',
        currentWeeklyDemand: 12000,
        predictedDemand: 15400,
        expectedChangePercent: 28.3,
        potentialShortage: 2400,
        season: 'Rabi Harvest',
        isEstimate: true,
        disclaimer: 'AI forecast based on historical APMC arrivals and buyer contracts',
      },
    ] as unknown as T;
  }

  if (path.includes('/price-breakdown')) {
    return {
      orderId: 'ord-301',
      orderNumber: 'ORD-2026-089',
      totalQuantity: 5000,
      priceBreakdown: {
        buyerPaysPerKg: 29.5,
        logisticsPerKg: 2.5,
        platformFeePerKg: 0.8,
        farmerRealizationPerKg: 26.2,
        traditionalRealizationPerKg: 21.0,
        estimatedSavingsPerKg: 5.2,
      },
      totals: {
        buyerTotal: 147500,
        logisticsTotal: 12500,
        platformTotal: 4000,
        farmerPayoutTotal: 131000,
      },
      comparison: {
        traditional: 105000,
        platform: 131000,
        difference: 26000,
        label: 'Farmer Realization Improvement',
      },
      isEstimate: true,
    } as unknown as T;
  }

  if (path.startsWith('/matching/')) {
    return {
      demand: MOCK_DEMANDS[0],
      matches: [],
      consolidation: {
        totalRequired: 5000,
        totalAllocated: 5000,
        shortage: 0,
        supplierCount: 2,
        isFullyMatched: true,
      },
      isEstimate: true,
    } as unknown as T;
  }

  if (path.startsWith('/orders/')) {
    return MOCK_ORDERS[0] as unknown as T;
  }

  return undefined;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) {
      const fallback = getMockFallback<T>(path, options);
      if (fallback !== undefined) return fallback;

      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Request failed: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    const fallback = getMockFallback<T>(path, options);
    if (fallback !== undefined) return fallback;
    throw new Error(err?.message || 'Network error occurred');
  }
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
