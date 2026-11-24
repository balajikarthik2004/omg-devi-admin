// Map image uses OpenStreetMap geometry within 100.29285, 5.43155, 100.29740, 5.43385.
// Marker positions are percentages within that same image extent.
type Zone = {
  id: string;
  name: string;
  area: string;
  detail: string;
  source: string;
  marker?: { x: number; y: number };
};

const boardSource = "https://hebpenang.gov.my/waterfall-road-temple/";

export const penangGroundsMap = "/temples/penang-balathandayuthapani/grounds-map.webp";

export const penangZones: Zone[] = [
  {
    id: "hilltop",
    name: "Hilltop Murugan shrine",
    area: "Hilltop",
    detail: "The main shrine houses Lord Murugan. Its seven-storey gopuram rises 21.6 m above the entrance.",
    source: boardSource,
    marker: { x: 15.62, y: 56.54 },
  },
  {
    id: "stairway",
    name: "Pilgrim stairway",
    area: "Uphill route",
    detail: "The hilltop shrine is reached by climbing more than 500 steps. The old Murugan shrine stands partway up.",
    source: boardSource,
    marker: { x: 41.06, y: 49.26 },
  },
  {
    id: "shiva",
    name: "Shiva statue",
    area: "Foothill",
    detail: "The 8.23 m Shiva statue stands in the temple grounds at the foot of the hill.",
    source: boardSource,
    marker: { x: 65.19, y: 49.51 },
  },
  {
    id: "ganeshar",
    name: "Arulmigu Sree Ganeshar Temple",
    area: "Foothill",
    detail: "This shrine stands before the stair climb and offers a place to pray for visitors who cannot climb to the hilltop.",
    source: "https://eribi.gov.my/ribi/arulmigu-sree-ganeshar-temple-waterfall",
    marker: { x: 72.5, y: 45.19 },
  },
  {
    id: "waterfall-road",
    name: "Jalan Kebun Bunga access",
    area: "Road approach",
    detail: "The grounds are approached from Jalan Kebun Bunga, also known as Waterfall Road, in Pulau Tikus.",
    source: "https://www.mypenang.gov.my/uploads/downloads/Penang-Tourist-Map_EN.pdf",
    marker: { x: 81.25, y: 10.25 },
  },
  {
    id: "old-shrine",
    name: "Old Murugan shrine",
    area: "Partway up the hill",
    detail: "The temple board dates the old shrine to 1850. It was the main Thaipusam venue until the current hilltop temple opened.",
    source: boardSource,
  },
  {
    id: "parking",
    name: "Temple car park",
    area: "Visitor parking",
    detail: "Penang Hill Corporation lists a designated Waterfall Hilltop Temple car park.",
    source: "https://corporate.penanghill.gov.my/images/images/Press_Release/2024/ENG_PENANG_HILL_CABLE_CAR_PROJECT_TRAFFIC_MANAGEMENT_AND_CONSTRUCTION_UPDATES.pdf",
  },
];
