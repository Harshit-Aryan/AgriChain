import { haversineDistance, getCoords } from './geo.util';

export interface ListingCandidate {
  id: string;
  listingId: string;
  supplierId: string;
  supplierName: string;
  supplierType: 'farmer' | 'fpo';
  farmerId?: string;
  fpoId?: string;
  quantity: number;
  availableQty: number;
  grade: string;
  expectedPrice: number;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  reliabilityScore: number;
  onTimeRate: number;
  qualityRate: number;
}

export interface ScoredMatch {
  listingId: string;
  supplierId: string;
  supplierName: string;
  supplierType: 'farmer' | 'fpo';
  farmerId?: string;
  fpoId?: string;
  allocatedQty: number;
  matchScore: number;
  priceScore: number;
  distanceScore: number;
  quantityScore: number;
  qualityScore: number;
  deliveryScore: number;
  reliabilityScore: number;
}

const WEIGHTS = {
  price: 0.3,
  distance: 0.2,
  quantity: 0.2,
  quality: 0.15,
  delivery: 0.1,
  reliability: 0.05,
};

export function scoreListing(
  listing: ListingCandidate,
  maxPrice: number,
  requiredQty: number,
  deliveryLocation: string,
  requiredGrade: string,
): ScoredMatch {
  const deliveryCoords = getCoords(deliveryLocation);
  const listingCoords = {
    lat: listing.latitude ?? getCoords(listing.location).lat,
    lng: listing.longitude ?? getCoords(listing.location).lng,
  };
  const distance = haversineDistance(listingCoords, deliveryCoords);

  const priceScore = Math.min(100, Math.max(0, ((maxPrice - listing.expectedPrice) / maxPrice) * 100 + 50));
  const distanceScore = Math.max(0, 100 - distance * 2);
  const quantityScore = Math.min(100, (listing.availableQty / requiredQty) * 100);
  const qualityScore = listing.grade === requiredGrade ? 95 : listing.grade === 'A' ? 90 : 75;
  const deliveryScore = distance < 100 ? 90 : distance < 200 ? 75 : 60;
  const reliabilityScore = listing.reliabilityScore;

  const matchScore =
    priceScore * WEIGHTS.price +
    distanceScore * WEIGHTS.distance +
    quantityScore * WEIGHTS.quantity +
    qualityScore * WEIGHTS.quality +
    deliveryScore * WEIGHTS.delivery +
    reliabilityScore * WEIGHTS.reliability;

  return {
    listingId: listing.listingId,
    supplierId: listing.supplierId,
    supplierName: listing.supplierName,
    supplierType: listing.supplierType,
    farmerId: listing.farmerId,
    fpoId: listing.fpoId,
    allocatedQty: 0,
    matchScore: Math.round(matchScore * 10) / 10,
    priceScore: Math.round(priceScore),
    distanceScore: Math.round(distanceScore),
    quantityScore: Math.round(quantityScore),
    qualityScore: Math.round(qualityScore),
    deliveryScore: Math.round(deliveryScore),
    reliabilityScore: Math.round(reliabilityScore),
  };
}

export function findOptimalCombination(
  candidates: ListingCandidate[],
  requiredQty: number,
  maxPrice: number,
  deliveryLocation: string,
  requiredGrade: string,
): ScoredMatch[] {
  const scored = candidates
    .map((c) => scoreListing(c, maxPrice, requiredQty, deliveryLocation, requiredGrade))
    .sort((a, b) => b.matchScore - a.matchScore);

  const selected: ScoredMatch[] = [];
  let remaining = requiredQty;

  for (const match of scored) {
    if (remaining <= 0) break;
    const candidate = candidates.find((c) => c.listingId === match.listingId);
    if (!candidate) continue;
    const alloc = Math.min(candidate.availableQty, remaining);
    if (alloc > 0) {
      selected.push({ ...match, allocatedQty: alloc });
      remaining -= alloc;
    }
  }

  return selected;
}
