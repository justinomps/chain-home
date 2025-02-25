import * as React from 'react';
const useEffect = React.useEffect;
import { RADAR_CONSTANTS } from '../constants';
import { createTarget, updateTargets } from '../targetManager';

/**
 * Custom hook to manage power state effects in the radar
 * Handles initialization and shutdown of targets and sweep
 */
export const usePowerState = (isPowered) => {
  const [targets, setTargets] = useState([]);
  const [sweepPosition, setSweepPosition] = useState(0);
  const [isTraceVisible, setIsTraceVisible] = useState(true);
  const [previousTraces, setPreviousTraces] = useState([]);

  useEffect(() => {
    if (isPowered) {
      // Initialize targets when power is turned on
      const numTargets = 1 + Math.floor(Math.random() * 5);
      const newTargets = [];
      
      for (let i = 0; i < numTargets; i++) {
        const range = Math.sqrt(Math.random()) * RADAR_CONSTANTS.RADAR_RANGE;
        const bearing = 110 + Math.random() * 100;
        newTargets.push(createTarget(range, bearing));
      }
      
      setTargets(newTargets);
      setSweepPosition(0);

      // Implement the sweep animation
      const sweepDuration = 2000;
      const startTime = Date.now();
      
      const sweepInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / sweepDuration, 1);
        setSweepPosition(RADAR_CONSTANTS.SWEEP_WIDTH * progress);
        
        if (progress >= 1) {
          setIsTraceVisible(true);
        }
      }, 16);

      return () => clearInterval(sweepInterval);
    } else {
      // Power is off - reset displays
      setIsTraceVisible(false);
      setSweepPosition(0);
      setTargets([]);
      setPreviousTraces([]);
    }
  }, [isPowered]);

  return { targets, setTargets, sweepPosition, isTraceVisible, previousTraces, setPreviousTraces };
};

/**
 * Custom hook to handle target movement and lifecycle
 */
export const useTargetMovement = (isPowered, targets, setTargets) => {
  useEffect(() => {
    if (!isPowered) return;

    const UPDATE_RATE = 0.1; // Update every 100ms
    const moveInterval = setInterval(() => {
      setTargets(currentTargets => {
        // Move existing targets
        let newTargets = updateTargets(currentTargets, UPDATE_RATE);

        // Occasionally generate new targets if there aren't enough
        if (newTargets.length < 2 && Math.random() < 0.3) {
          const range = Math.sqrt(Math.random()) * RADAR_CONSTANTS.RADAR_RANGE;
          const bearing = 110 + Math.random() * 100;
          newTargets.push(createTarget(range, bearing));
        }

        return newTargets;
      });
    }, UPDATE_RATE * 1000);

    return () => clearInterval(moveInterval);
  }, [isPowered, setTargets]);
};

/**
 * Custom hook to manage the animation frames for all canvas elements
 */
export const useRadarAnimation = (
  canvasRef,
  planViewRef,
  heightCanvasRef,
  drawTrace,
  drawPlanView,
  drawHeightFindingTrace,
  dependencies
) => {
  useEffect(() => {
    // Use requestAnimationFrame for smooth animation
    let animationFrameId;
    
    const animate = () => {
      // Draw each radar display component
      if (typeof drawTrace === 'function') drawTrace();
      if (typeof drawPlanView === 'function') drawPlanView();
      if (typeof drawHeightFindingTrace === 'function') drawHeightFindingTrace();
      
      // Request the next frame
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up animation on unmount or when dependencies change
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, dependencies); // Re-run when any dependencies change
};

/**
 * Custom hook to simulate radio interference and jamming
 */
export const useRadioInterference = (selectedFrequency, setInterferenceLevel) => {
  useEffect(() => {
    // Simple simulation of periodic radio interference
    const interferenceInterval = setInterval(() => {
      // Random interference that varies by frequency
      // Lower frequencies were more susceptible to atmospheric noise
      // Higher frequencies were more susceptible to jamming
      const atmosphericNoise = (30 - selectedFrequency) * 0.01; // More noise at lower frequencies
      const randomJamming = Math.random() * 0.2 * (selectedFrequency / 20); // More jamming at higher frequencies
      
      const totalInterference = Math.min(atmosphericNoise + randomJamming, 0.5);
      setInterferenceLevel(totalInterference);
    }, 5000);
    
    return () => clearInterval(interferenceInterval);
  }, [selectedFrequency, setInterferenceLevel]);
};

/**
 * Custom hook to manage phosphor persistence effect
 */
export const usePhosphorPersistence = (
  sweepPosition, 
  currentTrace, 
  previousTraces, 
  setPreviousTraces
) => {
  useEffect(() => {
    if (sweepPosition >= RADAR_CONSTANTS.SWEEP_WIDTH && currentTrace && currentTrace.length > 0) {
      setPreviousTraces(prev => {
        // Add current trace to previous traces
        const newTraces = [...prev, { points: currentTrace, timestamp: Date.now() }];
        
        // Remove old traces if we have too many
        if (newTraces.length > RADAR_CONSTANTS.MAX_PREVIOUS_TRACES) {
          newTraces.shift();
        }
        
        return newTraces;
      });
    }
  }, [sweepPosition, currentTrace, setPreviousTraces]);
};

/**
 * Master hook that combines all radar functionality
 */
export const useRadar = (initialState = {}) => {
  const [isPowered, setIsPowered] = useState(initialState.isPowered || true);
  const [selectedFrequency, setSelectedFrequency] = useState(initialState.selectedFrequency || 20);
  const [goniometerAngle, setGoniometerAngle] = useState(initialState.goniometerAngle || 160);
  const [heightFindingMode, setHeightFindingMode] = useState(initialState.heightFindingMode || false);
  const [verticalGoniometer, setVerticalGoniometer] = useState(initialState.verticalGoniometer || 45);
  const [showAnalysis, setShowAnalysis] = useState(initialState.showAnalysis || false);
  const [interferenceLevel, setInterferenceLevel] = useState(0);

  // Use the individual hooks to manage different aspects
  const { 
    targets, 
    setTargets, 
    sweepPosition, 
    isTraceVisible,
    previousTraces, 
    setPreviousTraces 
  } = usePowerState(isPowered);

  // Setup target movement
  useTargetMovement(isPowered, targets, setTargets);
  
  // Setup radio interference simulation
  useRadioInterference(selectedFrequency, setInterferenceLevel);

  return {
    // State
    isPowered,
    setIsPowered,
    selectedFrequency,
    setSelectedFrequency,
    goniometerAngle,
    setGoniometerAngle,
    heightFindingMode,
    setHeightFindingMode,
    verticalGoniometer,
    setVerticalGoniometer,
    showAnalysis,
    setShowAnalysis,
    interferenceLevel,
    
    // Target data
    targets,
    setTargets,
    
    // Display state
    sweepPosition,
    isTraceVisible,
    previousTraces,
    setPreviousTraces,
    
    // Animation hooks
    useRadarAnimation,
    usePhosphorPersistence
  };
};

export default useRadar;
