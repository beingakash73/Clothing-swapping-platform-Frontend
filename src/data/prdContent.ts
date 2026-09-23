export interface PRDSection {
  id: string;
  title: string;
  content: string;
}

export const PRD_SECTIONS: PRDSection[] = [
  {
    id: 'executive-summary',
    title: '1. Executive Summary & Problem Statement',
    content: `### Problem Statement
The global fashion industry is responsible for over 92 million tonnes of textile waste annually, consuming 79 trillion liters of water and emitting 10% of global greenhouse gases. Consumers discard wearable garments in prime condition because traditional resale platforms are burdened with monetary transaction fees, complicated pricing algorithms, shipping complexities, and buyer scams. Meanwhile, donation centers discard up to 84% of received clothing into landfills or incinerators.

### The Solution: ThreadLoop
ThreadLoop is a dedicated, zero-monetary barter marketplace enabling peer-to-peer clothing swaps. By removing cash exchange, ThreadLoop unlocks the pure utility of pre-loved garments, gamifies circular fashion through algorithmic Swap Points, provides location-based safe community meetups, and offers intelligent fairness calculations.`,
  },
  {
    id: 'objectives',
    title: '2. Product Objectives & Success Metrics',
    content: `### Primary Objectives
- **Zero-Cash Barter Marketplace**: Allow users to exchange 1-for-1 or multi-item bundles without currency exchange.
- **Fairness Transparency**: Eliminate subjective pricing arguments with an algorithmic Swap Value Calculator based on Brand Tier, Condition, Age, and Category.
- **Localized Swap Hubs**: Minimize carbon footprints by prioritizing local meetups at verified community swap spots (libraries, cafes, eco-centers).
- **Safe Negotiation**: Provide real-time negotiation chat, in-line counter-proposals, and double-opt-in digital agreements.

### Key Performance Indicators (KPIs)
- **Active Listings**: Target 10,000+ verified active listings in Phase 1.
- **Swap Conversion Rate**: >40% of proposed swaps reaching 'Completed' status.
- **Environmental Impact Diverted**: Track kg of textile waste diverted, liters of water saved, and metric tonnes of CO₂ avoided.
- **User Retention (30-Day)**: >55% monthly active user retention through circular wardrobe rotation.`,
  },
  {
    id: 'personas',
    title: '3. Target User Personas',
    content: `### Persona A: Maya Lin (The Conscious Eco-Stylist)
- **Age**: 28 | **Location**: Brooklyn, NY | **Occupation**: Brand Designer
- **Motivations**: Passionate about zero-waste living, seeks unique vintage & sustainable designer items without contributing to fast fashion.
- **Pain Points**: Reselling on Depop/Poshmark takes weeks; paying 20% platform commission feels extortionate for simple clothes trades.

### Persona B: Leo Thorne (The Heritage Collector)
- **Age**: 34 | **Location**: Manhattan, NY | **Occupation**: Architectural Archivist
- **Motivations**: Trades 70s-90s vintage selvedge denim and military outerwear; prioritizes item authenticity and condition accuracy.
- **Pain Points**: Resents cash lowballers; prefers direct item-for-item parity trades with knowledgeable collectors.

### Persona C: Platform Moderator (Admin Sarah Connor)
- **Role**: Trust, Safety & Operations Lead
- **Motivations**: Enforces community listing quality, reviews disputes, prevents commercial scalpers, monitors environmental metrics.`,
  },
  {
    id: 'functional-requirements',
    title: '4. Detailed Functional Requirements',
    content: `### Module 1: User Profile & Authentication
- Email authentication with demo persona quick-switcher.
- Personal Closet portfolio displaying listed items, reservation states, and swap archives.
- Dynamic Eco-Impact Scorecard: Cumulative water saved, CO₂ avoided, and unlocked sustainability badges.

### Module 2: Garment Listing & Management
- Multi-photo upload with photo preview.
- Metadata attributes: Title, Brand, Brand Tier, Category, Subcategory, Size, Condition, Material, Color, Retail Price.
- Automated algorithmic valuation yielding estimated Swap Value (pts/$).
- Status toggles: Available, In Negotiation, Swapped, Reserved.

### Module 3: Swap Proposal & Value Engine
- Interactive drawer allowing selection of 1 or more closet items to offer.
- Dynamic Value Comparison Bar showing delta and algorithmic Fairness Score (0-100%).
- Real-time recommendations: Fair match, slight gap (suggest accessories), or significant gap (suggest 2-for-1 bundle).
- Preferred exchange selector: Community Safe Hub vs. Courier Shipping.

### Module 4: Negotiation Chat Room
- Dedicated asynchronous messaging thread attached to each swap ID.
- Sticky Top Proposal Card showing current offer breakdown and status.
- Quick counter-offer modifier and local meetup coordinate selector.
- Double-opt-in digital confirmation button requiring mutual agreement before swapping status advances.

### Module 5: Location-Based Radar & Distance Matching
- Haversine distance calculations from user's coordinates.
- Interactive Map and Grid switcher.
- Verified community safe hubs for friction-free in-person trades.

### Module 6: Admin Moderation & Dispute Center
- Platform health analytics (listings, users, swap conversion, sustainability ticker).
- Listing moderation table (review, approve, or flag inappropriate listings).
- Dispute resolution center (resolve condition discrepancies with full negotiation audit logs).`,
  },
  {
    id: 'non-functional-requirements',
    title: '5. Non-Functional Requirements & Security',
    content: `### Performance & Scalability
- **Sub-Second Page Load**: Client-side state hydration with lightweight reactive UI.
- **Offline & Persistence Resilience**: LocalStorage cache synchronization ensuring zero data loss during active negotiation.

### Security & Privacy
- **Location Obfuscation**: User addresses are masked to neighborhood / zip code level; exact addresses are never publicly exposed.
- **Sanitized Inputs**: All chat messages, descriptions, and user notes are sanitized against XSS and injection attacks.
- **Double Confirmation Verification**: Swaps cannot be marked completed without mutual sign-off from both parties.`,
  },
  {
    id: 'future-roadmap',
    title: '6. Future Roadmap (Phase 2 & 3)',
    content: `### Phase 2 Enhancements
- **AI Garment Condition Inspector**: Computer vision analysis of uploaded photos to verify seam condition, fabric wear, and tag authenticity.
- **Integrated Courier API**: Direct integration with DHL/USPS/Sendle for discounted carbon-neutral swap shipping labels.
- **Mobile Native Application**: React Native mobile app with push notifications for instant negotiation alerts.

### Phase 3 Enhancements
- **Brand Partnership Returns**: Partnering with Patagonia, Levi's, and Reformation for official certified brand swap programs.
- **Community Swap Festivals**: In-person QR-code enabled clothing swap events held at university campuses and civic centers.`,
  }
];
