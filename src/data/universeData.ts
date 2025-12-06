export type ResourceType = 'Water' | 'Minerals' | 'Gas' | 'Food' | 'Tech';

export interface MarketData {
    produces: ResourceType[];
    demands: ResourceType[];
}

export interface MoonData {
  name: string;
  size: number;
  distance: number;
  speed: number;
  color: string;
}

export interface CelestialBodyData {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  description: string;
  hasRings?: boolean;
  moons?: MoonData[];
  atmosphereColor?: string;
  realDiameter: string;
  temperature: string;
  yearDuration: string;
  market?: MarketData; // New field
}

export interface StarSystemData {
  id: string;
  name: string;
  position: [number, number, number]; 
  star: CelestialBodyData;
  planets: CelestialBodyData[];
}

export const solarSystem: StarSystemData = {
  id: 'sol',
  name: 'Solar System',
  position: [15, 0, 5],
  star: {
    name: "Sun",
    color: "#FFD700",
    size: 2.5,
    distance: 0,
    speed: 0,
    description: "The star at the center of our Solar System.",
    realDiameter: "1,392,700 km",
    temperature: "5,500°C",
    yearDuration: "N/A"
  },
  planets: [
    { 
        name: "Mercury", color: "#A5A5A5", size: 0.4, distance: 6, speed: 1.5, 
        description: "The smallest planet in the Solar System.",
        realDiameter: "4,880 km", temperature: "167°C", yearDuration: "88 days",
        market: { produces: ['Minerals'], demands: ['Water', 'Tech'] }
    },
    { 
        name: "Venus", color: "#E3BB76", size: 0.6, distance: 8, speed: 1.2, 
        description: "The second planet from the Sun. Thick atmosphere.", atmosphereColor: "#ffddaa",
        realDiameter: "12,104 km", temperature: "464°C", yearDuration: "225 days",
        market: { produces: ['Gas'], demands: ['Water', 'Food'] }
    },
    { 
        name: "Earth", color: "#2233FF", size: 0.6, distance: 10, speed: 1.0, 
        description: "Our home planet.", atmosphereColor: "#4488ff",
        realDiameter: "12,742 km", temperature: "15°C", yearDuration: "365 days",
        moons: [{ name: "Moon", size: 0.15, distance: 1.2, speed: 3, color: "#DDDDDD" }],
        market: { produces: ['Food', 'Water', 'Tech'], demands: ['Minerals', 'Gas'] }
    },
    { 
        name: "Mars", color: "#FF4500", size: 0.5, distance: 12, speed: 0.8, 
        description: "The Red Planet.", atmosphereColor: "#ffccaa",
        realDiameter: "6,779 km", temperature: "-65°C", yearDuration: "687 days",
        market: { produces: ['Minerals'], demands: ['Water', 'Food', 'Tech'] }
    },
    { 
        name: "Jupiter", color: "#D2B48C", size: 1.5, distance: 16, speed: 0.5, 
        description: "The largest planet, a gas giant.",
        realDiameter: "139,820 km", temperature: "-110°C", yearDuration: "12 years",
        market: { produces: ['Gas'], demands: ['Tech', 'Minerals'] }
    },
    { 
        name: "Saturn", color: "#F4A460", size: 1.2, distance: 20, speed: 0.4, hasRings: true, 
        description: "Famous for its ring system.",
        realDiameter: "116,460 km", temperature: "-140°C", yearDuration: "29 years",
        market: { produces: ['Gas', 'Minerals'], demands: ['Tech', 'Food'] }
    },
    { 
        name: "Uranus", color: "#ADD8E6", size: 1.0, distance: 24, speed: 0.3, 
        description: "An ice giant.",
        realDiameter: "50,724 km", temperature: "-195°C", yearDuration: "84 years",
        market: { produces: ['Water', 'Gas'], demands: ['Tech', 'Minerals'] }
    },
    { 
        name: "Neptune", color: "#00008B", size: 1.0, distance: 28, speed: 0.2, 
        description: "The most distant planet.",
        realDiameter: "49,244 km", temperature: "-200°C", yearDuration: "165 years",
        market: { produces: ['Water', 'Gas'], demands: ['Tech', 'Food'] }
    },
  ]
};

export const alphaCentauri: StarSystemData = {
    id: 'alpha-centauri',
    name: 'Alpha Centauri',
    position: [-20, 2, -15],
    star: {
        name: "Alpha Centauri A",
        color: "#FFF4E8",
        size: 2.8,
        distance: 0,
        speed: 0,
        description: "The closest star system to the Solar System.",
        realDiameter: "1,700,000 km",
        temperature: "5,790 K",
        yearDuration: "N/A"
    },
    planets: [
        {
            name: "Proxima b", color: "#D2691E", size: 0.7, distance: 8, speed: 2.0,
            description: "A potentially habitable exoplanet orbiting Proxima Centauri.",
            realDiameter: "Unknown", temperature: "-39°C", yearDuration: "11.2 days",
            market: { produces: ['Minerals'], demands: ['Tech', 'Water'] }
        },
        {
            name: "Proxima c", color: "#88AAFF", size: 1.1, distance: 14, speed: 0.8,
            description: "A super-Earth or mini-Neptune.",
            realDiameter: "Unknown", temperature: "-200°C", yearDuration: "5.2 years",
            market: { produces: ['Gas'], demands: ['Tech'] }
        }
    ]
};

export const trappist1: StarSystemData = {
    id: 'trappist-1',
    name: 'TRAPPIST-1',
    position: [5, -5, 25],
    star: {
        name: "TRAPPIST-1",
        color: "#FF4400",
        size: 1.5, 
        distance: 0,
        speed: 0,
        description: "An ultra-cool red dwarf star with 7 Earth-sized planets.",
        realDiameter: "168,000 km",
        temperature: "2,566 K",
        yearDuration: "N/A"
    },
    planets: [
        { name: "TRAPPIST-1b", color: "#AA5555", size: 0.5, distance: 5, speed: 2.5, description: "Rocky planet closest to the star.", realDiameter: "1.12 Earths", temperature: "400 K", yearDuration: "1.5 days", market: { produces: ['Minerals'], demands: ['Water'] } },
        { name: "TRAPPIST-1c", color: "#AAAAAA", size: 0.55, distance: 7, speed: 2.0, description: "Likely has a thick atmosphere.", realDiameter: "1.10 Earths", temperature: "340 K", yearDuration: "2.4 days", market: { produces: ['Gas'], demands: ['Tech'] } },
        { name: "TRAPPIST-1e", color: "#44AA44", size: 0.5, distance: 11, speed: 1.2, description: "Located in the habitable zone. Potential liquid water.", realDiameter: "0.92 Earths", temperature: "250 K", yearDuration: "6.1 days", market: { produces: ['Water'], demands: ['Tech', 'Food'] } },
        { name: "TRAPPIST-1h", color: "#5555AA", size: 0.4, distance: 18, speed: 0.5, description: "The furthest planet, an ice world.", realDiameter: "0.75 Earths", temperature: "170 K", yearDuration: "18.7 days", market: { produces: ['Water'], demands: ['Tech'] } }
    ]
};

export const universe = [solarSystem, alphaCentauri, trappist1];