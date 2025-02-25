import * as React from 'react';
const useEffect = React.useEffect;
const { useEffect } = React;
import { RADAR_CONSTANTS } from '../constants';

const PlanView = ({ 
  planViewRef, 
  targets, 
  goniometerAngle, 
  isPowered, 
  selectedFrequency,
  getSignalStrength 
}) => {
  
  const drawPlanView = () => {
    const canvas = planViewRef.current;
    if (!canvas || !isPowered) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, RADAR_CONSTANTS.PLAN_VIEW_SIZE, RADAR_CONSTANTS.PLAN_VIEW_SIZE);
    
    ctx.save();
    ctx.translate(RADAR_CONSTANTS.PLAN_VIEW_SIZE/2, RADAR_CONSTANTS.PLAN_VIEW_SIZE/2);
    
    // Draw range rings
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    for (let range = 20; range <= RADAR_CONSTANTS.RADAR_RANGE; range += 20) {
      const radius = (range / RADAR_CONSTANTS.RADAR_RANGE) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Add range labels
      ctx.fillStyle = '#333333';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(range.toString(), 0, radius + 1);
    }
    
    // Draw cardinal directions
    ctx.fillStyle = '#333333';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -RADAR_CONSTANTS.PLAN_VIEW_SIZE/2 + 20);
    ctx.fillText('S', 0, RADAR_CONSTANTS.PLAN_VIEW_SIZE/2 - 10);
    ctx.fillText('E', RADAR_CONSTANTS.PLAN_VIEW_SIZE/2 - 10, 0);
    ctx.fillText('W', -RADAR_CONSTANTS.PLAN_VIEW_SIZE/2 + 10, 0);
    
    // Draw RDF station at center (Chain Home base)
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw boundary lines (range limits)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1;
    const minAngleRad = (110 * Math.PI / 180) - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(minAngleRad) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2),
      Math.sin(minAngleRad) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2)
    );
    ctx.stroke();
    
    const maxAngleRad = (210 * Math.PI / 180) - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(maxAngleRad) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2),
      Math.sin(maxAngleRad) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2)
    );
    ctx.stroke();
    
    // Draw the arc representing the scanning area
    ctx.beginPath();
    ctx.arc(0, 0, RADAR_CONSTANTS.PLAN_VIEW_SIZE/2, minAngleRad, maxAngleRad);
    ctx.stroke();
    
    // Draw goniometer angle and visibility cone
    const angleRad = (goniometerAngle * Math.PI / 180) - Math.PI/2;
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(angleRad) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2),
      Math.sin(angleRad) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2)
    );
    ctx.stroke();
    
    // Draw the goniometer reception cone
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const spread = 15 * Math.PI / 180; // 15 degree spread on each side
    ctx.arc(0, 0, RADAR_CONSTANTS.PLAN_VIEW_SIZE/2, angleRad - spread, angleRad + spread);
    ctx.lineTo(0, 0);
    ctx.fill();
    
    // Draw targets on the plan view
    targets.forEach(target => {
      // Convert target coordinates to plan view coordinates
      // Note: We swap x and y, since in a plan view north is up (y-axis)
      // but in our coordinate system, y is to the east
      const rotatedX = (target.y / RADAR_CONSTANTS.RADAR_RANGE) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2);
      const rotatedY = (-target.x / RADAR_CONSTANTS.RADAR_RANGE) * (RADAR_CONSTANTS.PLAN_VIEW_SIZE/2);
      
      const range = Math.sqrt(target.x ** 2 + target.y ** 2);
      const maxRange = utilities.getMaxRangeForAltitude(target.altitude);
      
      // Calculate if target is in range and detectable
      const signalStrength = getSignalStrength(target, goniometerAngle, selectedFrequency);
      const isDetectable = signalStrength > 0.1; // Threshold for detection
      const isInRange = range <= maxRange;
      
      // Color code: green for detected targets, red for undetected or out of range
      const color = isInRange && isDetectable ? '#22c55e' : '#ef4444';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(rotatedX, rotatedY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw target trail (showing direction of movement)
      ctx.strokeStyle = `rgba(${isInRange && isDetectable ? '34, 197, 94' : '239, 68, 68'}, 0.5)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rotatedX, rotatedY);
      const trailLength = 20;
      const bearingRad = (target.bearing * Math.PI / 180) - Math.PI/2;
      ctx.lineTo(
        rotatedX + Math.cos(bearingRad) * trailLength,
        rotatedY + Math.sin(bearingRad) * trailLength
      );
      ctx.stroke();
    });
    
    // Draw legend
    const legendX = RADAR_CONSTANTS.PLAN_VIEW_SIZE/2 - 70;
    const legendY = -RADAR_CONSTANTS.PLAN_VIEW_SIZE/2 + 30;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(legendX - 10, legendY - 20, 80, 50);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 20, 80, 50);
    
    // Legend items
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(legendX, legendY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.fillText('Detected', legendX + 10, legendY + 4);
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(legendX, legendY + 20, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillText('Not detected', legendX + 10, legendY + 24);
    
    ctx.restore();
  };

  // Animation frame update
  useEffect(() => {
    const animationFrame = requestAnimationFrame(drawPlanView);
    return () => cancelAnimationFrame(animationFrame);
  }, [targets, goniometerAngle, isPowered, selectedFrequency]);

  return (
    <div className="ch-bg-gray-800 ch-p-4 ch-rounded">
      <h3 className="ch-text-green-500 ch-font-bold ch-mb-2">Plan Position Display</h3>
      <div className="ch-relative">
        <canvas
          ref={planViewRef}
          width={RADAR_CONSTANTS.PLAN_VIEW_SIZE}
          height={RADAR_CONSTANTS.PLAN_VIEW_SIZE}
          className="ch-bg-white ch-rounded-lg ch-mx-auto"
        />
      </div>
    </div>
  );
};

// Import utilities since we're using them in the component
const utilities = {
  getMaxRangeForAltitude: (altitude) => {
    const altitudeFt = Math.max(altitude, RADAR_CONSTANTS.MIN_ALTITUDE);
    const nauticalMiles = 1.23 * Math.sqrt(altitudeFt);
    return nauticalMiles * 1.15;
  }
};

export default PlanView;
