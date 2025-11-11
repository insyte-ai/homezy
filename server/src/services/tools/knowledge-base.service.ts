import { logger } from '../../utils/logger';

/**
 * Knowledge Base Service
 *
 * Provides curated UAE home improvement information:
 * - Regulations and permits
 * - Best practices
 * - Material recommendations
 * - Maintenance tips
 */

export interface KnowledgeArticle {
  id: string;
  category: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'general';
  topic: string;
  content: string;
  tags: string[];
  relevance?: number;
}

export interface KnowledgeSearchResult {
  articles: KnowledgeArticle[];
  totalFound: number;
}

export class KnowledgeBaseService {
  // Static knowledge base (can be enhanced with vector DB later for semantic search)
  private knowledgeBase: KnowledgeArticle[] = [
    {
      id: 'kb_001',
      category: 'regulations',
      topic: 'Building Permits in Dubai',
      content: `Dubai Municipality requires building permits for any structural modifications, plumbing changes, electrical work, or significant renovations.

**Process:**
1. Submit architectural drawings and project plan
2. Obtain NOC (No Objection Certificate) from landlord if renting
3. Provide contractor's valid trade license
4. Pay permit fees (AED 500-2,000 depending on scope)
5. Wait for approval (typically 5-7 business days)

**Required for:** Structural changes, kitchen/bathroom renovations, electrical rewiring, plumbing modifications, AC installation, balcony enclosures.

**Not required for:** Painting, minor repairs, furniture installation, decorative changes.

**Contact:** Dubai Municipality - Building Permits Department, Call 800-900`,
      tags: ['permits', 'dubai', 'municipality', 'regulations', 'structural', 'noc'],
    },
    {
      id: 'kb_002',
      category: 'best_practices',
      topic: 'AC Maintenance in UAE Climate',
      content: `In UAE's extreme heat, proper AC maintenance is critical for performance and energy efficiency.

**Quarterly Maintenance (Every 3 months):**
- Clean or replace air filters
- Check thermostat accuracy
- Inspect drain line for clogs
- Clean vents and registers

**Annual Professional Service (Before summer):**
- Check refrigerant levels (R410A or R32)
- Clean condenser coils thoroughly
- Inspect electrical connections
- Test safety controls
- Lubricate motors and bearings

**Monthly Tasks:**
- Wipe down exterior unit
- Remove debris around outdoor unit
- Check for unusual noises or smells

**Benefits:** 30% reduction in electricity bills, 50% longer unit lifespan, fewer breakdowns during peak summer.

**Cost:** DIY maintenance: AED 50-100/quarter. Professional service: AED 200-400/year.`,
      tags: ['hvac', 'ac', 'maintenance', 'climate', 'energy-efficiency', 'summer'],
    },
    {
      id: 'kb_003',
      category: 'materials',
      topic: 'Waterproofing Materials for UAE',
      content: `UAE's humidity and occasional heavy rains require robust waterproofing solutions.

**Best Materials by Application:**

**Bathrooms & Wet Areas:**
- Polyurethane liquid membranes (flexible, crack-resistant)
- Cementitious waterproofing (under tiles)
- Brands: Sika, BASF, Fosroc

**Roofs & Terraces:**
- Bituminous membranes (torch-applied or self-adhesive)
- Polyurethane coatings (reflective options reduce heat)
- Brands: Derbigum, Index, Soprema

**Basements & Foundations:**
- Crystalline waterproofing systems
- Bentonite clay membranes
- Drainage systems with sump pumps

**Joints & Penetrations:**
- Polyurethane or silicone sealants (UV-resistant)
- Expansion joint systems for movement

**Temperature Rating:** Choose materials rated for 50°C+ (UAE summer temperatures).

**Application:** Always hire certified applicators. Improper application voids warranties.

**Cost:** Bathroom waterproofing: AED 50-100/sqm. Roof: AED 80-150/sqm.`,
      tags: ['waterproofing', 'materials', 'humidity', 'roofing', 'bathroom', 'basement'],
    },
    {
      id: 'kb_004',
      category: 'regulations',
      topic: 'Electrical Safety Standards UAE',
      content: `All electrical work in UAE must comply with IEC (International Electrotechnical Commission) standards and local regulations.

**Key Requirements:**

**Licensing:**
- Only DEWA-licensed electricians can perform installations
- Contractor must have valid electrical trade license

**Safety Standards:**
- Proper earthing/grounding (mandatory)
- RCD (Residual Current Device) protection on all circuits
- Circuit breakers sized correctly for loads
- Fire-resistant cables in high-risk areas
- IP-rated fixtures for wet areas (bathrooms: IP65 minimum)

**Residential Circuit Guidelines:**
- Lighting circuits: 10A or 16A breakers
- Power outlets: 20A breakers
- AC units: 32A breakers (dedicated circuits)
- Kitchen appliances: 20A-32A (separate circuits for high-power items)

**Inspections:**
- Required after major electrical work
- DEWA inspection for new connections
- Building management approval for modifications

**Penalties:** Unauthorized electrical work can result in fines (AED 5,000-50,000), disconnection, and safety hazards.

**Emergency:** For electrical issues, contact DEWA: 991 (24/7)`,
      tags: ['electrical', 'safety', 'regulations', 'standards', 'iec', 'dewa', 'licensing'],
    },
    {
      id: 'kb_005',
      category: 'best_practices',
      topic: 'Kitchen Renovation Tips for UAE Homes',
      content: `Designing and renovating kitchens in UAE requires special considerations for climate and lifestyle.

**Material Selection:**
- **Cabinets:** Moisture-resistant materials (marine plywood, moisture-resistant MDF)
- **Countertops:** Heat-resistant options (granite, quartz, porcelain)
- **Backsplash:** Easy-to-clean materials (glass, ceramic tiles, stainless steel)
- **Flooring:** Water-resistant (porcelain tiles, vinyl, engineered stone)

**Ventilation (Critical in UAE):**
- Powerful exhaust hood (900-1200 m³/h for large kitchens)
- Ducted systems preferred over recirculating
- Annual duct cleaning to prevent grease buildup

**Layout Considerations:**
- Open-plan designs popular in modern UAE homes
- Island kitchens common in villas
- Plan for large appliances (side-by-side fridges common)
- Adequate storage for bulk shopping habits

**Electrical Planning:**
- Multiple outlets for small appliances
- Dedicated circuits for oven, dishwasher, microwave
- USB charging stations increasingly popular
- Under-cabinet lighting for task illumination

**Cost Estimates (Dubai, 2024):**
- Economy: AED 30,000-50,000 (basic cabinets, laminate counters)
- Standard: AED 70,000-100,000 (good quality, granite/quartz)
- Premium: AED 150,000+ (European brands, high-end finishes)

**Timeline:** 3-6 weeks for standard renovation, 8-12 weeks for custom work.`,
      tags: ['kitchen', 'renovation', 'planning', 'design', 'budget', 'materials'],
    },
    {
      id: 'kb_006',
      category: 'maintenance',
      topic: 'Pool Maintenance in UAE Heat',
      content: `UAE's intense sun and heat create unique pool maintenance challenges requiring consistent care.

**Daily/Weekly Tasks:**
- Check water level (evaporation: 5-10cm/week in summer)
- Skim debris from surface
- Empty skimmer baskets
- Test water chemistry (pH: 7.2-7.6, Chlorine: 2-4 ppm)

**Water Chemistry (Critical):**
- Test pH and chlorine 2-3 times weekly in summer
- High evaporation concentrates chemicals - dilute regularly
- Calcium hardness monitoring (UAE tap water is hard: 200-400 ppm)
- Stabilizer (cyanuric acid) prevents chlorine degradation in sun

**Filtration:**
- Run pump 8-12 hours daily in summer (May-September)
- Clean skimmer and pump baskets weekly
- Backwash sand filters monthly or when pressure rises 8-10 psi
- Replace filter media every 3-5 years

**Shock Treatment:**
- Weekly shock treatment in summer (double chlorine dose)
- After heavy use or rain
- Use calcium hypochlorite or non-chlorine shock

**Evaporation Control:**
- Use pool cover when not in use (reduces evaporation 95%)
- Saves water, chemicals, and energy
- Solar covers also retain heat for winter

**Professional Service:**
- Monthly professional inspection recommended
- Cost: AED 200-400/month for weekly service

**Annual Costs:**
- Chemicals: AED 2,000-4,000/year
- Water (replacing evaporation): AED 1,000-2,000/year
- Electricity (pump): AED 1,500-3,000/year`,
      tags: ['pool', 'maintenance', 'water', 'summer', 'heat', 'chemicals', 'evaporation'],
    },
    {
      id: 'kb_007',
      category: 'regulations',
      topic: 'Landlord Approval for Renovations in UAE',
      content: `If renting in UAE, you MUST obtain written approval before ANY renovation work.

**Approval Requirements:**

**Requires NOC (No Objection Certificate):**
- Painting (if changing from original colors)
- Flooring replacement
- Fixture changes (kitchen, bathroom)
- Any structural modifications
- AC unit replacement
- Built-in furniture installation

**Approval Process:**
1. Submit written request describing proposed work
2. Provide contractor details and scope
3. Offer to restore upon lease end (if required)
4. Get written NOC with landlord signature
5. Provide copy to building management

**Consequences of Unauthorized Work:**
- Loss of security deposit (typically 1 month rent)
- Tenant responsible for restoration costs
- Possible lease termination
- Legal action by landlord
- Building management fines

**Documentation (Protect Yourself):**
- Take photos/video before ANY changes
- Keep all receipts for improvements
- Get written confirmation of approval
- Document original condition thoroughly

**Common Issues:**
- Landlords often approve cosmetic work (painting, fixtures)
- Structural changes rarely approved for rentals
- Some landlords offer rent reduction for tenant-funded improvements
- Negotiate before signing lease if major renovations planned

**Dispute Resolution:**
- Rental Disputes Center (RDC): Resolves landlord-tenant conflicts
- Keep all documentation for potential disputes`,
      tags: ['rental', 'landlord', 'approval', 'noc', 'legal', 'tenant', 'lease'],
    },
    {
      id: 'kb_008',
      category: 'materials',
      topic: 'Flooring Options for UAE Climate',
      content: `Selecting the right flooring for UAE homes requires considering heat, humidity, and lifestyle.

**Best Options by Type:**

**Porcelain/Ceramic Tiles (Most Popular):**
- Pros: Stays cool, extremely durable, water-resistant, easy to clean
- Cons: Can be cold in winter, hard underfoot, slippery when wet
- Cost: AED 30-150/sqm (material + installation)
- Best for: All rooms, especially kitchens, bathrooms, living areas

**Vinyl Plank Flooring:**
- Pros: Affordable, water-resistant, comfortable, easy DIY installation
- Cons: Can fade in direct sunlight, not as durable as tile
- Cost: AED 40-80/sqm
- Best for: Bedrooms, living rooms, rental properties

**Engineered Hardwood:**
- Pros: Natural look, better than solid wood in humidity, warm feel
- Cons: More expensive, requires humidity control, can't refinish many times
- Cost: AED 100-300/sqm
- Best for: Bedrooms, living rooms with AC

**Marble/Natural Stone:**
- Pros: Luxury appearance, naturally cool, unique patterns
- Cons: Expensive, requires sealing, can stain, cold in winter
- Cost: AED 200-800/sqm
- Best for: Entrances, living rooms, premium properties

**AVOID in UAE:**
- Solid hardwood (warps in humidity)
- Carpet in bathrooms/kitchens (mold issues)
- Low-quality laminate (swells with moisture)

**Installation Tips:**
- Ensure concrete slab is completely dry before installation
- Use moisture barriers in ground-floor installations
- Allow materials to acclimatize 48 hours before installation
- Professional installation recommended for best results`,
      tags: ['flooring', 'tiles', 'vinyl', 'wood', 'marble', 'materials', 'climate'],
    },
    {
      id: 'kb_009',
      category: 'best_practices',
      topic: 'Paint Selection for UAE Homes',
      content: `Choosing the right paint for UAE's climate ensures longevity and aesthetic appeal.

**Paint Types:**

**Interior:**
- Emulsion (water-based): Standard choice, easy cleanup
- Washable paint: Essential for high-traffic areas, kitchens
- Anti-mold paint: Recommended for bathrooms
- Premium brands: Jotun, Dulux, Berger, CIN

**Exterior:**
- Weather-resistant emulsion
- UV-resistant formulations
- Heat-reflective colors reduce interior temperature

**Color Selection Tips:**

**Light Colors Recommended:**
- Reflect heat, keep rooms cooler
- Make spaces feel larger
- Popular: Off-white, beige, soft gray, cream

**Accent Walls:**
- Single feature wall in darker color
- Creates visual interest without overwhelming

**Cultural Considerations:**
- Vastu Shastra principles important to many residents
- Feng Shui color guidance often requested
- Neutral palettes appeal to diverse tenant pool (rentals)

**Quality Matters:**
- Premium paint lasts 7-10 years vs. 3-5 years for budget brands
- Better coverage (2 coats vs. 3-4 coats)
- Superior washability and stain resistance

**Application Tips:**
- Fill cracks and sand before painting
- Prime new surfaces and repairs
- Apply when humidity < 85% for best results
- Allow proper drying time between coats (24 hours in humid conditions)

**Cost Per Room (Standard 4m x 4m):**
- Budget paint + labor: AED 400-700
- Premium paint + labor: AED 800-1,200
- Whole villa (3-bed): AED 8,000-15,000

**Maintenance:**
- Wash walls annually (mild soap solution)
- Touch up scuffs promptly
- Repaint every 5-7 years for fresh appearance`,
      tags: ['painting', 'colors', 'design', 'interior', 'climate', 'maintenance'],
    },
    {
      id: 'kb_010',
      category: 'maintenance',
      topic: 'Preventing Mold in UAE Humidity',
      content: `UAE's high humidity (70-90% in summer) makes mold prevention essential for health and property value.

**High-Risk Areas:**
- Bathrooms (especially showers)
- AC units and ducts
- Kitchens
- Closets without ventilation
- Behind furniture against exterior walls

**Prevention Strategies:**

**Ventilation (Most Important):**
- Run bathroom exhaust fans during and 20 min after showers
- Open windows when weather permits
- Ensure AC has fresh air intake
- Don't block air vents with furniture

**Dehumidification:**
- Use dehumidifiers in problematic rooms (target 50-60% humidity)
- Empty water collection tanks daily
- Portable units: AED 300-800
- Built-in systems: AED 3,000-8,000

**AC Maintenance:**
- Clean filters monthly
- Professional duct cleaning annually
- Fix condensation leaks immediately
- Ensure proper drainage

**Surface Protection:**
- Anti-mold paint in bathrooms
- Wipe down tiles after showers
- Squeegee glass shower doors
- Keep bathroom doors open when not in use

**Storage:**
- Silica gel packets in closets
- Elevated storage in garages
- Plastic bins for vulnerable items
- Regular air circulation in closets

**Cleaning Existing Mold:**

**Small Areas (<1 sqm):**
- White vinegar solution (spray, wait 1 hour, scrub, rinse)
- Baking soda paste for stubborn spots
- Commercial mold removers (follow instructions)

**Large Areas:**
- Professional remediation required
- May indicate structural moisture problem
- Cost: AED 500-2,000 depending on extent

**Health Concerns:**
- Mold can trigger allergies and asthma
- Black mold (Stachybotrys) requires immediate professional attention
- Wear mask and gloves when cleaning mold

**Long-term Solutions:**
- Fix water leaks immediately
- Improve home insulation
- Upgrade to higher-capacity AC if undersized
- Consider whole-home dehumidification system`,
      tags: ['mold', 'humidity', 'prevention', 'maintenance', 'health', 'ventilation'],
    },
  ];

  /**
   * Search knowledge base
   */
  async searchKnowledge(
    query: string,
    category?: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'general'
  ): Promise<KnowledgeSearchResult> {
    logger.info('Searching knowledge base', { query, category });

    const queryLower = query.toLowerCase();
    const searchTerms = queryLower
      .split(' ')
      .filter((term) => term.length > 2)
      .filter((term) => !['the', 'and', 'for', 'with'].includes(term)); // Remove common words

    // Filter by category if specified
    let articles = category
      ? this.knowledgeBase.filter((article) => article.category === category)
      : this.knowledgeBase;

    // Calculate relevance scores
    articles = articles.map((article) => {
      let relevance = 0;

      // Topic match (highest weight - 10 points)
      if (article.topic.toLowerCase().includes(queryLower)) {
        relevance += 10;
      }

      // Tag matches (medium weight - 3 points each)
      const matchingTags = article.tags.filter((tag) =>
        searchTerms.some((term) => tag.toLowerCase().includes(term))
      );
      relevance += matchingTags.length * 3;

      // Content matches (lower weight - 1 point each)
      const contentLower = article.content.toLowerCase();
      const contentMatches = searchTerms.filter((term) => contentLower.includes(term));
      relevance += contentMatches.length;

      return { ...article, relevance };
    });

    // Filter out articles with no relevance
    articles = articles.filter((article) => article.relevance! > 0);

    // Sort by relevance (highest first)
    articles.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    // Return top 3 results
    const topResults = articles.slice(0, 3);

    logger.info('Knowledge base search complete', {
      totalFound: articles.length,
      returned: topResults.length,
    });

    return {
      articles: topResults,
      totalFound: articles.length,
    };
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<KnowledgeArticle | null> {
    return this.knowledgeBase.find((article) => article.id === id) || null;
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(
    category: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'general'
  ): Promise<KnowledgeArticle[]> {
    return this.knowledgeBase.filter((article) => article.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return ['regulations', 'best_practices', 'materials', 'maintenance', 'general'];
  }
}
