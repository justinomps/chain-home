import React, { useState, useRef, useEffect } from 'react';
import { RADAR_CONSTANTS, FREQUENCIES } from './constants.js';
import { createTarget, updateTargets } from './targetManager.js';
import { getSignalStrength, getHeightFindingSignal } from './signalProcessor.js';
import AScope from './components/AScope.js';
import PlanView from './components/PlanView.js';
import HeightFinding from './components/HeightFinding.js';
import StationControls from './components/StationControls.js';
import AnalysisPanel from './components/AnalysisPanel.js';

const ChainHomeStation = () => {
  // State declarations
  const [isPowered, setIsPowered] = useState(true);
  const [isTraceVisible, setIsTraceVisible] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [goniometerAngle, setGoniometerAngle] = useState(160);
  const [targets, setTargets] = useState([]);
  const [sweepPosition, setSweepPosition] = useState(0);
  const [previousTraces, setPreviousTraces] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState(20);
  const [heightFindingMode, setHeightFindingMode] = useState(false);
  const [verticalGoniometer, setVerticalGoniometer] = useState(45);

  // Refs
  const canvasRef = useRef(null);
  const planViewRef = useRef(null);
  const heightCanvasRef = useRef(null);

  // Power state effect
  useEffect(() => {
    if (isPowered) {
      // Initialize targets
      const numTargets = 1 + Math.floor(Math.random() * 5);
      const newTargets = [];
      
      for (let i = 0; i < numTargets; i++) {
        const range = Math.sqrt(Math.random()) * RADAR_CONSTANTS.RADAR_RANGE;
        const bearing = 110 + Math.random() * 100;
        newTargets.push(createTarget(range, bearing));
      }
      
      setTargets(newTargets);
      setSweepPosition(0);

      // Sweep animation
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
      setIsTraceVisible(false);
      setSweepPosition(0);
      setTargets([]);
    }
  }, [isPowered]);

  // Target movement effect
  useEffect(() => {
    if (!isPowered) return;

    const UPDATE_RATE = 0.1;
    const moveInterval = setInterval(() => {
      setTargets(currentTargets => {
        let newTargets = updateTargets(currentTargets, UPDATE_RATE);

        if (newTargets.length < 2) {
          const range = Math.sqrt(Math.random()) * RADAR_CONSTANTS.RADAR_RANGE;
          const bearing = 110 + Math.random() * 100;
          newTargets.push(createTarget(range, bearing));
        }

        return newTargets;
      });
    }, UPDATE_RATE * 1000);

    return () => clearInterval(moveInterval);
  }, [isPowered]);

  return (
    <div className="ch-w-full ch-max-w-7xl ch-p-4">
      <div className="ch-bg-gray-800 ch-rounded-lg ch-p-6">
        {/* Historical Context Info */}
        <div className="ch-bg-gray-700 ch-p-3 ch-rounded ch-mb-4 ch-text-sm ch-text-green-400">
          <p className="ch-mb-1"><span className="ch-font-bold">Chain Home (CH)</span> - Britain's early warning radar system, operational 1939-1945</p>
          <p>Developed from the 1935 "Daventry Experiment" where radio waves were first used to detect aircraft</p>
        </div>

        <div className="ch-flex ch-justify-between ch-items-center ch-mb-4">
          <h2 className="ch-text-2xl ch-font-bold ch-text-green-500">
            Chain Home RDF Station {heightFindingMode ? '(Height Finding Mode)' : '(Range Finding Mode)'}
          </h2>
          <div className="ch-flex ch-items-center">
            <span className="ch-text-green-500 ch-mr-2 ch-text-lg">Power:</span>
            <label className="ch-relative ch-inline-flex ch-items-center ch-cursor-pointer">
              <input
                type="checkbox"
                className="ch-sr-only ch-peer"
                checked={isPowered}
                onChange={(e) => setIsPowered(e.target.checked)}
              />
              <div className="ch-w-14 ch-h-7 ch-bg-gray-700 ch-peer-focus:outline-none ch-peer-focus:ring-4 ch-peer-focus:ring-green-800 ch-rounded-full ch-peer ch-peer-checked:after:translate-x-full ch-peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ch-peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        <div className="ch-bg-black ch-p-6 ch-rounded-lg">
          <AScope 
            canvasRef={canvasRef}
            targets={targets}
            goniometerAngle={goniometerAngle}
            isPowered={isPowered}
            sweepPosition={sweepPosition}
            selectedFrequency={selectedFrequency}
            previousTraces={previousTraces}
            setPreviousTraces={setPreviousTraces}
            getSignalStrength={getSignalStrength}
          />
          
          {heightFindingMode && (
            <HeightFinding 
              heightCanvasRef={heightCanvasRef}
              targets={targets}
              goniometerAngle={goniometerAngle}
              verticalGoniometer={verticalGoniometer}
              isPowered={isPowered} 
              heightFindingMode={heightFindingMode}
              selectedFrequency={selectedFrequency}
              getHeightFindingSignal={getHeightFindingSignal}
            />
          )}
        </div>

        <div className="ch-mt-6 ch-grid ch-grid-cols-1 md:ch-grid-cols-3 ch-gap-6">
          <StationControls 
            isPowered={isPowered}
            setIsPowered={setIsPowered}
            selectedFrequency={selectedFrequency}
            setSelectedFrequency={setSelectedFrequency}
            goniometerAngle={goniometerAngle}
            setGoniometerAngle={setGoniometerAngle}
            heightFindingMode={heightFindingMode}
            setHeightFindingMode={setHeightFindingMode}
            verticalGoniometer={verticalGoniometer}
            setVerticalGoniometer={setVerticalGoniometer}
            frequencies={FREQUENCIES}
          />
          
          <div className="ch-col-span-1 md:ch-col-span-2">
            <div className="ch-flex ch-items-center ch-justify-end ch-mb-4">
              <span className="ch-text-green-500 ch-mr-2 ch-text-lg">Show Operator Analysis:</span>
              <label className="ch-relative ch-inline-flex ch-items-center ch-cursor-pointer">
                <input
                  type="checkbox"
                  className="ch-sr-only ch-peer"
                  checked={showAnalysis}
                  onChange={(e) => setShowAnalysis(e.target.checked)}
                  disabled={!isPowered}
                />
                <div className="ch-w-14 ch-h-7 ch-bg-gray-700 ch-peer-focus:outline-none ch-peer-focus:ring-4 ch-peer-focus:ring-green-800 ch-rounded-full ch-peer ch-peer-checked:after:translate-x-full ch-peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ch-peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <PlanView 
              planViewRef={planViewRef}
              targets={targets}
              goniometerAngle={goniometerAngle}
              isPowered={isPowered}
              selectedFrequency={selectedFrequency}
              getSignalStrength={getSignalStrength}
            />
          </div>
        </div>

        <AnalysisPanel 
          targets={targets}
          goniometerAngle={goniometerAngle}
          heightFindingMode={heightFindingMode}
          verticalGoniometer={verticalGoniometer}
          selectedFrequency={selectedFrequency}
          showAnalysis={showAnalysis}
          getSignalStrength={getSignalStrength}
          getHeightFindingSignal={getHeightFindingSignal}
        />
      </div>
    </div>
  );
};

export default ChainHomeStation;
