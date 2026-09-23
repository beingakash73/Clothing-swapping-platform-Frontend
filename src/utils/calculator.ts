import { BrandTier, Category, ClothingCondition, ClothingItem } from '../types';

export interface CalculationInput {
  category: Category;
  brandTier: BrandTier;
  condition: ClothingCondition;
  originalPrice: number;
  ageYears?: number;
  isVintage?: boolean;
}

export interface CalculationResult {
  estimatedSwapValue: number;
  depreciationRatio: number;
  sustainabilityScore: number;
  breakdown: {
    categoryWeight: number;
    brandTierMultiplier: number;
    conditionMultiplier: number;
    ageMultiplier: number;
  };
}

export const BRAND_TIER_LABELS: Record<BrandTier, { name: string; multiplier: number; description: string }> = {
  luxury: { name: 'Luxury Heritage', multiplier: 1.55, description: 'Gucci, Prada, Burberry, Dior' },
  designer_sustainable: { name: 'Sustainable & Designer', multiplier: 1.35, description: 'Patagonia, Reformation, Acne Studios, Ganni' },
  vintage: { name: 'Curated Vintage (15+ yrs)', multiplier: 1.25, description: 'Authentic 70s-90s Selvedge, Leather, Military' },
  premium: { name: 'Premium & Contemporary', multiplier: 1.10, description: "Levi's Premium, COS, Sézane, Arket, Madewell" },
  high_street: { name: 'High Street Quality', multiplier: 0.85, description: 'Zara, Mango, Uniqlo, & Other Stories' },
  fast_fashion: { name: 'Fast Fashion Entry', multiplier: 0.55, description: 'H&M, Shein, Forever 21, ASOS Design' },
};

export const CONDITION_LABELS: Record<ClothingCondition, { name: string; multiplier: number; description: string }> = {
  new_with_tags: { name: 'New with Tags (NWT)', multiplier: 0.85, description: 'Never worn, original tags still attached' },
  like_new: { name: 'Like New (NWOT)', multiplier: 0.72, description: 'Flawless condition, washed once or never worn' },
  gently_used: { name: 'Gently Used', multiplier: 0.54, description: 'Minor signs of wear, no stains or holes' },
  worn_with_love: { name: 'Worn with Love', multiplier: 0.36, description: 'Visible patina, minor fading, full functional life left' },
};

export const CATEGORY_FACTORS: Record<Category, number> = {
  'Jackets & Coats': 1.25,
  'Sweaters & Knitwear': 1.05,
  'Dresses & Jumpsuits': 1.10,
  'Pants & Denim': 1.05,
  'Footwear': 1.15,
  'Bags & Accessories': 1.0,
  'Tops & Shirts': 0.85,
  'Skirts & Shorts': 0.85,
};

/**
 * Calculates algorithmic estimated swap value (in Swap Credits / $ parity)
 */
export function calculateSwapValue(input: CalculationInput): CalculationResult {
  const { category, brandTier, condition, originalPrice, ageYears = 1, isVintage = false } = input;

  const categoryWeight = CATEGORY_FACTORS[category] || 1.0;
  const brandTierMultiplier = BRAND_TIER_LABELS[brandTier]?.multiplier || 1.0;
  const conditionMultiplier = CONDITION_LABELS[condition]?.multiplier || 0.5;

  let ageMultiplier = 1.0;
  if (isVintage || brandTier === 'vintage') {
    ageMultiplier = 1.2; // Vintage gains character/collectibility
  } else if (ageYears <= 1) {
    ageMultiplier = 1.0;
  } else if (ageYears <= 2) {
    ageMultiplier = 0.90;
  } else if (ageYears <= 4) {
    ageMultiplier = 0.78;
  } else {
    ageMultiplier = 0.65;
  }

  // Base raw calculated value
  const baseValue = originalPrice * conditionMultiplier * (brandTierMultiplier * 0.75 + 0.25) * ageMultiplier;
  
  // Floor and round
  const estimatedSwapValue = Math.max(10, Math.round(baseValue));
  const depreciationRatio = Math.round((1 - (estimatedSwapValue / Math.max(originalPrice, 1))) * 100);

  // Sustainability score (reward sustainable brands, vintage, and high condition)
  let sustainabilityScore = 70;
  if (brandTier === 'designer_sustainable' || isVintage) sustainabilityScore += 20;
  if (condition === 'new_with_tags' || condition === 'like_new') sustainabilityScore += 10;
  sustainabilityScore = Math.min(100, sustainabilityScore);

  return {
    estimatedSwapValue,
    depreciationRatio,
    sustainabilityScore,
    breakdown: {
      categoryWeight,
      brandTierMultiplier,
      conditionMultiplier,
      ageMultiplier,
    },
  };
}

/**
 * Evaluates fairness between requested item and offered item(s)
 */
export function evaluateSwapFairness(
  requestedItemValue: number, 
  offeredItemsTotalValue: number
): {
  score: number; // 0 to 100
  difference: number; // requested - offered
  status: 'fair' | 'slight_gap' | 'uneven';
  message: string;
  advice: string;
} {
  const diff = requestedItemValue - offeredItemsTotalValue;
  const maxVal = Math.max(requestedItemValue, offeredItemsTotalValue, 1);
  const percentDelta = Math.abs(diff) / maxVal;

  const score = Math.max(10, Math.min(100, Math.round((1 - percentDelta) * 100)));

  if (percentDelta <= 0.15) {
    return {
      score,
      difference: diff,
      status: 'fair',
      message: 'Equitable & Fair Match',
      advice: 'Both sides have closely matched swap values. High chance of quick acceptance!',
    };
  } else if (percentDelta <= 0.35) {
    return {
      score,
      difference: diff,
      status: 'slight_gap',
      message: diff > 0 ? 'Offered value is slightly lower' : 'Offered value is slightly higher',
      advice: diff > 0 
        ? 'Consider adding a small accessory or scarf to make it a perfect 50/50 trade.'
        : 'You are offering higher value. You may ask for an additional small item or proceed as a generous swap.',
    };
  } else {
    return {
      score,
      difference: diff,
      status: 'uneven',
      message: 'Value Mismatch',
      advice: diff > 0
        ? 'There is a noticeable value gap. Offering a 2-for-1 bundle will significantly improve your offer acceptance.'
        : 'Your offered item holds significantly more value than the requested piece.',
    };
  }
}

/**
 * Finds fair match suggestions from available items
 */
export function findFairMatches(targetItem: ClothingItem, pool: ClothingItem[], limit = 4): ClothingItem[] {
  return pool
    .filter(item => item.id !== targetItem.id && item.status === 'available')
    .map(item => {
      const diff = Math.abs(item.estimatedSwapValue - targetItem.estimatedSwapValue);
      return { item, diff };
    })
    .sort((a, b) => a.diff - b.diff)
    .slice(0, limit)
    .map(res => res.item);
}
