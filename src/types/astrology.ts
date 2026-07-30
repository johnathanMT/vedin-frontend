// Shapes mirror the .NET AstrologyController DTOs (POST /api/astrology/chart).

export interface BirthChartRequest {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  timeZone: string   // IANA id, e.g. "Asia/Yangon"
  latitude: number
  longitude: number
  ayanamsa?: string
}

export interface PlanetStrength {
  sthanaBala: number
  digBala: number
  kalaBala: number
  cheshtaBala: number
  naisargikaBala: number
  drikBala: number
  totalVirupas: number
  totalRupas: number
  requiredRupas: number
  sufficient: boolean
}

export interface PlanetPosition {
  name: string
  longitude: number
  sign: number          // 0 = Aries … 11 = Pisces
  signName: string
  signNameSa: string
  degreeInSign: number
  nakshatra: number     // 0–26
  nakshatraName: string
  pada: number          // 1–4
  house: number         // 1–12
  retrograde: boolean
  combust: boolean
  dignity: string
  navamsaSign: number   // D9 sign
  navamsaSignName: string
  declination: number
  vargas: Record<string, number>   // D2,D3,D7,D9,D10,D12 → sign
  aspectsHouses: number[]
  aspectsPlanets: string[]
  strength: PlanetStrength | null
}

export interface AscendantInfo {
  longitude: number
  sign: number
  signName: string
  signNameSa: string
  degreeInSign: number
  nakshatra: number
  nakshatraName: string
  pada: number
  navamsaSign: number
  navamsaSignName: string
}

export interface ChartMeta {
  ayanamsa: string
  houseSystem: string
  julianDayUt: number
  utcIso: string
  latitude: number
  longitude: number
}

export interface DashaPeriod {
  lord: string
  startUtc: string   // yyyy-MM-dd
  endUtc: string
  years: number
}

export interface Yoga {
  name: string
  description: string
  planets: string[]
}

export interface Finding {
  code: string
  planet: string
  house: number
  value: string
}

export interface AreaPrediction {
  area: string
  tone: string
  score: number
  findings: Finding[]
}

export interface TransitPos {
  planet: string
  sign: number
  signName: string
  houseFromLagna: number
  houseFromMoon: number
}

export interface TransitNote {
  tone: string
  code: string
  planet: string
  house: number
}

export interface YearForecast {
  year: number
  age: number
  maha: string
  bhukti: string
  stars: number
  sadeSati: boolean
  transits: TransitPos[]
  notes: TransitNote[]
}

export interface AshtakavargaData {
  bav: Record<string, number[]>   // planet → 12 signs
  sav: number[]                    // 12 signs
}

export interface BirthChartData {
  ascendant: AscendantInfo
  planets: PlanetPosition[]
  dashas: DashaPeriod[]
  antardashas: DashaPeriod[]
  pratyantardashas: DashaPeriod[]
  yogas: Yoga[]
  predictions: AreaPrediction[]
  timeline: YearForecast[]
  ashtakavarga: AshtakavargaData
  meta: ChartMeta
}
