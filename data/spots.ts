/**
 * Modelo de Datos - Spots
 * Scope 1.1: Tipo Spot según definición de producto
 * 
 * Campos según definición:
 * - nombre (opcional)
 * - ubicación en mapa (lat/lng)
 * - fotos (array)
 * - descripción breve (opcional)
 * - horarios (si aplica)
 * - costos (si aplica)
 * - tipo (playa, café, mirador, museo, etc.)
 * - ubicación ajustable (pin ajustable)
 */

export type SpotType =
  | 'beach'
  | 'cafe'
  | 'viewpoint'
  | 'museum'
  | 'restaurant'
  | 'park'
  | 'monument'
  | 'market'
  | 'other';

export type SpotHours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

export type SpotCost = {
  currency: string;
  amount: number;
  description?: string;
};

export type SpotHowToVisit = {
  bestTime?: {
    icon: string;
    text: string;
  };
  photography?: {
    icon: string;
    text: string;
  };
};

export type SpotNarration = {
  anticipation?: string;
  presence?: string;
  transition?: string;
};

export type AIGeneratedMetadata = {
  generatedAt?: Date;
  model?: string;
  source?: 'ai' | 'manual' | 'hybrid';
};

export interface Spot {
  id: string;
  name?: string; // Opcional
  location: {
    latitude: number;
    longitude: number;
    adjustable?: boolean; // Pin ajustable
  };
  photos: string[]; // Array de URLs o paths
  description?: string; // Opcional, descripción breve (mantener para backwards compatibility)
  type: SpotType;
  hours?: SpotHours; // Si aplica
  cost?: SpotCost; // Si aplica
  restrictions?: string; // Restrictions information
  accessibility?: string; // Accessibility information
  // Campos para AI Content Generator (Scope 12.1)
  whyItMatters?: string; // Por qué importa este lugar - reemplaza uso de description en Spot Detail
  culturalContext?: string; // Contexto cultural
  howToVisit?: SpotHowToVisit; // Tips de visita (mejor hora, fotografía)
  narration?: SpotNarration; // Narrativas para audio (NO visibles en UI)
  aiGenerated?: AIGeneratedMetadata; // Metadatos de generación AI
  createdBy?: string; // ID del usuario que creó el spot (opcional para backward compatibility)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Spots reales de la Riviera Maya (Cancún a Tulum)
 * Basados en investigación de hidden gems y spots del CSV proporcionado
 */
export const mockSpots: Spot[] = [
  // === CANCÚN ===
  {
    id: 'cancun-yamil-luum',
    name: 'Yamil Lu\'um (Templo del Alacrán)',
    location: {
      latitude: 21.1325,
      longitude: -86.7472,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Small Mayan temple that served as a pre-Columbian lighthouse in Cancún\'s Hotel Zone.',
    type: 'monument',
    whyItMatters: 'Yamil Lu\'um stands as a testament to the Maya\'s sophisticated understanding of navigation and their deep connection to the sea. Perched on the highest natural point along Cancún\'s coastline, this temple served as a lighthouse for ancient mariners, guiding them safely through Caribbean waters. Its name, meaning "Scorpion Temple," comes from a sculpture found within, connecting the site to Maya cosmology.',
    culturalContext: 'Built during the late Postclassic period (1200-1550 AD), Yamil Lu\'um represents the Maya\'s maritime expertise. The temple\'s strategic location demonstrates how the Maya used natural topography to create functional sacred spaces. Today, it offers a rare glimpse into pre-Columbian navigation practices, standing as a bridge between ancient wisdom and modern understanding of the Caribbean coast.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning or late afternoon for best lighting and fewer crowds. Sunset offers dramatic views over the Caribbean.',
      },
      photography: {
        icon: 'camera',
        text: 'The elevated position provides panoramic ocean views. Capture the contrast between ancient stone and modern coastline.',
      },
    },
    narration: {
      anticipation: 'As you approach, the ancient temple emerges from the modern landscape, a reminder that this coast has been sacred for centuries.',
      presence: 'Stand where Maya priests once performed rituals, with the vast Caribbean stretching before you. Feel the connection between land, sea, and sky.',
      transition: 'Carry this moment of ancient wisdom with you. The Maya understood this place deeply, and now you do too.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cancun-el-rey',
    name: 'El Rey Archaeological Site',
    location: {
      latitude: 21.0636,
      longitude: -86.7789,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Mayan archaeological site with 47 structures in Cancún\'s Hotel Zone.',
    type: 'monument',
    whyItMatters: 'El Rey was a thriving coastal trading hub between 1300 and 1500 AD, connecting the Maya world with Caribbean trade routes. The site\'s 47 structures reveal a sophisticated urban center that flourished through commerce and cultural exchange. Its name comes from a sculpture of a monarch discovered here, symbolizing the site\'s importance.',
    culturalContext: 'El Rey represents the Postclassic Maya period, when coastal cities became vital trading centers. The site shows how the Maya adapted to maritime commerce, creating a unique blend of inland traditions and coastal innovation. Today, it stands as a peaceful reminder of Cancún\'s ancient past, nestled within the modern hotel zone.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning (8-10 AM) to avoid heat and crowds. The site opens at 8 AM daily.',
      },
      photography: {
        icon: 'camera',
        text: 'The temple structures offer interesting angles against the modern skyline. Early morning light creates dramatic shadows.',
      },
    },
    narration: {
      anticipation: 'As you walk through the hotel zone, ancient stones emerge—remnants of a city that once thrived here.',
      presence: 'You stand in what was once a bustling trading port. Feel the energy of merchants, priests, and travelers who passed through these plazas.',
      transition: 'The past and present coexist here. Take this sense of continuity with you as you continue exploring.',
    },
    cost: {
      currency: 'MXN',
      amount: 65,
      description: 'General admission',
    },
    hours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '8:00 - 17:00',
      sunday: '8:00 - 17:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cancun-isla-contoy',
    name: 'Isla Contoy',
    location: {
      latitude: 21.4774,
      longitude: -86.8081,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Protected and uninhabited island, sanctuary for over 150 species of tropical birds.',
    type: 'beach',
    whyItMatters: 'Isla Contoy is a pristine sanctuary where nature reigns supreme. This uninhabited island, accessible to only 200 visitors per day, protects one of the Caribbean\'s most important bird nesting sites. The untouched beaches and crystal-clear waters offer a rare glimpse of the Caribbean as it once was—wild, pristine, and teeming with life.',
    culturalContext: 'Protected as a national park since 1998, Isla Contoy represents Mexico\'s commitment to conservation. The island serves as a critical nesting ground for sea turtles and a sanctuary for over 150 bird species, including frigatebirds and brown pelicans. This is what the Caribbean looked like before mass tourism—a reminder of what we must protect.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Tours depart early morning (around 8 AM) from Cancún or Isla Mujeres. Book in advance as daily access is limited to 200 visitors.',
      },
      photography: {
        icon: 'camera',
        text: 'Bring binoculars and a telephoto lens for bird watching. The pristine beaches offer stunning landscape photography opportunities.',
      },
    },
    narration: {
      anticipation: 'As the boat approaches, you see an island untouched by development—white sand, turquoise water, and the calls of countless birds.',
      presence: 'You\'ve arrived at a place where nature still rules. Every step reveals new life: nesting birds, turtle tracks, and the pure rhythm of the sea.',
      transition: 'This is the Caribbean as it was meant to be. Carry this vision of pristine beauty with you.',
    },
    restrictions: 'Access limited to 200 visitors per day. No overnight stays. Bring your own food and water. No fishing or collecting shells.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cancun-musa',
    name: 'MUSA - Underwater Museum of Art',
    location: {
      latitude: 21.1000,
      longitude: -86.7833,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    ],
    description: 'Underwater museum with over 500 sculptures that promote coral life.',
    type: 'museum',
    whyItMatters: 'MUSA represents a unique fusion of art and marine conservation. Over 500 sculptures submerged between 3-6 meters create an artificial reef, promoting coral growth and marine biodiversity. This innovative project demonstrates how human creativity can support nature\'s resilience, creating a living underwater gallery that evolves with time.',
    culturalContext: 'Created by British sculptor Jason deCaires Taylor, MUSA opened in 2010 as a response to coral reef degradation. The sculptures, made from pH-neutral materials, provide surfaces for coral and marine life to colonize. This project shows how art can serve ecological purposes, creating beauty while supporting the underwater ecosystem.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best visibility is during dry season (November-April). Morning dives offer calmer conditions.',
      },
      photography: {
        icon: 'camera',
        text: 'Underwater photography requires waterproof equipment. The sculptures become more beautiful as coral and marine life colonize them.',
      },
    },
    narration: {
      anticipation: 'As you descend into the blue, sculptures emerge from the depths—art becoming life, life becoming art.',
      presence: 'You float among silent figures, watching as coral transforms them into living monuments. This is where creativity meets conservation.',
      transition: 'Surface with a new understanding: art can heal, can grow, can become part of the ecosystem it celebrates.',
    },
    cost: {
      currency: 'MXN',
      amount: 1500,
      description: 'Snorkel tour (includes equipment)',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === PLAYA DEL CARMEN ===
  {
    id: 'playa-portal-maya',
    name: 'Portal Maya (Mayan Gateway)',
    location: {
      latitude: 20.6218395,
      longitude: -87.074722,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/774df971b_IMG_0363.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/2981c9aee_IMG_0361.jpeg',
    ],
    description: 'Contemporary monument celebrating Mayan heritage in Playa del Carmen.',
    type: 'monument',
    whyItMatters: 'Portal Maya stands as a vibrant celebration of the region\'s deep Mayan heritage. This contemporary installation serves as a symbolic gateway, connecting the ancient past with the modern present. The towering figures, incorporating symbols from Maya mythology, invite reflection on the enduring significance of this land and the civilization that once flourished here.',
    culturalContext: 'Located in the heart of Playa del Carmen, Portal Maya represents the town\'s evolution from a modest fishing village to a bustling tourist destination. The monument honors the Maya people\'s connection to nature and their ancestral roots, serving as a reminder of the rich cultural tapestry that defines the Riviera Maya. It embodies the resilience and ongoing relevance of Maya culture in today\'s world.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning or during sunset for softer light and fewer crowds. The monument is beautifully lit at night.',
      },
      photography: {
        icon: 'camera',
        text: 'The intricate details and vibrant colors are best captured in natural light. Include the surrounding area to show context.',
      },
    },
    narration: {
      anticipation: 'As you approach, vibrant colors and intricate designs emerge—a modern tribute to ancient wisdom.',
      presence: 'Stand before these towering figures that rise from the earth, connecting land and sky. Feel the continuity of Maya culture across centuries.',
      transition: 'This gateway reminds you that the past is always present. Carry this sense of cultural continuity forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'playa-parque-fundadores',
    name: 'Parque Fundadores',
    location: {
      latitude: 20.6220372,
      longitude: -87.0749961,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/a14d94c9c_IMG_0362.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/7b8060950_IMG_0361.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/01921500f_IMG_0364.jpeg',
    ],
    description: 'Parque central de Playa del Carmen con el Portal Maya y eventos culturales.',
    type: 'park',
    whyItMatters: 'Parque Fundadores serves as the vibrant heart of Playa del Carmen, where locals and visitors gather to enjoy the beauty of nature and community. This park is not just a green space—it\'s a cultural hub where traditional music, art, and dance come alive, creating a sense of belonging and celebrating the town\'s identity.',
    culturalContext: 'The park holds significant place in Playa del Carmen\'s identity, symbolizing the connection to the region\'s rich Mayan heritage. The presence of the Portal Maya installation highlights the cultural depth of the area, inviting reflections on historical narratives and the contributions of the Mayan civilization. It serves as a living museum where past and present coexist harmoniously.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for a quieter experience, or in the evening when cultural events often take place.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the Portal Maya against the ocean backdrop. Evening events offer great opportunities for street photography.',
      },
    },
    narration: {
      anticipation: 'The sounds of the nearby ocean set the stage as you approach this gathering place.',
      presence: 'You\'re in the heart of Playa del Carmen, where community spirit and cultural pride come together. Feel the energy of daily life.',
      transition: 'This park embodies the town\'s soul. Take this sense of community and cultural celebration with you.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'playa-calle-38-norte',
    name: 'Calle 38 Norte',
    location: {
      latitude: 20.635344599113886,
      longitude: -87.06595301628114,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/20dc928f5_IMG_0341.jpeg',
    ],
    description: 'Vibrant street with boutiques, cafés and galleries showcasing authentic local life.',
    type: 'other',
    whyItMatters: 'Calle 38 Norte embodies the authentic spirit of Playa del Carmen, showcasing a unique blend of local life, art, and gastronomy. This lively street serves as a cultural and social artery, where colorful boutiques, quaint cafes, and galleries invite exploration. Here, you can experience the genuine warmth of local culture, from friendly shopkeepers to captivating street performances.',
    culturalContext: 'Historically, Calle 38 Norte has evolved alongside the local community, reflecting the changing dynamics of urban life. It has become a symbol of resilience and creativity, embodying the rich tapestry of traditions and practices of the people who inhabit it. The area has blossomed into a cultural hub, drawing inspiration from its surroundings while fostering a sense of belonging among its residents.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during late afternoon for cooler temperatures and vibrant street performances. Weekends are especially lively.',
      },
      photography: {
        icon: 'camera',
        text: 'The murals and street art are perfect for capturing memorable moments. Don\'t forget your camera for the colorful facades.',
      },
    },
    narration: {
      anticipation: 'As you step onto this street, vibrant energy envelops you—the pulse of authentic Playa del Carmen.',
      presence: 'You\'re surrounded by local life: musicians playing, art spilling onto sidewalks, the warmth of community. This is the real Playa.',
      transition: 'Carry this sense of authentic culture with you. These streets tell stories of resilience and creativity.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === TULUM ===
  {
    id: 'tulum-ruins',
    name: 'Tulum Ruins',
    location: {
      latitude: 20.2167082,
      longitude: -87.4352661,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/d6e3ce5f2_image.jpg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/27c816d7f_image.jpg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/9b2c84b97_image.jpg',
    ],
    description: 'Ruinas mayas costeras con vistas espectaculares al Mar Caribe.',
    type: 'monument',
    whyItMatters: 'The Tulum ruins serve as a breathtaking portal into Maya civilization, showcasing impressive architectural prowess against a stunning Caribbean backdrop. These well-preserved remnants stand on cliffs overlooking the sea, illustrating the synergy between nature and human ingenuity. The iconic El Castillo commands respect not just for its scale but for its strategic position, which served as both lighthouse and watchtower.',
    culturalContext: 'Tulum was a prominent city in the late post-classic period of Maya civilization, serving as a vital trade hub. The walls surrounding the ruins provided protection while framing a unique architectural style. Tulum\'s strategic coastal location allowed it to flourish as an economic center, where goods like jade, obsidian, and textiles were exchanged. Today, it stands as a symbol of indigenous identity and resilience.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning (8-10 AM) or late afternoon (4-5 PM) to avoid crowds and midday heat. Sunrise offers magical lighting.',
      },
      photography: {
        icon: 'camera',
        text: 'The combination of ancient architecture and Caribbean backdrop is stunning. El Castillo against the ocean is an iconic shot.',
      },
    },
    narration: {
      anticipation: 'As you approach, ancient walls rise from the cliffs, silhouetted against the Caribbean—a city that once watched over the sea.',
      presence: 'You stand where Maya traders once gathered, where the sea met civilization. The ocean stretches endlessly before you, just as it did for them.',
      transition: 'This place connected the Maya world to the Caribbean. Carry that sense of connection—between land, sea, and human endeavor.',
    },
    cost: {
      currency: 'MXN',
      amount: 90,
      description: 'General admission',
    },
    hours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '8:00 - 17:00',
      sunday: '8:00 - 17:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-xcacel-beach',
    name: 'Xcacel Beach',
    location: {
      latitude: 20.3375839,
      longitude: -87.3483575,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/98b6b7acc_Xcacel_05.jpg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/de94f8532_Xcacel.jpg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/7c16583d8_Xcacel-area-natural-protegida-estatal-PORTADA-900x675.png',
    ],
    description: 'Playa virgen y santuario de tortugas marinas entre Playa del Carmen y Tulum.',
    type: 'beach',
    whyItMatters: 'Xcacel Beach is a hidden gem on Mexico\'s Riviera Maya, known not only for its stunning natural beauty but also for its significant role in conservation efforts. This pristine beach is part of the larger Xcacel-Xcacelito protected area, which is crucial for the nesting of sea turtles, particularly the endangered green turtle. Every year, these majestic creatures return to the sandy shores to lay their eggs, making Xcacel Beach an important ecological site.',
    culturalContext: 'The significance of Xcacel Beach goes beyond its aesthetic appeal; it embodies the cultural connection of local communities to the land and its natural resources. The ancient Mayans revered the sea and considered it a vital source of life. In present-day, environmental conservation is intertwined with cultural identity for the descendants of the Mayans and local inhabitants. Protecting Xcacel\'s environment has become synonymous with preserving their heritage.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early in the day to enjoy tranquility and avoid crowds. Turtle nesting season is May-October.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the stunning coastal scenery and wildlife, but remember to respect the habitat. No flash photography near nesting areas.',
      },
    },
    narration: {
      anticipation: 'As you step onto the fine white sands, the tranquil sounds of Caribbean waves greet you like an old friend.',
      presence: 'You\'re on a beach where nature still rules. Sea turtles nest here, the water is pristine, and the beauty is untouched.',
      transition: 'This is what beaches were meant to be—wild, protected, alive. Carry this vision of pristine nature forward.',
    },
    restrictions: 'Respect nesting sites during turtle season (May-October). Avoid loud music and disruptive activities. Take your trash with you.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-laguna-kaan-luum',
    name: 'Laguna Kaan Luum',
    location: {
      latitude: 20.1165,
      longitude: -87.6315,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Laguna de color verde vibrante con un cenote profundo en su centro.',
    type: 'beach',
    whyItMatters: 'Laguna Kaan Luum is a stunning natural wonder just 15 minutes from Tulum, where vibrant turquoise waters encircle a deep cenote at its center. The contrast between the shallow, warm lagoon and the mysterious dark blue cenote creates a mesmerizing visual effect. This peaceful spot offers a perfect escape from crowded beaches, allowing you to connect with nature in tranquility.',
    culturalContext: 'The lagoon represents the unique geology of the Yucatán Peninsula, where cenotes (natural sinkholes) connect to underground river systems. For the ancient Maya, cenotes were sacred portals to the underworld. Today, Laguna Kaan Luum offers a modern connection to these natural wonders, showcasing the region\'s geological and cultural significance.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning or late afternoon for fewer crowds and better light. The water is warm year-round.',
      },
      photography: {
        icon: 'camera',
        text: 'The color contrast between the shallow lagoon and deep cenote is stunning. Aerial views are especially dramatic.',
      },
    },
    narration: {
      anticipation: 'As you approach, vibrant turquoise waters appear—a lagoon that seems to glow with inner light.',
      presence: 'You float in warm, shallow waters that suddenly drop into a deep cenote. The contrast is mesmerizing—light and dark, shallow and deep.',
      transition: 'This place shows the hidden depths beneath the surface. Carry this sense of mystery and beauty with you.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-la-hoja-verde',
    name: 'La Hoja Verde',
    location: {
      latitude: 20.2112198,
      longitude: -87.4617417,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    ],
    description: 'Organic and sustainable restaurant celebrating Tulum\'s culinary ethics.',
    type: 'restaurant',
    whyItMatters: 'La Hoja Verde stands as a celebration of Tulum\'s culinary ethos, emphasizing organic and sustainable practices that honor the Earth. This restaurant is not just a place to eat; it\'s a hub for those who seek healthy, nourishing meals crafted with care. Each dish reflects the region\'s rich agricultural legacy, showcasing locally sourced vegetables that burst with flavor and color.',
    culturalContext: 'Tulum, with its deep-rooted Mayan heritage, has long been influenced by the surrounding natural landscape, which is mirrored in local culinary practices. La Hoja Verde embodies this connection, aligning with the local movement toward eco-friendly dining and wellness. Dining here is not only an act of nourishment but also a way of engaging with the identity of Tulum itself, which has transformed into a sanctuary for those seeking a retreat grounded in nature and conscious living.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during early evening to enjoy soft sunset light and cooler temperatures. Make reservations during busy seasons.',
      },
      photography: {
        icon: 'camera',
        text: 'The lush greenery and natural setting create beautiful dining photos. Fresh juices and colorful dishes are photogenic.',
      },
    },
    narration: {
      anticipation: 'As you step in, the air is infused with vibrant colors and aromas of fresh, local ingredients.',
      presence: 'You dine under the shade of lush greenery, creating an intimate connection with nature while enjoying your meal.',
      transition: 'This is how food should be—nourishing, sustainable, connected to the land. Carry this philosophy forward.',
    },
    hours: {
      monday: '8:00 - 22:00',
      tuesday: '8:00 - 22:00',
      wednesday: '8:00 - 22:00',
      thursday: '8:00 - 22:00',
      friday: '8:00 - 23:00',
      saturday: '8:00 - 23:00',
      sunday: '8:00 - 22:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-calle-satelite-sur',
    name: 'Calle Satélite Sur',
    location: {
      latitude: 20.2105638,
      longitude: -87.4577519,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Lively street showcasing Tulum\'s authentic spirit with shops, cafés and galleries.',
    type: 'other',
    whyItMatters: 'Calle Satélite Sur stands as a pivotal point for both locals and visitors seeking to experience the authentic spirit of Tulum. This bustling street features a diverse array of shops, cafes, and art galleries, each contributing to the rich tapestry of local life. The blend of traditional and contemporary influences becomes palpable as you stroll along, showcasing the creativity and resilience of the Tulum community.',
    culturalContext: 'Historically, Calle Satélite Sur is indicative of Tulum\'s transformation and growth as a center for tourism while maintaining its cultural roots. This street reflects the innovative spirit of the local populace, who blend modern aesthetics with traditional craftsmanship. It stands testament to Tulum\'s ongoing narrative of sustainability, where community and ecology interweave in daily life.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning or late afternoon for a cooler stroll. Weekends are especially vibrant with artisan markets.',
      },
      photography: {
        icon: 'camera',
        text: 'The street art and colorful facades are perfect for capturing the authentic Tulum vibe. Keep an eye out for artisan markets.',
      },
    },
    narration: {
      anticipation: 'As you wander down this street, the vibrant energy of Tulum envelops you, drawing you into a world where culture and community thrive.',
      presence: 'You\'re surrounded by local life: artisans displaying crafts, culinary experts serving local flavors, the spirit of authentic Tulum.',
      transition: 'This street embodies Tulum\'s soul—creative, sustainable, connected. Carry this sense of authentic community forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-parque-dos-aguas',
    name: 'Parque Dos Aguas',
    location: {
      latitude: 20.2100977,
      longitude: -87.4631378,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Peaceful park showcasing Tulum\'s dedication to preserving natural beauty.',
    type: 'park',
    whyItMatters: 'Parque Dos Aguas, often regarded as the heart of local serenity, showcases Tulum\'s dedication to preserving natural beauty amidst urban development. This park is not just a green space; it serves as a vibrant communal hub where families gather, children laugh, and locals connect with nature in their daily lives. With its lush greenery and winding paths, it offers a perfect backdrop for leisurely strolls or contemplative moments.',
    culturalContext: 'Parque Dos Aguas is emblematic of Tulum\'s approach to sustainable living and environmental stewardship. In a region marked by significant cultural heritage and a strong connection to nature, the park embodies local values that prioritize ecological conservation alongside community development. It reflects a movement towards responsible tourism and environmental awareness.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning or late afternoon for cooler temperatures and less crowding. The park is peaceful throughout the day.',
      },
      photography: {
        icon: 'camera',
        text: 'The lush greenery and natural setting create beautiful photos. Capture families enjoying the space and the natural beauty.',
      },
    },
    narration: {
      anticipation: 'As you step into the park, a tranquil oasis unfolds before you, promising a refreshing escape from the bustling energy of Tulum.',
      presence: 'You\'re in a space where nature and community meet. Families gather, children play, and the natural world is preserved and celebrated.',
      transition: 'This park shows how development and nature can coexist. Carry this vision of sustainable living forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === PUERTO MORELOS ===
  {
    id: 'puerto-morelos-faro-inclinado',
    name: 'Faro Inclinado (Leaning Lighthouse)',
    location: {
      latitude: 20.8475841,
      longitude: -86.8750631,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/fffbbc993_IMG_0426.webp',
    ],
    description: 'Iconic leaning lighthouse that is a symbol of Puerto Morelos\' resilience.',
    type: 'monument',
    whyItMatters: 'The Faro Inclinado, known as the Leaning Lighthouse, stands as a testament to Puerto Morelos\' maritime history. Originally built to guide fishermen and sailors safely home, this lighthouse has defied nature with its intriguing tilt, making it not only a functional structure but also a captivating piece of art. Its leaning structure has become a symbol of resilience and adaptation in the face of changing tides and storms.',
    culturalContext: 'Historically, the Faro Inclinado stands as part of the coastal navigation system that has been vital for maritime activities along the Yucatan Peninsula\'s shores. Its quirky lean, resulting from a hurricane in the late 20th century, has inadvertently turned it into a local icon. The community takes pride in its lighthouse, intertwining local identity with the surrounding natural beauty and the traditions of seafaring that define their history and culture.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best time to visit is early morning or late afternoon to catch stunning light for photography.',
      },
      photography: {
        icon: 'camera',
        text: 'The unique tilt and surrounding scenery make for iconic photos. The lighthouse against the Caribbean is especially dramatic.',
      },
    },
    narration: {
      anticipation: 'As you approach, the iconic leaning lighthouse appears—a structure that defies expectations, just like the town itself.',
      presence: 'You stand before a lighthouse that leans but still stands, a symbol of resilience. The Caribbean stretches before you, just as it did for the fishermen it once guided.',
      transition: 'This lighthouse embodies the spirit of Puerto Morelos—adaptable, resilient, connected to the sea. Carry this strength forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-muelle-pescadores',
    name: 'Muelle de Pescadores',
    location: {
      latitude: 20.847527469824062,
      longitude: -86.8750709295273,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/9c06ac0f2_IMG_0429.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/2476f1136_IMG_0428.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/e8a3d2583_IMG_0430.jpeg',
    ],
    description: 'Pier connecting the local fishing community with visitors, heart of Puerto Morelos.',
    type: 'other',
    whyItMatters: 'The Muelle de Pescadores serves as the lifeblood of Puerto Morelos, connecting the vibrant local fishing community with visitors eager to experience the genuine essence of this coastal town. Here, the sounds of fishermen preparing their boats echo against the surf, creating a symphony of daily life. This dock not only supports the livelihoods of local anglers but also invites travelers to engage with the maritime culture of the region.',
    culturalContext: 'Historically, Puerto Morelos has been a small fishing village that has evolved while maintaining a strong connection to its roots. The Muelle de Pescadores stands as a testament to this heritage, reflecting the town\'s identity shaped by the sea and its resources. This dock has served as a hub for fisheries and as a gathering place for local artisans and vendors, enhancing the community aspect of the town.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the early morning to see fishermen at work and enjoy cooler temperatures. This is when the dock is most active.',
      },
      photography: {
        icon: 'camera',
        text: 'The vibrant colors of boats and markets provide great photography opportunities. Capture the daily life of the fishing community.',
      },
    },
    narration: {
      anticipation: 'As the warm breeze carries the scent of the sea, you find yourself drawn to the bustling atmosphere of the fishing dock.',
      presence: 'You\'re at the heart of Puerto Morelos, where fishermen prepare their boats and the daily rhythm of maritime life unfolds. This is authentic coastal Mexico.',
      transition: 'This dock represents the town\'s soul—connected to the sea, sustained by fishing, welcoming to all. Carry this sense of community forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-centro-cultural',
    name: 'Centro Cultural y Museo Puerto Morelos',
    location: {
      latitude: 20.848464937887343,
      longitude: -86.87628865242006,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/079b95eb3_IMG_0434.jpeg',
    ],
    description: 'Centro cultural que preserva la historia y tradiciones de Puerto Morelos.',
    type: 'museum',
    whyItMatters: 'Nestled in the heart of Puerto Morelos, the Centro Cultural y Museo stands as a beacon of the town\'s rich history and cultural diversity. It serves not only as a museum showcasing the art and traditions of the region but also as a cultural center where community events and workshops take place, celebrating local artists and their contributions. Visitors are given a unique opportunity to engage with various exhibitions that reflect the life of the Mayans, the local marine environment, and the customs that shape the identity of Puerto Morelos today.',
    culturalContext: 'The Centro Cultural y Museo Puerto Morelos plays a vital role in emphasizing the significance of the local identity and heritage. Established to honor the deep-rooted connections of the community to its Mayan origins, the center serves as a living archive that educates visitors about the area\'s history, marine ecosystems, and artistic expressions. It reflects a profound respect for the indigenous cultures while showcasing the evolving narrative of Puerto Morelos as a modern coastal town.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best to visit in the morning or late afternoon when it\'s cooler and less crowded. Check the schedule for workshops or special events.',
      },
      photography: {
        icon: 'camera',
        text: 'The vibrant exhibits and the atmosphere of the center are worth capturing. Ask staff about photography policies.',
      },
    },
    narration: {
      anticipation: 'Stepping into the cultural center feels like uncovering a hidden treasure of local heritage.',
      presence: 'You\'re surrounded by stories—of the Maya, of the sea, of a fishing village that became a town. This is Puerto Morelos\' memory.',
      transition: 'This center preserves what matters. Carry this understanding of the town\'s identity and heritage forward.',
    },
    hours: {
      monday: '9:00 - 17:00',
      tuesday: '9:00 - 17:00',
      wednesday: '9:00 - 17:00',
      thursday: '9:00 - 17:00',
      friday: '9:00 - 17:00',
      saturday: '9:00 - 17:00',
      sunday: '10:00 - 15:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-parque-fundadores',
    name: 'Parque Fundadores Puerto Morelos',
    location: {
      latitude: 20.8477153,
      longitude: -86.8760676,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Parque que sirve como punto de encuentro central en Puerto Morelos.',
    type: 'park',
    whyItMatters: 'Parque Fundadores serves as a vibrant gathering spot in the coastal town, where locals and visitors alike can enjoy the beauty of nature and community. This park is not just a place to relax, but also a venue for various cultural events that showcase the rich traditions of the area. The pathways, lined with native plants, invite you to stroll leisurely while admiring the sculptures and art installations that celebrate the artistic spirit of Puerto Morelos.',
    culturalContext: 'Historically, Parque Fundadores has played a significant role in fostering community and celebrating local culture. As a space dedicated to both recreation and creativity, it reflects the town\'s evolution while honoring traditional customs. Local artisans often display their crafts here, emphasizing the importance of preserving cultural practices and promoting the identity of Puerto Morelos as a fishing village that has grown into a charming tourist destination.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the early morning or late afternoon for cooler temperatures and fewer crowds.',
      },
      photography: {
        icon: 'camera',
        text: 'The park\'s art and natural beauty are worth capturing. Don\'t forget your camera for the sculptures and coastal views.',
      },
    },
    narration: {
      anticipation: 'As you step into the park, the lively sounds of the nearby ocean set the stage for a refreshing experience.',
      presence: 'You\'re in a place where community gathers, where art meets nature, where the spirit of Puerto Morelos comes alive.',
      transition: 'This park embodies the town\'s heart—welcoming, creative, connected to the sea. Carry this sense of community forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-arrecife',
    name: 'Parque Nacional Arrecife de Puerto Morelos',
    location: {
      latitude: 20.9054732,
      longitude: -86.828322,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/495ddc3f9_IMG_0431.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/d49eb7d7a_IMG_0432.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/0f65986b7_IMG_0433.jpeg',
    ],
    description: 'National park protecting one of the last reefs of the Mesoamerican barrier system.',
    type: 'park',
    whyItMatters: 'Parque Nacional Arrecife de Puerto Morelos is a treasure trove of marine biodiversity, celebrated for its stunning coral reefs that are among the last remaining in the Mesoamerican barrier reef system. This national park serves as a crucial sanctuary for countless marine species including sea turtles, rays, and a dazzling variety of fish. The clear turquoise waters and gentle waves not only provide a picturesque setting but also support a flourishing underwater community.',
    culturalContext: 'Historically, the area around the park has been integral to the local economy, particularly for fishing and tourism. The community has a deep-rooted connection to the sea, and this park embodies a commitment to sustaining that relationship with the environment. The establishment of the national park reflects a broader recognition of the need to protect delicate marine ecosystems, which are key to the cultural identity and livelihood of the residents.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best time to visit is early morning for calm waters and fewer crowds. Dry season (November-April) offers best visibility.',
      },
      photography: {
        icon: 'camera',
        text: 'Bring a waterproof camera to capture stunning underwater scenes. The coral and marine life are spectacular.',
      },
    },
    narration: {
      anticipation: 'As you approach the protected waters, vibrant hues of the Caribbean greet you, inviting you to discover a world beneath the surface.',
      presence: 'You float above a living reef, watching as sea turtles glide past and colorful fish dart among the coral. This is the Caribbean as it should be—alive, protected, thriving.',
      transition: 'This reef protects the coast and sustains life. Carry this understanding of the ocean\'s importance forward.',
    },
    restrictions: 'Respect the coral—no touching or stepping on it. Use reef-safe sunscreen. Follow guide instructions for safety.',
    cost: {
      currency: 'MXN',
      amount: 150,
      description: 'Park entrance fee',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-galeria-artezissimo',
    name: 'Galería Artezissimo',
    location: {
      latitude: 20.855232582136225,
      longitude: -86.8733060359955,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/ba1de3190_IMG_0437.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/4cee09ba6_IMG_0436.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/0e42b9da6_IMG_0435.jpeg',
    ],
    description: 'Contemporary art gallery showcasing local and international talent.',
    type: 'museum',
    whyItMatters: 'Galería Artezissimo is not just an art gallery; it is a hub of creativity where local and international artists converge to exhibit their work. This dynamic space showcases a diverse array of contemporary pieces, from stunning paintings to intricate sculptures, each telling its own story and reflecting the current artistic trends. What sets it apart is its commitment to fostering art appreciation within the community through workshops, artist talks, and collaborative events.',
    culturalContext: 'Galería Artezissimo plays an essential role in the artistic identity of the region. By promoting both emerging and established talent, the gallery contributes to the development of a thriving cultural environment. It helps bridge the gap between traditional art forms and contemporary practices, allowing local artists to explore their identities while engaging with broader themes relevant to society today.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best time to visit is during the opening night of a new exhibition for a vibrant atmosphere. Weekdays are less crowded.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the intricate details and stunning artwork. Ask first if photography is allowed in specific exhibitions.',
      },
    },
    narration: {
      anticipation: 'Stepping into the gallery feels like entering a vibrant tapestry of contemporary artistic expression.',
      presence: 'You\'re surrounded by creativity—each piece tells a story, each artist shares a vision. This is where art comes alive.',
      transition: 'Art connects us to culture, to emotion, to each other. Carry this sense of creative expression forward.',
    },
    hours: {
      monday: '10:00 - 18:00',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 20:00',
      saturday: '10:00 - 20:00',
      sunday: '11:00 - 17:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === CENOTES Y LAGUNAS ===
  {
    id: 'cenote-nohoch-nah-chich',
    name: 'Cenote Nohoch Nah Chich',
    location: {
      latitude: 20.2000,
      longitude: -87.4000,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    ],
    description: 'Parte del sistema de cuevas Sac Actun, ideal para buceo y snorkel.',
    type: 'other',
    whyItMatters: 'Cenote Nohoch Nah Chich is part of the vast Sac Actun cave system, offering a mesmerizing underwater experience. With its crystal-clear waters and intricate limestone formations, it\'s a haven for divers and snorkelers. The cenote\'s name translates to "Giant Birdhouse," reflecting the area\'s rich biodiversity. This natural wonder connects to the world\'s largest underwater cave system, making it a must-visit for adventure seekers.',
    culturalContext: 'For the ancient Maya, cenotes were sacred portals to the underworld, places of ritual and spiritual significance. Today, these natural formations continue to inspire awe and respect. The extensive cave systems beneath the Yucatán Peninsula represent one of the world\'s most unique geological features, formed over millions of years and now protected as natural treasures.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for best visibility and fewer crowds. Dry season (November-April) offers clearest water.',
      },
      photography: {
        icon: 'camera',
        text: 'Underwater photography requires waterproof equipment. The limestone formations and clear water create stunning images.',
      },
    },
    narration: {
      anticipation: 'As you descend into the depths, a subterranean world of wonder unfolds before you.',
      presence: 'You float in crystal-clear water, surrounded by ancient limestone formations. This is a sacred space, a portal to another world.',
      transition: 'The cenote connects you to the earth\'s hidden depths. Carry this sense of mystery and natural wonder forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 500,
      description: 'Snorkel tour (includes equipment)',
    },
    restrictions: 'Follow guide instructions. No touching formations. Use biodegradable sunscreen only.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cenote-nicte-ha',
    name: 'Cenote Nicte-Ha',
    location: {
      latitude: 20.2500,
      longitude: -87.4500,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Cenote abierto con lirios flotantes y aguas turquesas, perfecto para snorkel.',
    type: 'other',
    whyItMatters: 'Cenote Nicte-Ha is a serene, open-air cenote adorned with floating lily pads and surrounded by lush jungle. Its clear, calm waters are ideal for snorkeling, offering glimpses of underwater flora and fauna. The cenote\'s tranquil ambiance makes it a perfect spot for relaxation and reflection, away from the more frequented tourist sites.',
    culturalContext: 'The name "Nicte-Ha" means "flower water" in Maya, reflecting the cenote\'s natural beauty. These open cenotes were particularly important to the Maya, as they provided access to fresh water and served as gathering places. Today, they continue to be places of natural beauty and spiritual significance.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for the best light and peaceful atmosphere. The lily pads are most beautiful in morning light.',
      },
      photography: {
        icon: 'camera',
        text: 'The floating lily pads and turquoise water create stunning photos. Underwater shots of the flora are especially beautiful.',
      },
    },
    narration: {
      anticipation: 'As you approach through the jungle, the cenote appears like an emerald gem, surrounded by floating flowers.',
      presence: 'You float in turquoise water, lily pads drifting around you. This is tranquility itself—a natural pool of peace.',
      transition: 'This cenote offers pure serenity. Carry this sense of calm and natural beauty with you.',
    },
    cost: {
      currency: 'MXN',
      amount: 300,
      description: 'Entrance fee',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'punta-laguna',
    name: 'Punta Laguna Nature Reserve',
    location: {
      latitude: 20.6500,
      longitude: -87.5500,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Community sanctuary protecting spider and howler monkeys.',
    type: 'park',
    whyItMatters: 'Punta Laguna is a community-run sanctuary dedicated to the preservation of spider and howler monkeys. Visitors can kayak on the tranquil lagoon, zip-line across the water, and embark on guided jungle treks to observe monkeys in their natural habitat. The reserve offers an authentic and immersive experience, connecting visitors with the region\'s rich biodiversity and cultural heritage.',
    culturalContext: 'Punta Laguna represents a successful model of community-based conservation, where local people protect and benefit from their natural resources. The reserve showcases the importance of sustainable tourism and the role of local communities in preserving biodiversity. It also offers insights into Mayan culture through traditional ceremonies and interactions with local guides.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning when monkeys are most active. The reserve opens at 8 AM. Guided tours are recommended.',
      },
      photography: {
        icon: 'camera',
        text: 'Bring a telephoto lens for monkey photography. The jungle setting offers great opportunities for wildlife and nature shots.',
      },
    },
    narration: {
      anticipation: 'As you enter the reserve, the calls of howler monkeys echo through the trees—you\'re entering their world.',
      presence: 'You watch monkeys swing through the canopy, kayak across the lagoon, and connect with the jungle\'s rhythm. This is nature at its most alive.',
      transition: 'This reserve shows how communities can protect nature. Carry this model of conservation forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 200,
      description: 'Entrance fee (guided tour extra)',
    },
    restrictions: 'Follow guide instructions. Keep quiet to observe monkeys. No feeding wildlife.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'muyil-sian-kaan',
    name: 'Muyil & Sian Ka\'an Canal Float',
    location: {
      latitude: 20.0700,
      longitude: -87.6060,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Mayan ruins and floating through ancient canals in the Sian Ka\'an Biosphere Reserve.',
    type: 'monument',
    whyItMatters: 'Muyil is an ancient Mayan trading post located at the edge of the Sian Ka\'an Biosphere Reserve. After exploring the ruins, visitors can embark on a unique experience: floating down a crystal-clear canal built by the Maya over a thousand years ago. This serene "lazy river" ride through mangroves and wetlands provides a peaceful connection with nature and history.',
    culturalContext: 'Sian Ka\'an, meaning "Gate of Heaven" in Maya, is a UNESCO World Heritage Site encompassing diverse ecosystems. Muyil was a vital trading hub, and the canals demonstrate the Maya\'s sophisticated understanding of water management. Today, the reserve protects one of Mexico\'s most important ecosystems, showcasing the connection between ancient wisdom and modern conservation.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for cooler temperatures and better wildlife viewing. The float is especially peaceful in the morning.',
      },
      photography: {
        icon: 'camera',
        text: 'The ruins and canal offer stunning photography opportunities. Waterproof camera recommended for the float.',
      },
    },
    narration: {
      anticipation: 'As you approach, ancient ruins emerge from the jungle, and beyond them, the promise of floating through Maya-built canals.',
      presence: 'You float down a canal built over a thousand years ago, surrounded by mangroves and the sounds of the reserve. This is timeless.',
      transition: 'The Maya understood this place deeply. Carry this connection to ancient wisdom and natural beauty forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 100,
      description: 'Ruins entrance (canal tour extra)',
    },
    hours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '8:00 - 17:00',
      sunday: '8:00 - 17:00',
    },
    restrictions: 'Follow guide instructions in the reserve. Use biodegradable sunscreen. Respect wildlife.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === PLAYAS SECRETAS ===
  {
    id: 'playa-punta-esmeralda',
    name: 'Punta Esmeralda',
    location: {
      latitude: 20.6483209,
      longitude: -87.0507496,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Playa escondida conocida por su belleza natural y ambiente relajado, perfecta para escapar de las playas bulliciosas.',
    type: 'beach',
    whyItMatters: 'Punta Esmeralda is a hidden gem known for its stunning natural beauty and laid-back atmosphere, making it the perfect escape from the bustling beaches of Playa del Carmen. This serene beach features soft white sand and clear, calm waters, ideal for swimming, sunbathing, and watching the local wildlife. The beach is also distinguished by its unique cenote, which offers a refreshing contrast to the warm ocean waters.',
    culturalContext: 'Punta Esmeralda is part of the Yucatán Peninsula\'s diverse ecological and cultural tapestry, where land and sea converge to create unique habitats. As part of the larger Riviera Maya region, it reflects the area\'s historical roots, influenced by both the ancient Mayan civilization and the diverse modern communities that have settled here. This beach embodies the harmonious blend of tradition and contemporary life, showcasing the enduring connection the local population has with the natural surroundings.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early in the morning or late afternoon for the best lighting and fewer crowds. The cenote is especially refreshing in the afternoon.',
      },
      photography: {
        icon: 'camera',
        text: 'The combination of beach and cenote creates unique photo opportunities. Capture the contrast between ocean and cenote waters.',
      },
    },
    narration: {
      anticipation: 'As you step onto the sandy shores, the vibrant hues of turquoise water capture your breath.',
      presence: 'You\'re on a beach where tranquility reigns. The cenote offers a cool contrast to the warm ocean, and the natural beauty is undisturbed.',
      transition: 'This is the Riviera Maya as it should be—peaceful, natural, beautiful. Carry this sense of serenity forward.',
    },
    restrictions: 'Respect the natural environment. Take your trash with you. The cenote requires caution—check depth before diving.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'playa-72',
    name: 'Playa 72',
    location: {
      latitude: 20.64130351842349,
      longitude: -87.05734312534332,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Refugio tranquilo donde las aguas azules se encuentran con las arenas doradas, ofreciendo un escape perfecto.',
    type: 'beach',
    whyItMatters: 'Playa 72 is not just another beach; it\'s a tranquil haven where the azure waters meet the golden sands, offering a perfect escape from the bustling world. Renowned for its serene beauty and lesser crowds, this beach provides a unique space for relaxation and reflection, making it a favorite among locals seeking respite from daily life. Here, you can unwind under the sun, take leisurely strolls along the shore, or indulge in various water activities like snorkeling and paddleboarding.',
    culturalContext: 'Historically, Playa 72 reflects the evolving identity of the region, where traditions of fishing and community connection to the sea have shaped the local lifestyle. This coastline has long been a gathering place, not only for leisure but also for cultural expressions, such as music and dance, fostering a sense of belonging among those who visit. As seaside development has increased, Playa 72 has maintained its character, standing as a testament to the community\'s efforts to preserve its natural beauty and cultural significance.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early in the morning or late in the afternoon to avoid midday heat and enjoy stunning sunrises or sunsets.',
      },
      photography: {
        icon: 'camera',
        text: 'The golden hour provides stunning lighting for beach photography. Capture families enjoying the space and the natural beauty.',
      },
    },
    narration: {
      anticipation: 'As you step onto the soft sands, the rhythmic sound of the waves greets you like an old friend.',
      presence: 'You\'re on a beach where time slows down. Families gather, the sun sets, and the simple joys of coastal life unfold.',
      transition: 'This beach embodies the spirit of laid-back coastal living. Carry this sense of peace and simplicity forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'xpu-ha-secret',
    name: 'Xpu-Ha Secret Beach',
    location: {
      latitude: 20.5000,
      longitude: -87.2000,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Tramo de playa de arena blanca conocida por sus aguas claras y ambiente relajado.',
    type: 'beach',
    whyItMatters: 'Xpu-Ha is a stretch of white-sand beach known for its clear waters and laid-back atmosphere. While parts of the beach have gained popularity, there are lesser-known entrances leading to quieter sections where visitors can enjoy the sun and sea in relative solitude. Local beach bars offer fresh ceviche and cold drinks, enhancing the authentic beach experience.',
    culturalContext: 'Xpu-Ha represents the authentic beach culture of the Riviera Maya, where local businesses and natural beauty coexist. The beach has maintained its character despite nearby development, offering visitors a glimpse of the region\'s coastal lifestyle. It serves as a reminder of the simple pleasures of beach life—sun, sand, sea, and good food.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during weekdays for fewer crowds. Early morning offers the most peaceful experience.',
      },
      photography: {
        icon: 'camera',
        text: 'The white sand and turquoise water create classic beach photos. Capture the relaxed atmosphere and local beach bars.',
      },
    },
    narration: {
      anticipation: 'As you approach, white sand and turquoise water appear—a classic Caribbean beach scene.',
      presence: 'You\'re on a beach that feels authentic. Local bars serve fresh food, the water is clear, and the vibe is relaxed.',
      transition: 'This is beach life as it should be—simple, authentic, beautiful. Carry this sense of coastal ease forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === EK BALAM (Valladolid area, but important for Riviera Maya) ===
  {
    id: 'ek-balam',
    name: 'Ek Balam Archaeological Site',
    location: {
      latitude: 20.8920,
      longitude: -88.1415,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Mayan archaeological site with an impressive pyramid that can still be climbed for panoramic views.',
    type: 'monument',
    whyItMatters: 'Ek Balam is a Maya archaeological site that stands out for its impressive main pyramid, the Acropolis, which visitors can still climb for panoramic views of the surrounding jungle. Less crowded than Chichén Itzá, it offers a more intimate experience with Maya history. The site\'s well-preserved structures and intricate stucco decorations provide a unique glimpse into Maya artistry and architectural sophistication.',
    culturalContext: 'Ek Balam, meaning "Black Jaguar" in Maya, was a powerful city during the Late Classic period (600-900 AD). The site is renowned for its elaborate stucco decorations, including the famous "Winged Warriors" on the Acropolis. Unlike many other Maya sites, Ek Balam allows visitors to climb its structures, offering a rare opportunity to experience these ancient buildings from the perspective of the Maya themselves.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning (8-10 AM) to avoid heat and crowds. The climb is easier in cooler temperatures.',
      },
      photography: {
        icon: 'camera',
        text: 'The view from the Acropolis is spectacular. Capture the jungle panorama and the intricate stucco decorations.',
      },
    },
    narration: {
      anticipation: 'As you approach, the Acropolis rises from the jungle—a pyramid that still invites you to climb, to see what the Maya saw.',
      presence: 'You stand atop the Acropolis, looking out over the jungle just as Maya priests once did. The view is timeless, the connection profound.',
      transition: 'This site offers intimacy with Maya history. Carry this sense of connection to ancient wisdom forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 413,
      description: 'Entrance fee',
    },
    hours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '8:00 - 17:00',
      sunday: '8:00 - 17:00',
    },
    restrictions: 'Climbing requires caution. Follow marked paths. No climbing during rain.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];
