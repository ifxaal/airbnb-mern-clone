// Curated demo properties used as zero-crash graceful fallback if database is sleeping or empty
const fallbackProperties = [
  {
    _id: "demo-prop-1",
    title: "Seaside Haven Luxury Beach Villa",
    description: "Experience ultimate luxury right on the golden sands of Baga Beach. Features a private infinity pool, direct ocean access, sunset deck, gourmet kitchen, and complimentary breakfast prepared by our private chef.",
    location: "Goa, India",
    pricePerNight: 8500,
    category: "Beachfront",
    isSuperhost: true,
    rating: 4.95,
    reviewsCount: 38,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Private Pool", "Beachfront", "High-speed Wi-Fi", "Air Conditioning", "Chef on Request", "Free Parking"],
    owner: {
      _id: "demo-owner-1",
      name: "Aditi Rao",
      email: "aditi.rao@stayease.demo"
    }
  },
  {
    _id: "demo-prop-2",
    title: "Cedarwood Pine Mountain Chalet",
    description: "Tucked inside lush pine forests of Old Manali with snow-capped Himalayan peak views. Complete with an indoor stone fireplace, panoramic glass conservatory, private jacuzzi, and mountain trekking trail access.",
    location: "Manali, Himachal Pradesh",
    pricePerNight: 5200,
    category: "Mountain",
    isSuperhost: true,
    rating: 4.88,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Fireplace", "Mountain View", "Wi-Fi", "Heating", "Hot Tub", "Bonfire Area"],
    owner: {
      _id: "demo-owner-2",
      name: "Vikram Sharma",
      email: "vikram.sharma@stayease.demo"
    }
  },
  {
    _id: "demo-prop-3",
    title: "Royal Rajputana Heritage Haveli Suite",
    description: "Step into royal splendor in the heart of the Pink City. Restored 18th-century architecture featuring hand-carved jharokhas, courtyards with peacocks, antique four-poster beds, and sunset terrace facing Nahargarh Fort.",
    location: "Jaipur, Rajasthan",
    pricePerNight: 6800,
    category: "Heritage",
    isSuperhost: false,
    rating: 4.91,
    reviewsCount: 29,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Heritage Courtyard", "High-speed Wi-Fi", "Air Conditioning", "Breakfast Included", "Guided City Tour"],
    owner: {
      _id: "demo-owner-3",
      name: "Rana Pratap Singh",
      email: "rana.pratap@stayease.demo"
    }
  },
  {
    _id: "demo-prop-4",
    title: "Serene Backwaters Waterfront Cottage",
    description: "A peaceful private wooden cottage surrounded by tranquil Kerala canals and swaying coconut palms. Enjoy authentic Ayurvedic spa treatments, traditional canoe boating, fresh seafood, and stargazing from the open patio.",
    location: "Alleppey, Kerala",
    pricePerNight: 4600,
    category: "Nature",
    isSuperhost: true,
    rating: 4.97,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Waterfront", "Canoe Boat", "Wi-Fi", "Air Conditioning", "Ayurvedic Spa", "Kitchenette"],
    owner: {
      _id: "demo-owner-4",
      name: "Mathew George",
      email: "mathew.george@stayease.demo"
    }
  },
  {
    _id: "demo-prop-5",
    title: "Marine Drive Skyline Panoramic Loft",
    description: "Ultra-chic duplex penthouse loft offering unbroken views of the Arabian Sea and the Queen's Necklace. Designer Scandinavian interior, dedicated creative workspace with gigabit fiber, and 24/7 concierge security.",
    location: "Mumbai, Maharashtra",
    pricePerNight: 9800,
    category: "Luxury",
    isSuperhost: true,
    rating: 4.93,
    reviewsCount: 31,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Sea View", "Dedicated Workspace", "Gigabit Wi-Fi", "Gym Access", "24/7 Concierge", "Smart TV"],
    owner: {
      _id: "demo-owner-5",
      name: "Pooja Mehta",
      email: "pooja.mehta@stayease.demo"
    }
  },
  {
    _id: "demo-prop-6",
    title: "Greenwood Valley Coffee Estate Villa",
    description: "Nestled within an active 25-acre organic coffee plantation in Coorg. Wake up to the aroma of freshly roasted beans, misty valley views, bird watching trails, private BBQ lawn, and estate trekking guides.",
    location: "Coorg, Karnataka",
    pricePerNight: 4900,
    category: "Nature",
    isSuperhost: false,
    rating: 4.82,
    reviewsCount: 24,
    image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Plantation Tour", "BBQ Grill", "Wi-Fi", "Pet Friendly", "Indoor Games", "Complimentary Breakfast"],
    owner: {
      _id: "demo-owner-6",
      name: "Bopanna Cariappa",
      email: "bopanna@stayease.demo"
    }
  },
  {
    _id: "demo-prop-7",
    title: "Skyline Glass Penthouse & Rooftop Lounge",
    description: "Modern architectural marvel in the heart of Indiranagar. Floor-to-ceiling soundproof glass, open-air landscaped rooftop deck, Sonos sound system, and smart home automation throughout.",
    location: "Bangalore, Karnataka",
    pricePerNight: 6200,
    category: "Luxury",
    isSuperhost: true,
    rating: 4.89,
    reviewsCount: 45,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Rooftop Lounge", "Smart Home", "High-speed Wi-Fi", "Air Conditioning", "Workspace", "EV Charger"],
    owner: {
      _id: "demo-owner-7",
      name: "Karan Johar",
      email: "karan.johar@stayease.demo"
    }
  },
  {
    _id: "demo-prop-8",
    title: "Lake Pichola Sunrise Heritage Studio",
    description: "Romantic lake-facing studio with private jharokha balcony overlooking Lake Palace. Stone polished arches, handcrafted furnishings, rooftop dining, and boat pier steps from your door.",
    location: "Udaipur, Rajasthan",
    pricePerNight: 5800,
    category: "Heritage",
    isSuperhost: true,
    rating: 4.96,
    reviewsCount: 51,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Lake View", "Balcony", "Wi-Fi", "Air Conditioning", "Rooftop Restaurant", "Room Service"],
    owner: {
      _id: "demo-owner-8",
      name: "Mahima Shekhawat",
      email: "mahima@stayease.demo"
    }
  }
];

const fallbackReviews = {
  "demo-prop-1": [
    {
      _id: "rev-1-1",
      user: { name: "Rohan Kapoor" },
      rating: 5,
      comment: "Absolutely breathtaking property right on Baga beach! The private chef prepared incredible coastal meals. Worth every rupee.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
    },
    {
      _id: "rev-1-2",
      user: { name: "Sneha Nair" },
      rating: 5,
      comment: "Clean, luxurious, and the sunset from the deck is unforgettable. Will definitely return with family.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12)
    }
  ],
  "demo-prop-2": [
    {
      _id: "rev-2-1",
      user: { name: "Arjun Verma" },
      rating: 5,
      comment: "Waking up to the pine forests and snow peaks was pure magic. Fireplace kept us cozy throughout chilly evenings.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8)
    }
  ]
};

module.exports = { fallbackProperties, fallbackReviews };
