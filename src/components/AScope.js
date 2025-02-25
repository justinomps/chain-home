import * as React from 'react';
const useEffect = React.useEffect;
import { RADAR_CONSTANTS } from '../constants.js';

const AScope = ({ canvasRef, targets, goniometerAngle, isPowered, sweepPosition, selectedFrequency, previousTraces, getSignalStrength, setPreviousTraces }) => {
  
  const drawTrace = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, RADAR_CONSTANTS.SWEEP_WIDTH, RADAR_CONSTANTS.SCOPE_HEIGHT);
    
    // Draw range markers
    ctx.strokeStyle = '#1F3F3F';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    
    for (let range = 0; range <= RADAR_CONSTANTS.RADAR_RANGE; range += 20) {
      const x = (range / RADAR_CONSTANTS.RADAR_RANGE) * RADAR_CONSTANTS.SWEEP_WIDTH;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, RADAR_CONSTANTS.SCOPE_HEIGHT);
      ctx.stroke();
      
      ctx.fillText(`${range}`, x, 15);
    }
    
    ctx.textAlign = 'left';
    ctx.fillText('mi', RADAR_CONSTANTS.SWEEP_WIDTH - 25, 15);

    if (!isPowered) return;

    // Draw previous traces (phosphor persistence)
    previousTraces.forEach((trace, index) => {
      const opacity = 0.3 * (1 - (index / RADAR_CONSTANTS.MAX_PREVIOUS_TRACES));
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 255, 0, ${opacity})`;
      ctx.lineWidth = 2;
      
      for (let i = 0; i < trace.points.length; i++) {
        const point = trace.points[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    });

    // Draw current trace
    const currentTrace = [];
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 2;

    const baseline = RADAR_CONSTANTS.SCOPE_HEIGHT * 0.8;
    ctx.moveTo(0, baseline);
    currentTrace.push({ x: 0, y: baseline });

    // Generate the trace based on targets
    for (let x = 0; x < sweepPosition; x++) {
      const range = (x / RADAR_CONSTANTS.SWEEP_WIDTH) * RADAR_CONSTANTS.RADAR_RANGE;
      let maxSignal = 0;
      let peakX = x;

      targets.forEach(target => {
        const targetRange = Math.sqrt(target.x ** 2 + target.y ** 2);
        const rangeDiff = Math.abs(targetRange - range);
        if (rangeDiff < 2) {
          const peakFactor = 1 - (rangeDiff / 2);
          const signal = getSignalStrength(target, goniometerAngle, selectedFrequency) * peakFactor;
          if (signal > maxSignal) {
            maxSignal = signal;
            peakX = x;
          }
        }
      });

      // Baseline noise
      const baselineNoise = (Math.random() - 0.5) * 8.5;
      
      let y = baseline + baselineNoise;
      if (maxSignal > 0) {
        const peakHeight = maxSignal * RADAR_CONSTANTS.SCOPE_HEIGHT * 0.35;
        const peakWidth = 0.5;
        const distFromPeak = Math.abs(x - peakX);
        if (distFromPeak < peakWidth) {
          const triangleFactor = 1 - (distFromPeak / peakWidth);
          y = baseline - (peakHeight * triangleFactor) + baselineNoise;
        }
      }
      ctx.lineTo(x, y);
      currentTrace.push({ x, y });
    }
    
    if (sweepPosition < RADAR_CONSTANTS.SWEEP_WIDTH) {
      ctx.lineTo(RADAR_CONSTANTS.SWEEP_WIDTH, baseline);
      currentTrace.push({ x: RADAR_CONSTANTS.SWEEP_WIDTH, y: baseline });
    }
    
    ctx.stroke();

    // Store current trace for phosphor persistence effect
    if (sweepPosition >= RADAR_CONSTANTS.SWEEP_WIDTH) {
      setPreviousTraces(prev => {
        const newTraces = [...prev, { points: currentTrace, timestamp: Date.now() }];
        if (newTraces.length > RADAR_CONSTANTS.MAX_PREVIOUS_TRACES) {
          newTraces.shift();
        }
        return newTraces;
      });
    }
  };

  // Animation frame update
  useEffect(() => {
    const animationFrame = requestAnimationFrame(drawTrace);
    return () => cancelAnimationFrame(animationFrame);
  }, [targets, goniometerAngle, isPowered, sweepPosition, selectedFrequency]);

  return (
    <canvas
      ref={canvasRef}
      width={RADAR_CONSTANTS.SWEEP_WIDTH}
      height={RADAR_CONSTANTS.SCOPE_HEIGHT}
      className="ch-w-full ch-bg-black"
    />
  );
};

export default AScope;
