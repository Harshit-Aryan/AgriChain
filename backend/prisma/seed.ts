import { PrismaClient, UserRole, QualityGrade, BuyerType, VehicleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const LOCATIONS = {
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Delhi: { lat: 28.6139, lng: 77.209 },
};

async function main() {
  console.log('Seeding AgriChain database...');
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.route.deleteMany();
  await prisma.logisticsJob.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.supplierMatch.deleteMany();
  await prisma.demand.deleteMany();
  await prisma.produceListing.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.demandForecast.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.fPOMember.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.fPO.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.logisticsProvider.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('demo123', 10);

  const products = await Promise.all(
    ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Maize', 'Soybean'].map((name) =>
      prisma.product.create({
        data: {
          name,
          category: ['Tomato', 'Onion', 'Potato'].includes(name) ? 'Vegetables' : 'Grains',
          unit: 'kg',
        },
      }),
    ),
  );
  const tomato = products.find((p) => p.name === 'Tomato')!;

  const _admin = await prisma.user.create({
    data: { email: 'admin@agrichain.in', passwordHash: hash, name: 'System Admin', role: UserRole.ADMIN, phone: '9876543210' },
  });

  const buyerUser = await prisma.user.create({
    data: { email: 'buyer@mumbai.com', passwordHash: hash, name: 'Vikram Mehta', role: UserRole.BUYER, phone: '9823456789' },
  });
  const buyer = await prisma.buyer.create({
    data: {
      userId: buyerUser.id,
      company: 'SpiceRoute Restaurant Chain',
      buyerType: BuyerType.RESTAURANT,
      location: 'Mumbai',
      latitude: LOCATIONS.Mumbai.lat,
      longitude: LOCATIONS.Mumbai.lng,
      address: 'BKC, Bandra Kurla Complex, Mumbai 400051',
    },
  });

  const fpoAUser = await prisma.user.create({
    data: { email: 'fpo.nashik@agrichain.in', passwordHash: hash, name: 'Sunrise FPO', role: UserRole.FPO, phone: '9876500001' },
  });
  const fpoA = await prisma.fPO.create({
    data: {
      userId: fpoAUser.id,
      name: 'Nashik Sunrise FPO',
      location: 'Nashik',
      latitude: LOCATIONS.Nashik.lat,
      longitude: LOCATIONS.Nashik.lng,
      state: 'Maharashtra',
      memberCount: 45,
      reliabilityScore: 92,
      totalOrders: 120,
      completedOrders: 118,
      onTimeRate: 96,
      qualityRate: 91,
      cancellationRate: 2,
      avgRating: 4.6,
    },
  });

  const fpoBUser = await prisma.user.create({
    data: { email: 'fpo.pune@agrichain.in', passwordHash: hash, name: 'Sahyadri FPO', role: UserRole.FPO, phone: '9876500002' },
  });
  const fpoB = await prisma.fPO.create({
    data: {
      userId: fpoBUser.id,
      name: 'Pune Sahyadri FPO',
      location: 'Pune',
      latitude: LOCATIONS.Pune.lat,
      longitude: LOCATIONS.Pune.lng,
      state: 'Maharashtra',
      memberCount: 62,
      reliabilityScore: 87,
      totalOrders: 95,
      completedOrders: 91,
      onTimeRate: 93,
      qualityRate: 89,
      cancellationRate: 4,
      avgRating: 4.3,
    },
  });

  const farmerCUser = await prisma.user.create({
    data: { email: 'farmer.rajesh@agrichain.in', passwordHash: hash, name: 'Rajesh Patil', role: UserRole.FARMER, phone: '9876500003' },
  });
  const farmerC = await prisma.farmer.create({
    data: {
      userId: farmerCUser.id,
      farmName: 'Patil Organic Farm',
      location: 'Nashik',
      latitude: 19.95,
      longitude: 73.82,
      state: 'Maharashtra',
      district: 'Nashik',
      reliabilityScore: 84,
      totalOrders: 45,
      completedOrders: 42,
      onTimeRate: 91,
      qualityRate: 88,
      cancellationRate: 5,
      avgRating: 4.2,
    },
  });

  const farmerDUser = await prisma.user.create({
    data: { email: 'farmer.sunita@agrichain.in', passwordHash: hash, name: 'Sunita Deshmukh', role: UserRole.FARMER, phone: '9876500004' },
  });
  const farmerD = await prisma.farmer.create({
    data: {
      userId: farmerDUser.id,
      farmName: 'Deshmukh Vegetable Farm',
      location: 'Pune',
      latitude: 18.55,
      longitude: 73.88,
      state: 'Maharashtra',
      district: 'Pune',
      reliabilityScore: 81,
      totalOrders: 32,
      completedOrders: 29,
      onTimeRate: 88,
      qualityRate: 85,
      cancellationRate: 6,
      avgRating: 4.0,
    },
  });

  const extraFarmers = [
    { name: 'Anil Kulkarni', email: 'farmer.anil@agrichain.in', location: 'Nagpur' },
    { name: 'Priya Sharma', email: 'farmer.priya@agrichain.in', location: 'Indore' },
    { name: 'Mohammed Khan', email: 'farmer.khan@agrichain.in', location: 'Delhi' },
  ];
  for (const f of extraFarmers) {
    const u = await prisma.user.create({
      data: { email: f.email, passwordHash: hash, name: f.name, role: UserRole.FARMER },
    });
    const coords = LOCATIONS[f.location as keyof typeof LOCATIONS];
    await prisma.farmer.create({
      data: { userId: u.id, farmName: `${f.name.split(' ')[0]} Farm`, location: f.location, latitude: coords.lat, longitude: coords.lng, state: 'Maharashtra' },
    });
  }

  const logisticsUser = await prisma.user.create({
    data: { email: 'logistics@agrichain.in', passwordHash: hash, name: 'Raj Transport Services', role: UserRole.LOGISTICS, phone: '9876500005' },
  });
  const logistics = await prisma.logisticsProvider.create({
    data: { userId: logisticsUser.id, company: 'Raj Cold Chain Logistics', location: 'Mumbai', latitude: LOCATIONS.Mumbai.lat, longitude: LOCATIONS.Mumbai.lng, costPerKm: 28, rating: 4.5 },
  });
  const _truck = await prisma.vehicle.create({
    data: { providerId: logistics.id, type: VehicleType.TRUCK, registration: 'MH-04-AB-1234', capacity: 2500, costPerKm: 28, currentLat: LOCATIONS.Mumbai.lat, currentLng: LOCATIONS.Mumbai.lng },
  });
  await prisma.vehicle.create({
    data: { providerId: logistics.id, type: VehicleType.REFRIGERATED_TRUCK, registration: 'MH-04-CD-5678', capacity: 3000, costPerKm: 35 },
  });

  await prisma.farm.createMany({
    data: [
      { farmerId: farmerC.id, name: 'Main Plot', location: 'Nashik', latitude: 19.95, longitude: 73.82, areaAcres: 5, crops: ['Tomato', 'Onion'] },
      { farmerId: farmerD.id, name: 'River Side Farm', location: 'Pune', latitude: 18.55, longitude: 73.88, areaAcres: 3.5, crops: ['Tomato'] },
    ],
  });

  const _listingFpoA = await prisma.produceListing.create({
    data: { productId: tomato.id, fpoId: fpoA.id, quantity: 3000, availableQty: 3000, grade: QualityGrade.A, expectedPrice: 21, harvestDate: new Date('2026-09-18'), location: 'Nashik', latitude: LOCATIONS.Nashik.lat, longitude: LOCATIONS.Nashik.lng },
  });
  const _listingFpoB = await prisma.produceListing.create({
    data: { productId: tomato.id, fpoId: fpoB.id, quantity: 4000, availableQty: 4000, grade: QualityGrade.A, expectedPrice: 22, harvestDate: new Date('2026-09-17'), location: 'Pune', latitude: LOCATIONS.Pune.lat, longitude: LOCATIONS.Pune.lng },
  });
  const _listingFarmerC = await prisma.produceListing.create({
    data: { productId: tomato.id, farmerId: farmerC.id, quantity: 2000, availableQty: 2000, grade: QualityGrade.A, expectedPrice: 20, harvestDate: new Date('2026-09-18'), location: 'Nashik', latitude: 19.95, longitude: 73.82 },
  });
  const _listingFarmerD = await prisma.produceListing.create({
    data: { productId: tomato.id, farmerId: farmerD.id, quantity: 1000, availableQty: 1000, grade: QualityGrade.A, expectedPrice: 21.5, harvestDate: new Date('2026-09-19'), location: 'Pune', latitude: 18.55, longitude: 73.88 },
  });

  for (const p of products.filter((x) => x.name !== 'Tomato')) {
    await prisma.produceListing.create({
      data: {
        productId: p.id,
        fpoId: Math.random() > 0.5 ? fpoA.id : fpoB.id,
        quantity: 1000 + Math.floor(Math.random() * 3000),
        availableQty: 1000 + Math.floor(Math.random() * 3000),
        grade: QualityGrade.A,
        expectedPrice: 15 + Math.floor(Math.random() * 20),
        harvestDate: new Date('2026-09-20'),
        location: ['Nashik', 'Pune', 'Nagpur'][Math.floor(Math.random() * 3)],
      },
    });
  }

  const demoDemand = await prisma.demand.create({
    data: {
      buyerId: buyer.id,
      productId: tomato.id,
      quantity: 10000,
      grade: QualityGrade.A,
      maxPrice: 25,
      deliveryLocation: 'Mumbai',
      deliveryLat: LOCATIONS.Mumbai.lat,
      deliveryLng: LOCATIONS.Mumbai.lng,
      requiredBy: new Date('2026-09-20'),
      status: 'OPEN',
      notes: 'Required for restaurant chain weekly supply - Grade A tomatoes only',
    },
  });

  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    await prisma.priceHistory.create({
      data: { productId: tomato.id, location: 'Mumbai', price: 20 + Math.random() * 8, date },
    });
  }

  await prisma.demandForecast.createMany({
    data: [
      { productId: tomato.id, location: 'Mumbai', currentDemand: 12500, predictedDemand: 17800, changePercent: 42.4, potentialShortage: 3600, season: 'Monsoon', isEstimate: true },
      { productId: products.find((p) => p.name === 'Onion')!.id, location: 'Mumbai', currentDemand: 8000, predictedDemand: 9200, changePercent: 15, potentialShortage: 1200, season: 'Monsoon', isEstimate: true },
      { productId: products.find((p) => p.name === 'Potato')!.id, location: 'Delhi', currentDemand: 15000, predictedDemand: 16500, changePercent: 10, potentialShortage: 800, season: 'Monsoon', isEstimate: true },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('\n=== DEMO CREDENTIALS (password: demo123) ===');
  console.log('Admin:     admin@agrichain.in');
  console.log('Buyer:     buyer@mumbai.com');
  console.log('FPO A:     fpo.nashik@agrichain.in');
  console.log('FPO B:     fpo.pune@agrichain.in');
  console.log('Farmer C:  farmer.rajesh@agrichain.in');
  console.log('Farmer D:  farmer.sunita@agrichain.in');
  console.log('Logistics: logistics@agrichain.in');
  console.log(`\nDemo Demand ID: ${demoDemand.id}`);
  console.log('Product: 10,000 kg Grade-A Tomato for Mumbai');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
