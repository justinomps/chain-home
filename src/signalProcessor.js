import { getMaxRangeForAltitude } from './constants.js';

// Calculate signal strength based on target properties and radar settings
export const getSignalStrength = (target, goniometerAngle, selectedFrequency) => {
  const range = Math.sqrt(target.x ** 2 + target.y ** 2);
  const bearing = ((Math.atan2(target.y, target.x) * 180) / Math.PI + 360) % 360;
  
  // Horizontal directivity (goniometer)
  const angleDiff = Math.abs(bearing - goniometerAngle);
  const normalizedDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;
  
  // CH used crossed dipoles, so directivity pattern would be cos^2
  const directionFactor = Math.pow(Math.cos((normalizedDiff * Math.PI) / 180), 2);
  
  // Calculate radar cross-section based on frequency and target wingspan
  const wavelength = 300 / selectedFrequency; // meters
  const wingspanInWavelengths = target.wingspan / wavelength;
  const resonanceFactor = Math.sin(Math.PI * wingspanInWavelengths) / (Math.PI * wingspanInWavelengths);
  const crossSectionFactor = Math.abs(resonanceFactor) + 0.2; // Add base reflection
  
  // Range factor using radar equation proportionality (1/R^4)
  const maxRange = getMaxRangeForAltitude(target.altitude);
  const rangeFactor = Math.pow(Math.min(maxRange / range, 1), 4);
  
  return directionFactor * rangeFactor * crossSectionFactor * 3.0;
};

// Calculate height finding signal for altitude determination
export const getHeightFindingSignal = (target, goniometerAngle, verticalGoniometer, selectedFrequency, heightFindingMode) => {
  if (!heightFindingMode) return 0;
  
  const range = Math.sqrt(target.x ** 2 + target.y ** 2);
  const bearing = ((Math.atan2(target.y, target.x) * 180) / Math.PI + 360) % 360;
  const altitudeInMiles = target.altitude / 5280; // Convert feet to miles
  
  // Only process targets near the current goniometer bearing
  const bearingDiff = Math.abs(bearing - goniometerAngle);
  const normalizedBearingDiff = bearingDiff > 180 ? 360 - bearingDiff : bearingDiff;
  if (normalizedBearingDiff > 15) return 0;
  
  // Calculate angle above horizon
  const angleRad = Math.atan2(altitudeInMiles, range);
  const angleDeg = (angleRad * 180) / Math.PI;
  
  // CH height finding used vertical lobe pattern
  const wavelength = 300 / selectedFrequency; // meters
  const heightInWavelengths = (target.altitude / 0.3048) / wavelength; 
  
  // Create a pattern with lobes at regular intervals
  const verticalLobePattern = Math.abs(Math.sin(Math.PI * heightInWavelengths * Math.sin(angleRad)));
  
  // Factor in the vertical goniometer setting
  const verticalAngleDiff = Math.abs(angleDeg - verticalGoniometer);
  const verticalMatchFactor = Math.exp(-verticalAngleDiff * verticalAngleDiff / 100);
  
  return verticalLobePattern * verticalMatchFactor * 2.0;
};
