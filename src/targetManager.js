import { AIRCRAFT_TYPES } from './constants.js';

// Create a new target with realistic properties
export const createTarget = (range, bearing) => {
  const bearingRad = (bearing * Math.PI) / 180;
  const isEscortMission = Math.random() < 0.3;
  const possibleTypes = AIRCRAFT_TYPES.filter(a => a.isEscort === isEscortMission);
  const aircraft = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
  
  const speed = aircraft.minSpeed + Math.random() * (aircraft.maxSpeed - aircraft.minSpeed);
  const altitude = aircraft.minAlt + Math.random() * (aircraft.maxAlt - aircraft.minAlt);
  
  return {
    id: Math.floor(Math.random() * 900) + 100,
    x: range * Math.cos(bearingRad),
    y: range * Math.sin(bearingRad),
    bearing: bearing,
    speed: speed / 3600,
    altitude: altitude,
    aircraftType: aircraft.type,
    wingspan: aircraft.wingspan,
    size: 20 + Math.random() * 5,
    count: isEscortMission ? (1 + Math.floor(Math.random() * 2)) : (3 + Math.floor(Math.random() * 8))
  };
};

// Update targets position based on their speed and bearing
export const updateTargets = (targets, UPDATE_RATE = 0.1) => {
  return targets.map(target => {
    const range = Math.sqrt(target.x ** 2 + target.y ** 2);
    if (range < 5) return null;
    
    const bearingRad = (target.bearing * Math.PI) / 180;
    const distanceThisUpdate = target.speed * UPDATE_RATE;
    const newRange = range - distanceThisUpdate;
    
    return {
      ...target,
      x: newRange * Math.cos(bearingRad),
      y: newRange * Math.sin(bearingRad)
    };
  }).filter(Boolean);
};
