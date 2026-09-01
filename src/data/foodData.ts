import { Product, FestivalCategory, GiftBoxTier, GalleryItem } from '../types';

export const PRODUCTS: Product[] = [
  // ================= DIWALI SPECIALS & SWEETS =================
  {
    id: 'besan-ladoo',
    name: 'Besan Ladoo',
    category: 'sweets',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Aromatic roasted gram flour blended with pure ghee, sugar, cardamom, and crunchy almond slivers.',
    detailedDescription: 'Handcrafted following time-honoured culinary methods. Premium gram flour is patiently slow-roasted in pure ghee to golden perfection and fragrant aroma, then gently rolled with powdered sugar and fragrant cardamom.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Rich, Nutty & Ghee Aroma',
    texture: 'Melt-in-mouth soft',
    ingredientsHighlight: ['Pure Desi Ghee', 'Roasted Gram Flour', 'Cardamom', 'Almonds']
  },
  {
    id: 'motichoor-ladoo',
    name: 'Motichoor Ladoo',
    category: 'sweets',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Fine golden gram pearls fried in pure ghee, steeped in saffron syrup, and garnished with pistachios.',
    detailedDescription: 'An all-time festive favourite made of miniature tiny boondi pearls infused with pure saffron syrup, garnished with melon seeds and slivered pistachios for an unforgettable festive treat.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Delicately Sweet & Saffron Fragrant',
    texture: 'Juicy and tender',
    ingredientsHighlight: ['Gram Flour Pearls', 'Pure Ghee', 'Kesar (Saffron)', 'Pistachios']
  },
  {
    id: 'rava-ladoo',
    name: 'Rava Ladoo',
    category: 'sweets',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Roasted fine semolina infused with aromatic grated coconut, ghee, cardamom, and plump raisins.',
    detailedDescription: 'A classic homemade style sweet made with golden roasted semolina (sooji), infused with desiccated coconut, roasted cashews, and golden raisins bound gently with warm ghee.',
    image: 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Subtly Sweet with Toasted Coconut Notes',
    texture: 'Slightly grainy, soft bite',
    ingredientsHighlight: ['Roasted Semolina', 'Fresh Coconut', 'Ghee', 'Cashews & Raisins']
  },
  {
    id: 'coconut-ladoo',
    name: 'Coconut Ladoo',
    category: 'sweets',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Freshly grated coconut cooked gently with condensed milk, cardamom, and garnished with pistachios.',
    detailedDescription: 'Soft and succulent sweets prepared from select fine coconut, slow-cooked in whole milk and sweetened naturally, melting seamlessly on every bite.',
    image: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Rich Tropical Coconut with Milky Sweetness',
    texture: 'Soft, juicy & fresh',
    ingredientsHighlight: ['Grated Coconut', 'Condensed Milk', 'Elaichi', 'Pistachios']
  },
  {
    id: 'boondi-ladoo',
    name: 'Boondi Ladoo',
    category: 'sweets',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Golden gram flour drops fried to crisp perfection, soaked in fragrant cardamom sugar syrup.',
    detailedDescription: 'Traditional celebration ladoos prepared with larger crispy boondi pearls, infused with cloves, cardamom, and roasted cashews for traditional weddings and festivals.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Caramelised Sweet with Warm Clove Hints',
    texture: 'Tender pearls with delightful chew',
    ingredientsHighlight: ['Gram Flour', 'Sugar Syrup', 'Cardamom', 'Melon Seeds']
  },
  {
    id: 'karanji',
    name: 'Karanji (Gujiya)',
    category: 'diwali',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Crisp, flaky pastry crescent shells stuffed with toasted coconut, poppy seeds, nuts, and dry fruits.',
    detailedDescription: 'The quintessential Diwali specialty. Hand-pinched flaky golden turnovers packed with roasted dry coconut, roasted khus-khus (poppy seeds), cardamom, charoli, and dry fruits.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Crispy Outer Crust with Sweet Nutty Core',
    texture: 'Flaky and crisp',
    ingredientsHighlight: ['Crispy Wheat Dough', 'Toasted Coconut', 'Poppy Seeds', 'Dry Fruits']
  },
  {
    id: 'kaju-katli',
    name: 'Kaju Katli',
    category: 'sweets',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Silky smooth diamond-cut cashew fudge made with premium whole cashews and delicate edible silver foil.',
    detailedDescription: 'Finely ground premium whole Goan cashews kneaded into a velvety fudge with exact sugar balance. Cut into diamond silvers that dissolve effortlessly on the tongue.',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Rich Nutty Cashew Sweetness',
    texture: 'Silky smooth melt-in-mouth',
    ingredientsHighlight: ['Premium Whole Cashews', 'Refined Cane Sugar', 'Silver Foil (Vark)']
  },
  {
    id: 'milk-peda',
    name: 'Milk Peda',
    category: 'sweets',
    secondaryCategories: ['sweets'],
    description: 'Rich slow-reduced whole milk mawa pedas spiced with fragrant cardamom and stamped with classic patterns.',
    detailedDescription: 'Slow-simmered rich milk solids (khoya) stirred patiently until golden and creamy, blended with ground green cardamom and topped with crushed pistachios.',
    image: 'https://images.unsplash.com/photo-1601050690187-57352d114c00?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Deep Caramelised Milk Sweetness',
    texture: 'Fudge-like, soft and dense',
    ingredientsHighlight: ['Pure Whole Milk Khoya', 'Cardamom', 'Pistachios']
  },
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun',
    category: 'sweets',
    secondaryCategories: ['sweets'],
    description: 'Golden fried soft khoya dumplings soaked in fragrant rose water and green cardamom syrup.',
    detailedDescription: 'Fresh handmade khoya spheres gently fried to a warm mahagony sheen, then rested in simmering rose and saffron scented sugar syrup for optimal softness.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: false,
    packSizes: ['500g', '1kg'],
    tasteProfile: 'Floral Rose & Warm Saffron Syrup',
    texture: 'Spongy and intensely juicy',
    ingredientsHighlight: ['Fresh Khoya', 'Rose Water', 'Cardamom', 'Saffron']
  },
  {
    id: 'jalebi',
    name: 'Desi Ghee Jalebi',
    category: 'sweets',
    secondaryCategories: ['sweets'],
    description: 'Crispy spiral coils fried in pure desi ghee and immersed in saffron-infused warm sugar nectar.',
    detailedDescription: 'Traditional fermented batter piped into swirling concentric spirals directly into hot desi ghee, immediately steeped in saffron sugar syrup for that iconic crunch and juicy burst.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Crispy Tart-Sweet with Saffron Syrup Burst',
    texture: 'Crunchy exterior, juicy core',
    ingredientsHighlight: ['Pure Desi Ghee', 'Saffron Sugar Syrup', 'Natural Ferment']
  },
  {
    id: 'mysore-pak',
    name: 'Special Mysore Pak',
    category: 'sweets',
    secondaryCategories: ['sweets'],
    description: 'Royal South Indian confection crafted with roasted gram flour, pure ghee, and caramelised sweetness.',
    detailedDescription: 'A royal heritage recipe of roasted gram flour cooked vigorously with cascading hot desi ghee until aerated and yielding a honeycomb melt-in-mouth texture.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Intense Desi Ghee & Toasted Gram Flour',
    texture: 'Porous and velvety',
    ingredientsHighlight: ['Pure Desi Ghee', 'Gram Flour', 'Sugar']
  },
  {
    id: 'modak',
    name: 'Traditional Modak (Ukadiche / Fried)',
    category: 'sweets',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Sacred festive delicacies stuffed with fresh coconut, jaggery, cardamom, and nutmeg.',
    detailedDescription: 'Lord Ganesha’s beloved treat. Featuring aromatic fillings of freshly scraped coconut cooked with pure golden jaggery and fragrant nutmeg, encased in steamed rice flour or crisp golden pastry.',
    image: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['6 pcs', '12 pcs', '21 pcs Pack'],
    tasteProfile: 'Earthy Golden Jaggery & Coconut',
    texture: 'Soft steamed or crispy fried',
    ingredientsHighlight: ['Fresh Coconut', 'Organic Jaggery', 'Nutmeg & Cardamom']
  },
  {
    id: 'barfi',
    name: 'Assorted Festive Barfi',
    category: 'sweets',
    secondaryCategories: ['sweets'],
    description: 'Rich pistachio, almond, and saffron infused milk fudge squares crafted with pure khoya.',
    detailedDescription: 'Layered or plain wholesome khoya barfi cooked to creamy perfection, garnished with toasted pistachio flakes and silver embellishments for royal gifting.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Creamy Milk Fudge with Roasted Dry Fruits',
    texture: 'Soft, dense and sliceable',
    ingredientsHighlight: ['Pure Khoya', 'Pistachios', 'Almonds', 'Cardamom']
  },
  {
    id: 'dry-fruit-sweets',
    name: 'Dry Fruit Sweets Assortment',
    category: 'sweets',
    secondaryCategories: ['diwali', 'sweets'],
    description: 'Exquisite sugar-conscious bites made with dates, figs (anjeer), almonds, pistachios, and cashews.',
    detailedDescription: 'Crafted with prime quality Turkish figs, Arabian dates, and roasted dry fruits, naturally sweetened and rolled into bite-sized medallions with roasted poppy seeds.',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Natural Date-Fig Sweetness with Rich Crunch',
    texture: 'Dense, chewy and nutty',
    ingredientsHighlight: ['Dates & Figs', 'Almonds', 'Cashews', 'Pistachios']
  },
  {
    id: 'diwali-gift-boxes',
    name: 'Diwali Grand Gift Boxes',
    category: 'diwali',
    secondaryCategories: ['diwali', 'sweets', 'namkeen'],
    description: 'Opulent festive hampers combining our signature ladoos, crispy chakli, shankarpali, and dry fruits.',
    detailedDescription: 'Curated gift hampers presented in traditional gold-embossed gift packaging. Perfect for sharing festive warmth with loved ones, corporate partners, and family gatherings.',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['Standard (4 Items)', 'Festive Royal (6 Items)', 'Grand Celebration (8 Items)'],
    tasteProfile: 'Balanced Assortment of Sweet & Savoury',
    texture: 'Multi-texture festive collection',
    ingredientsHighlight: ['Assorted Ladoos', 'Crispy Namkeen', 'Dry Fruits', 'Festive Packaging']
  },

  // ================= NAMKEEN & SNACKS =================
  {
    id: 'chakli',
    name: 'Crispy Butter Chakli',
    category: 'namkeen',
    secondaryCategories: ['diwali', 'namkeen'],
    description: 'Spiralled crunchy savoury snacks made with traditional rice-lentil flour blend, ajwain, and sesame seeds.',
    detailedDescription: 'Traditional spiral savoury snack prepared with our roasted multi-grain flour blend (bhajani), cumin, white sesame seeds, and ajwain, fried to an irresistible golden crispiness.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Crunchy, Savoury & Spiced with Cumin & Sesame',
    texture: 'Ultra crispy, non-greasy',
    ingredientsHighlight: ['Traditional Bhajani Flour', 'White Sesame Seeds', 'Ajwain', 'Spices']
  },
  {
    id: 'shankarpali',
    name: 'Sweet Shankarpali',
    category: 'namkeen',
    secondaryCategories: ['diwali', 'namkeen'],
    description: 'Diamond-cut bite-sized crunchy sweet biscuits crafted with wheat flour, pure ghee, and milk.',
    detailedDescription: 'A Diwali essential. Golden diamond-shaped crispy bites lightly sweetened with cane sugar, kneaded with warm milk and ghee, giving each piece a layered crunch.',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Mildly Sweet with Butter Warmth',
    texture: 'Crispy, layered & flaky',
    ingredientsHighlight: ['Fine Flour', 'Pure Ghee', 'Cane Sugar', 'Cardamom']
  },
  {
    id: 'chivda',
    name: 'Poha Festive Chivda',
    category: 'namkeen',
    secondaryCategories: ['diwali', 'namkeen'],
    description: 'Crispy roasted flattened rice tempered with curry leaves, crunchy peanuts, roasted gram, and turmeric.',
    detailedDescription: 'Light and wholesome beaten rice crisped to perfection, tossed in mild green chilies, fresh curry leaves, turmeric, roasted peanuts, and golden cashews.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Tangy-Sweet & Savoury Crunch',
    texture: 'Feather-light crispy',
    ingredientsHighlight: ['Thin Flattened Rice (Poha)', 'Roasted Peanuts', 'Curry Leaves', 'Turmeric & Mustard']
  },
  {
    id: 'sev',
    name: 'Nylon & Tikha Sev',
    category: 'namkeen',
    secondaryCategories: ['diwali', 'namkeen'],
    description: 'Delicate crispy extruded chickpea flour vermicelli seasoned with ajwain and mild spices.',
    detailedDescription: 'Available in delicate thin nylon sev for chaat toppings or spiced tikha sev seasoned with black pepper and red chilli for tea-time munching.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Savoury, Mildly Spiced with Ajwain Aroma',
    texture: 'Crisp and airy',
    ingredientsHighlight: ['Bengal Gram Flour', 'Ajwain', 'Mild Spices', 'Cold-Pressed Oil']
  },
  {
    id: 'bhadang',
    name: 'Kolhapuri Bhadang',
    category: 'namkeen',
    secondaryCategories: ['namkeen'],
    description: 'Crispy spiced puffed rice seasoned with roasted garlic, red chilli, peanuts, and curry leaves.',
    detailedDescription: 'A spicy regional favourite made with puffed rice (murmura) tossed with roasted crushed garlic, crispy peanuts, dry coconut slivers, and fiery Kolhapuri masala.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Zesty, Spicy Garlic Kick',
    texture: 'Crunchy and light',
    ingredientsHighlight: ['Crispy Puffed Rice', 'Fried Garlic', 'Roasted Peanuts', 'Special Spices']
  },
  {
    id: 'farsan',
    name: 'Special Mix Farsan',
    category: 'namkeen',
    secondaryCategories: ['namkeen'],
    description: 'A harmonious savoury blend of crispy sev, papdi, boondi, spiced nuts, and curry leaves.',
    detailedDescription: 'A classic tea-time companion. Made with a rich medley of crunchy lentil fritters, crisp chickpea strands, spiced peanuts, and fried curry leaves.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Tangy, Savoury & Medium Spiced',
    texture: 'Multi-layer crunch',
    ingredientsHighlight: ['Gram Flour Crisps', 'Papdi', 'Spiced Boondi', 'Roasted Peanuts']
  },
  {
    id: 'mixture',
    name: 'Royal Dry Fruit Mixture',
    category: 'namkeen',
    secondaryCategories: ['diwali', 'namkeen'],
    description: 'Premium savoury snack packed with golden fried cashews, almonds, raisins, sev, and cornflakes.',
    detailedDescription: 'An elevated festive mixture loaded with golden-fried whole cashews, almonds, juicy raisins, crisp potato flakes, and fine spiced sev.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: true,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Rich, Crunchy with Sweet-Savoury Undertones',
    texture: 'Crunchy with chewy dry fruit bursts',
    ingredientsHighlight: ['Whole Cashews', 'Almonds', 'Raisins', 'Spiced Sev']
  },
  {
    id: 'masala-peanuts',
    name: 'Crunchy Masala Peanuts',
    category: 'namkeen',
    secondaryCategories: ['namkeen'],
    description: 'Selected bold peanuts coated in spiced chickpea batter, fried to an irresistible crunch.',
    detailedDescription: 'Whole plump peanuts hand-coated with a spicy, tangy gram flour crust infused with amchur (dry mango powder), red chilli, and chaat masala.',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Zesty, Tangy & Robust Spice Coat',
    texture: 'Super crisp exterior, nutty core',
    ingredientsHighlight: ['Bold Peanuts', 'Gram Flour Coat', 'Chaat Masala', 'Amchur']
  },
  {
    id: 'potato-chips',
    name: 'Fresh Potato Chips (Salted / Masala)',
    category: 'namkeen',
    secondaryCategories: ['namkeen'],
    description: 'Wafer-thin freshly sliced potato crisps lightly salted or sprinkled with special masala.',
    detailedDescription: 'Hand-selected farm potatoes sliced wafer-thin, gently rinsed and crisp-fried in clean oil. Available in classic rock salt or tangy spiced masala.',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: false,
    packSizes: ['200g', '400g', '800g'],
    tasteProfile: 'Classic Salty / Tangy Spiced',
    texture: 'Paper-thin crisp',
    ingredientsHighlight: ['Select Farm Potatoes', 'Rock Salt / Spices', 'Pure Refined Oil']
  },
  {
    id: 'cornflakes-chivda',
    name: 'Crunchy Cornflakes Chivda',
    category: 'namkeen',
    secondaryCategories: ['namkeen'],
    description: 'Golden fried crispy corn flakes tossed with roasted peanuts, cashews, raisins, and mild spices.',
    detailedDescription: 'Light and golden cornflakes fried to airy crispness, combined with roasted cashews, plump raisins, curry leaves, and a delicate sweet-sour spice sprinkle.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Lightly Sweet & Tangy Crunch',
    texture: 'Airy and snappy',
    ingredientsHighlight: ['Golden Corn Flakes', 'Cashews', 'Raisins', 'Mild Seasoning']
  },
  {
    id: 'dry-kachori',
    name: 'Mini Dry Fruit Kachori',
    category: 'namkeen',
    secondaryCategories: ['namkeen'],
    description: 'Golden round bite-sized pastry globes filled with a sweet-spicy dry fruit and spice masala.',
    detailedDescription: 'Crispy golden spheres stuffed with an intensely flavourful filling of dry fruits, roasted spices, amchur, and crushed lentils. Excellent shelf life and perfect snack companion.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isPopular: true,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1kg'],
    tasteProfile: 'Sweet, Spicy, Tangy Explosion',
    texture: 'Crispy shell with rich spiced centre',
    ingredientsHighlight: ['Crispy Pastry', 'Dry Fruit Filling', 'Aromatic Spice Mix']
  }
];

export const FESTIVAL_SPECIALS: FestivalCategory[] = [
  {
    id: 'diwali',
    name: 'Diwali Specials',
    tagline: 'Light up your festivities with authentic Faral & Sweets',
    description: 'Traditional Ladoos, crispy Chakli, golden Shankarpali, flaky Karanji, savoury Chivda, and handcrafted Diwali gift boxes prepared fresh for your home celebration.',
    badge: 'Festival of Lights Special',
    iconName: 'Sparkles',
    items: ['Motichoor & Besan Ladoo', 'Butter Chakli', 'Sweet Shankarpali', 'Stuffed Karanji', 'Poha Chivda', 'Diwali Gift Boxes'],
    sampleProducts: ['besan-ladoo', 'chakli', 'karanji', 'shankarpali', 'diwali-gift-boxes']
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    tagline: 'Bappa’s divine favourites made with devotion and pure taste',
    description: 'Authentic Ukadiche Modak, Fried Coconut Modak, Pure Milk Peda, and traditional assorted sweets prepared with the finest ingredients for auspicious offerings.',
    badge: 'Auspicious Offerings',
    iconName: 'Crown',
    items: ['Fresh Coconut Modak', 'Steamed Ukadiche Modak', 'Pure Milk Peda', 'Kesar Barfi', 'Traditional Sweets'],
    sampleProducts: ['modak', 'milk-peda', 'barfi', 'besan-ladoo']
  },
  {
    id: 'holi',
    name: 'Holi Celebrations',
    tagline: 'Celebrate the festival of colours with traditional sweetness',
    description: 'Rich Mawa & Dry Fruit Gujiya, sweet syrup-soaked Malpua, crispy Namkeen, and festive snack platters to share joy with friends and family.',
    badge: 'Colours & Flavours',
    iconName: 'Flame',
    items: ['Traditional Gujiya', 'Crispy Namkeen', 'Thandai Special Bites', 'Farsan Platter', 'Assorted Sweets'],
    sampleProducts: ['karanji', 'dry-kachori', 'chivda', 'gulab-jamun']
  },
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan',
    tagline: 'Celebrate the bond of love with sweetness',
    description: 'Specially packaged sweet hampers, Kaju Katli boxes, Assorted Ladoo collections, and premium dry fruit sweets to gift your beloved siblings.',
    badge: 'Sibling Love & Gifting',
    iconName: 'Heart',
    items: ['Kaju Katli Boxes', 'Assorted Ladoo Pack', 'Dry Fruit Sweets', 'Premium Gift Boxes', 'Sibling Hampers'],
    sampleProducts: ['kaju-katli', 'motichoor-ladoo', 'dry-fruit-sweets', 'diwali-gift-boxes']
  }
];

export const GIFT_BOX_TIERS: GiftBoxTier[] = [
  {
    id: 'assorted-4',
    name: 'Classic Assorted Box (4 Items)',
    capacity: 4,
    badge: 'Popular for Family & Friends',
    description: 'Choice of 2 Signature Sweets + 2 Crunchy Namkeen items packaged in an elegant gold-embossed presentation box.',
    recommendedFor: 'Family Gifting, Return Gifts & Casual Celebrations'
  },
  {
    id: 'royal-6',
    name: 'Festive Royal Hamper (6 Items)',
    capacity: 6,
    badge: 'Festive Bestseller',
    description: 'Choice of 3 Artisanal Sweets + 3 Crisp Savouries with optional greeting card and premium ribbon packaging.',
    recommendedFor: 'Festivals, Weddings & Client Appreciation'
  },
  {
    id: 'grand-8',
    name: 'Grand Celebration Box (8 Items)',
    capacity: 8,
    badge: 'Ultra-Premium Edition',
    description: 'A lavish banquet of 4 Luxury Sweets, 3 Gourmet Namkeens, and 1 Premium Dry Fruit Assortment in a rigid keepsake box.',
    recommendedFor: 'Corporate Gifting, VIP Associates & Grand Festivities'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Festive Motichoor & Besan Ladoo Platter',
    category: 'Sweets',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85',
    description: 'Freshly prepared pure ghee Motichoor ladoos garnished with pistachios and saffron strands.'
  },
  {
    id: 'g-2',
    title: 'Golden Crispy Spiral Chakli',
    category: 'Namkeen',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1000&q=85',
    description: 'Traditional bhajani flour chakli extruded in spirals and fried to crispy golden perfection.'
  },
  {
    id: 'g-3',
    title: 'Traditional Stuffed Karanji',
    category: 'Diwali Special',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85',
    description: 'Flaky crescent turnovers packed with dry coconut, poppy seeds, nuts, and aromatic cardamom.'
  },
  {
    id: 'g-4',
    title: 'Premium Kaju Katli Silvers',
    category: 'Sweets',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1000&q=85',
    description: 'Diamond-cut pure cashew fudge made with whole cashews and refined cardamom syrup.'
  },
  {
    id: 'g-5',
    title: 'Poha Chivda & Sev Medley',
    category: 'Namkeen',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=85',
    description: 'Roasted beaten rice tossed with peanuts, curry leaves, turmeric, and fine gram sev.'
  },
  {
    id: 'g-6',
    title: 'Luxury Festive Gift Boxes & Hampers',
    category: 'Gift Boxes',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=85',
    description: 'Customizable sweet and snack gift hampers decorated for Diwali and family occasions.'
  },
  {
    id: 'g-7',
    title: 'Desi Ghee Jalebi & Syrupy Treats',
    category: 'Sweets',
    image: 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=1000&q=85',
    description: 'Crisp concentric spirals soaked in saffron cardamom syrup for sweet celebrations.'
  },
  {
    id: 'g-8',
    title: 'Fresh Festive Faral Platter',
    category: 'Diwali Special',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85',
    description: 'Complete authentic festive faral arrangement with ladoo, chakli, shankarpali, and chivda.'
  }
];

export const WHY_CHOOSE_US = [
  {
    title: 'Freshly Prepared',
    description: 'Prepared with a focus on freshness, hygienic handling, and authentic homemade taste in every batch.',
    icon: 'Sparkles',
    highlight: 'Made in small fresh batches'
  },
  {
    title: 'Quality Ingredients',
    description: 'Carefully selected premium ingredients, pure desi ghee, and real spices for delicious traditional flavours.',
    icon: 'ShieldCheck',
    highlight: 'Select nuts & pure ghee'
  },
  {
    title: 'Traditional Taste',
    description: 'Classic Indian recipes inspired by authentic regional culinary traditions that remind you of home.',
    icon: 'Utensils',
    highlight: 'Heritage time-tested recipes'
  },
  {
    title: 'Perfect for Celebrations',
    description: 'Special sweets and crunchy snacks thoughtfully prepared for festivals, weddings, and family gatherings.',
    icon: 'PartyPopper',
    highlight: 'Festivals & happy moments'
  },
  {
    title: 'Custom Gift Options',
    description: 'Choose attractive combinations of sweets and namkeens in festive boxes tailored for your loved ones.',
    icon: 'Gift',
    highlight: 'Bespoke festive packaging'
  },
  {
    title: 'Bulk Orders',
    description: 'Seamless inquiry and ordering flow for corporate gifting, wedding favours, and large family celebrations.',
    icon: 'PackageCheck',
    highlight: 'Event & corporate support'
  }
];
