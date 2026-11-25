import penangHeatmapImg from "@/assets/penang-heatmap.jpg";

export type Zone = {
  id: string;
  name: string;
  area: string;
  detail: string;
  crowdLevel: string;
  waitEstimate: string;
  advice: string;
  source: string;
  marker?: { x: number; y: number };
};

const boardSource = "https://hebpenang.gov.my/waterfall-road-temple/";

export const penangGroundsMap = penangHeatmapImg;

export const penangZones: Zone[] = [
  {
    id: "hilltop",
    name: "Hilltop Murugan Temple",
    area: "Hilltop Sanctuary (Top of 513 Steps)",
    detail: "Consecrated in June 2012, this is widely acclaimed as the largest Lord Murugan temple outside India. Crowned by a 7-storey, 21.6 m Raja Gopuram, housing Lord Balathandayuthapani with 360-degree panoramic views of George Town and the Malacca Strait.",
    crowdLevel: "78% High Crowd",
    waitEstimate: "35–45 mins",
    advice: "Devotees queue along marble corridors. Special archanai counters available beside the inner prakaram.",
    source: boardSource,
    marker: { x: 64, y: 27 },
  },
  {
    id: "stairway",
    name: "Hillside Stairway (513 Steps)",
    area: "Uphill Pilgrim Route",
    detail: "513 wide stone steps winding through the lush rainforest canopy of Penang Hill. Surpasses Batu Caves (272 steps) in step count. Features shaded rest pavilions and water fountains every 100 steps.",
    crowdLevel: "64% Moderate Flow",
    waitEstimate: "20–25 mins climb",
    advice: "Climb at a comfortable pace. Keep to the right side; please do not feed wild monkeys along the path.",
    source: boardSource,
    marker: { x: 58, y: 49 },
  },
  {
    id: "old-shrine",
    name: "Old Murugan Temple",
    area: "Mid-Hill Heritage Complex",
    detail: "Historic heritage temple established around 1850 by early Indian immigrants. Served as the primary Thaipusam festival venue for over 160 years before the new hilltop sanctum was opened in 2012.",
    crowdLevel: "43% Moderate",
    waitEstimate: "10 mins wait",
    advice: "A serene mid-way worship point where pilgrims carrying paal kudam (milk pots) pause for prayer.",
    source: boardSource,
    marker: { x: 41, y: 48 },
  },
  {
    id: "shiva",
    name: "Lord Shiva Statue (Dhyana Plaza)",
    area: "Foothill Meditation Courtyard",
    detail: "Magnificent 8.23-metre (27-foot) seated statue of Lord Shiva in Dhyana meditation posture overlooking the arrival forecourt. Surrounded by landscaped gardens, oil lamp stations, and quiet prayer benches.",
    crowdLevel: "25% Low Crowd",
    waitEstimate: "No wait",
    advice: "Ideal peaceful zone for senior citizens and pilgrims resting after descending the hill.",
    source: boardSource,
    marker: { x: 27, y: 74 },
  },
  {
    id: "main-entrance",
    name: "Main Entrance & Rajagopuram",
    area: "Foothill Arrival Concourse",
    detail: "Grand lower gateway and arrival plaza on Jalan Kebun Bunga (Waterfall Road) adjacent to Penang Botanic Gardens. Houses footwear deposit counters, prasad stalls, and information office.",
    crowdLevel: "30% Low Crowd",
    waitEstimate: "Entry moving freely",
    advice: "Free footwear deposit available at base counters. Modest temple attire covering shoulders and knees is required.",
    source: "https://www.mypenang.gov.my/uploads/downloads/Penang-Tourist-Map_EN.pdf",
    marker: { x: 50, y: 76 },
  },
  {
    id: "parking",
    name: "Temple Car Park & Coach Bay",
    area: "Visitor Parking Facility",
    detail: "Designated Waterfall Road parking facility with 200+ car bays, dedicated tour bus coach bays, and two-wheeler parking lanes managed under Penang Hindu Endowments Board supervision.",
    crowdLevel: "68% Moderate",
    waitEstimate: "160 slots open",
    advice: "During Thaipusam and major festival days, traffic wardens direct overflow vehicles to the Youth Park parking bays.",
    source: "https://corporate.penanghill.gov.my/images/images/Press_Release/2024/ENG_PENANG_HILL_CABLE_CAR_PROJECT_TRAFFIC_MANAGEMENT_AND_CONSTRUCTION_UPDATES.pdf",
    marker: { x: 74, y: 87 },
  },
  {
    id: "ganeshar",
    name: "Arulmigu Sree Ganeshar Temple",
    area: "Foothill Base Shrine",
    detail: "Sacred shrine dedicated to Lord Ganesha at the foot of the hill. Customarily, all pilgrims offer first prayers here to remove obstacles before undertaking the 513-step pilgrimage.",
    crowdLevel: "35% Normal",
    waitEstimate: "5–10 mins",
    advice: "Coconut breaking and modak offerings available at the shrine counter.",
    source: "https://eribi.gov.my/ribi/arulmigu-sree-ganeshar-temple-waterfall",
    marker: { x: 44, y: 81 },
  },
];
