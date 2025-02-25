// Constants for the Chain Home radar simulation
export const RADAR_CONSTANTS = {
  RADAR_RANGE: 150, // Miles
  MIN_ALTITUDE: 1000, // Feet
  MAX_ALTITUDE: 30000, // Feet
  SWEEP_WIDTH: 1200,
  SCOPE_HEIGHT: 300,
  PLAN_VIEW_SIZE: 400,
  PHOSPHOR_PERSISTENCE: 20,
  MAX_PREVIOUS_TRACES: 3,
  KM_TO_MILES: 0.621371,
};

export const FREQUENCIES = [
  { value: 20, label: "20 MHz (15m)" },
  { value: 22, label: "22 MHz (13.6m)" },
  { value: 25, label: "25 MHz (12m)" },
  { value: 30, label: "30 MHz (10m)" }
];

export const AIRCRAFT_TYPES = [
  {
    type: "He 111",
    minSpeed: 230,
    maxSpeed: 255,
    minAlt: 13000,
    maxAlt: 22000,
    isEscort: false,
    wingspan: 22.5 // in meters (historically accurate)
  },
  // Add other aircraft types...
];

// Utility functions
export const getMaxRangeForAltitude = (altitude) => {
  // Maximum range based on the Earth's curvature and target altitude
  const altitudeFt = Math.max(altitude, RADAR_CONSTANTS.MIN_ALTITUDE);
  const nauticalMiles = 1.23 * Math.sqrt(altitudeFt);
  return nauticalMiles * 1.15;
};
