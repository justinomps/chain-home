import * as React from 'react';
const useEffect = React.useEffect;
import { RADAR_CONSTANTS } from '../constants';

const HeightFinding = ({ 
  heightCanvasRef, 
  targets, 
  goniometerAngle, 
  verticalGoniometer, 
  isPowered, 
  heightFindingMode, 
  selectedFrequency,
  getHeightFindingSignal 
}) => {
  
  const drawHeightFindingTrace = () => {
    const canvas = heightCanvasRef.current;
    if (!canvas || !isPowered || !heightFindingMode) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, RADAR_CONSTANTS.SWEEP_WIDTH, RADAR_CONSTANTS.SCOPE_HEIGHT/2);
    
    // Draw background grid and scales
    ctx.strokeStyle = '#1F3F3F';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px monospace';
    
    // Draw elevation angle scale (vertical axis)
    for (let angle = 0; angle <= 90; angle += 15) {
      const y = (RADAR_CONSTANTS.SCOPE_HEIGHT/2) * (1 - angle/90);
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(10, y);
      ctx.stroke();
      
      ctx.textAlign = 'left';
      ctx.fillText(`${angle}°`, 15, y + 4);
    }
    
    // Add title and information
    ctx.textAlign = 'center';
    ctx.fillText("Elevation Pattern (Height Finding)", RADAR_CONSTANTS.SWEEP_WIDTH/2, 15);
    
    // Draw vertical goniometer reference line
    const verticalGoniometerY = (RADAR_CONSTANTS.SCOPE_HEIGHT/2) * (1 - verticalGoniometer/90);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, verticalGoniometerY);
    ctx.lineTo(RADAR_CONSTANTS.SWEEP_WIDTH, verticalGoniometerY);
    ctx.stroke();
    
    ctx.textAlign = 'right';
    ctx.fillText(`Vertical Goniometer: ${verticalGoniometer}°`, RADAR_CONSTANTS.SWEEP_WIDTH - 10, verticalGoniometerY - 5);
    
    // Draw the vertical lobe pattern for Chain Home height finding
    // This simulates the multiple lobes created by ground reflection
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw the theoretical lobe pattern for reference
    ctx.beginPath();
    for (let x = 0; x < RADAR_CONSTANTS.SWEEP_WIDTH; x++) {
      const elevationRad = (x / RADAR_CONSTANTS.SWEEP_WIDTH) * (Math.PI/2); // 0 to 90 degrees in radians
      
      // Calculate the lobe pattern based on wavelength and antenna height
      const wavelength = 300 / selectedFrequency; // meters
      const antennaHeight = 110; // typical CH transmitter height in meters
      const pattern = Math.pow(Math.sin(2 * Math.PI * antennaHeight * Math.sin(elevationRad) / wavelength), 2);
      
      const y = (RADAR_CONSTANTS.SCOPE_HEIGHT/2) - (pattern * RADAR_CONSTANTS.SCOPE_HEIGHT/4);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw current height finding trace
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    
    const baseline = RADAR_CONSTANTS.SCOPE_HEIGHT/2 - 10;
    ctx.moveTo(0, baseline);
    
    // Generate the height finding trace based on targets
    for (let x = 0; x < RADAR_CONSTANTS.SWEEP_WIDTH; x++) {
      const elevation = (x / RADAR_CONSTANTS.SWEEP_WIDTH) * 90; // 0-90 degrees
      let maxSignal = 0;
      
      targets.forEach(target => {
        const range = Math.sqrt(target.x ** 2 + target.y ** 2);
        const bearing = ((Math.atan2(target.y, target.x) * 180) / Math.PI + 360) % 360;
        
        // Only process targets close to the horizontal goniometer bearing
        const bearingDiff = Math.abs(bearing - goniometerAngle);
        const normalizedBearingDiff = bearingDiff > 180 ? 360 - bearingDiff : bearingDiff;
        
        if (normalizedBearingDiff < 15) {
          const altitudeInMiles = target.altitude / 5280;
          const targetElevationRad = Math.atan2(altitudeInMiles, range);
          const targetElevation = (targetElevationRad * 180) / Math.PI;
          
          const elevationDiff = Math.abs(targetElevation - elevation);
          if (elevationDiff < 5) {
            // Get signal strength for this target at this elevation
            const elevationSignal = getHeightFindingSignal(
              target, 
              goniometerAngle, 
              elevation, 
              selectedFrequency, 
              heightFindingMode
            );
            
            maxSignal = Math.max(maxSignal, elevationSignal);
          }
        }
      });
      
      // Add some realistic noise to the trace
      const noise = (Math.random() - 0.5) * 5;
      const y = baseline - (maxSignal * RADAR_CONSTANTS.SCOPE_HEIGHT * 0.4) + noise;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    
    // Draw altitude conversion reference
    drawAltitudeReference(ctx);
  };
  
  // Draw the altitude reference chart
  const drawAltitudeReference = (ctx) => {
    const referenceX = RADAR_CONSTANTS.SWEEP_WIDTH - 120;
    const referenceY = 40;
    const width = 110;
    const height = 90;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(referenceX, referenceY, width, height);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1;
    ctx.strokeRect(referenceX, referenceY, width, height);
    
    // Title
    ctx.fillStyle = '#00FF00';
    ctx.textAlign = 'center';
    ctx.font = '10px monospace';
    ctx.fillText('Elevation to Altitude', referenceX + width/2, referenceY + 12);
    
    // Add reference values
    ctx.textAlign = 'left';
    ctx.font = '9px monospace';
    
    const ranges = [20, 50, 100];
    let y = referenceY + 30;
    
    ctx.fillText('Angle', referenceX + 5, y);
    ctx.fillText('Range (mi)', referenceX + 40, y);
    ctx.fillText('Alt (ft)', referenceX + 75, y);
    
    y += 12;
    
    // Draw some sample elevation to altitude conversions
    const sampleAngles = [1, 2, 5, 10];
    
    for (const angle of sampleAngles) {
      ctx.fillText(`${angle}°`, referenceX + 5, y);
      const range = 50; // Example range in miles
      const altitude = calculateAltitude(angle, range);
      ctx.fillText(`${range}`, referenceX + 45, y);
      ctx.fillText(`${altitude.toLocaleString()}`, referenceX + 75, y);
      y += 12;
    }
  };
  
  // Calculate altitude from elevation angle and range
  const calculateAltitude = (elevationDegrees, rangeMiles) => {
    const elevationRadians = (elevationDegrees * Math.PI) / 180;
    // Simple trigonometry: altitude = range * tan(elevation angle)
    // Convert to feet: miles * 5280
    return Math.round(rangeMiles * Math.tan(elevationRadians) * 5280);
  };

  // Animation frame update
  useEffect(() => {
    const animationFrame = requestAnimationFrame(drawHeightFindingTrace);
    return () => cancelAnimationFrame(animationFrame);
  }, [targets, goniometerAngle, verticalGoniometer, isPowered, heightFindingMode, selectedFrequency]);

  return (
    <div className="ch-mt-4">
      <div className="ch-text-green-500 ch-mb-2">Height Finding Display (Elevation Pattern)</div>
      <canvas
        ref={heightCanvasRef}
        width={RADAR_CONSTANTS.SWEEP_WIDTH}
        height={RADAR_CONSTANTS.SCOPE_HEIGHT/2}
        className="ch-w-full ch-bg-black"
      />
      <div className="ch-text-xs ch-text-green-400 ch-mt-1">
        Adjust vertical goniometer to match peaks for accurate height measurement. Each lobe corresponds to a specific aircraft altitude at a given range.
      </div>
    </div>
  );
};

export default HeightFinding;
