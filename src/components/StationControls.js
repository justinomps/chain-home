import React from 'react';

const StationControls = ({
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
  frequencies
}) => {
  return (
    <div className="ch-bg-gray-700 ch-p-4 ch-rounded">
      <h3 className="ch-text-green-500 ch-font-bold ch-mb-4">Station Controls</h3>
      
      {/* Power Switch */}
      <div className="ch-mb-5">
        <div className="ch-flex ch-items-center ch-justify-between">
          <label className="ch-text-green-400 ch-font-medium">Power</label>
          <div className="ch-relative ch-inline-flex ch-items-center">
            <input
              type="checkbox"
              className="ch-sr-only ch-peer"
              checked={isPowered}
              onChange={(e) => setIsPowered(e.target.checked)}
            />
            <div className="ch-w-14 ch-h-7 ch-bg-gray-800 ch-peer-focus:outline-none ch-peer-focus:ring-2 ch-peer-focus:ring-green-800 ch-rounded-full ch-peer ch-peer-checked:after:translate-x-full ch-peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ch-peer-checked:bg-green-600"></div>
          </div>
        </div>
        <div className="ch-text-xs ch-text-green-400 ch-mt-1">
          Controls power to transmitter and receiver circuits.
        </div>
      </div>
      
      {/* Frequency Selection */}
      <div className="ch-mb-5">
        <label className="ch-block ch-text-green-400 ch-font-medium ch-mb-2">Transmitter Frequency</label>
        <select 
          className="ch-w-full ch-bg-gray-800 ch-text-green-500 ch-p-2 ch-rounded ch-border ch-border-gray-600"
          value={selectedFrequency}
          onChange={(e) => setSelectedFrequency(Number(e.target.value))}
          disabled={!isPowered}
        >
          {frequencies.map(freq => (
            <option key={freq.value} value={freq.value}>
              {freq.label}
            </option>
          ))}
        </select>
        <div className="ch-text-xs ch-text-green-400 ch-mt-1">
          Changing frequency affects detection range and helps avoid enemy jamming.
        </div>
      </div>
      
      {/* Horizontal Goniometer Control */}
      <div className="ch-mb-5">
        <label className="ch-block ch-text-green-400 ch-font-medium ch-mb-2">
          Horizontal Goniometer: <span className="ch-text-white">{goniometerAngle}°</span>
        </label>
        <input
          type="range"
          min="110"
          max="210"
          value={goniometerAngle}
          onChange={(e) => setGoniometerAngle(Number(e.target.value))}
          className="ch-w-full ch-accent-green-500"
          disabled={!isPowered}
        />
        <div className="ch-text-xs ch-text-green-400 ch-mt-1">
          Adjusts the horizontal receiving direction for bearing determination.
        </div>
      </div>
      
      {/* Height Finding Mode Toggle */}
      <div className="ch-mb-5">
        <div className="ch-flex ch-items-center">
          <input
            type="checkbox"
            id="heightFindingMode"
            className="ch-sr-only ch-peer"
            checked={heightFindingMode}
            onChange={(e) => setHeightFindingMode(e.target.checked)}
            disabled={!isPowered}
          />
          <label 
            htmlFor="heightFindingMode" 
            className="ch-relative ch-inline-flex ch-items-center ch-cursor-pointer ch-w-11 ch-h-6 ch-bg-gray-800 ch-rounded-full ch-peer-focus:outline-none ch-peer-focus:ring-2 ch-peer-focus:ring-green-800 ch-peer ch-peer-checked:after:translate-x-full ch-peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ch-peer-checked:bg-green-600"
          ></label>
          <span className="ch-ml-3 ch-text-green-400 ch-font-medium">Height Finding Mode</span>
        </div>
        <div className="ch-text-xs ch-text-green-400 ch-mt-1">
          Switches the station to measure target elevation angles for height calculation.
        </div>
      </div>
      
      {/* Vertical Goniometer (for height finding) */}
      <div className={`ch-mb-5 ch-transition-opacity ${heightFindingMode ? 'ch-opacity-100' : 'ch-opacity-50'}`}>
        <label className="ch-block ch-text-green-400 ch-font-medium ch-mb-2">
          Vertical Goniometer: <span className="ch-text-white">{verticalGoniometer}°</span>
        </label>
        <input
          type="range"
          min="0"
          max="90"
          value={verticalGoniometer}
          onChange={(e) => setVerticalGoniometer(Number(e.target.value))}
          className="ch-w-full ch-accent-green-500"
          disabled={!isPowered || !heightFindingMode}
        />
        <div className="ch-text-xs ch-text-green-400 ch-mt-1">
          Adjusts the vertical reception angle to determine target altitude.
        </div>
      </div>
      
      {/* Historical Context */}
      <div className="ch-border-t ch-border-gray-600 ch-mt-6 ch-pt-4">
        <div className="ch-text-xs ch-text-gray-300">
          <p className="ch-mb-2">
            <span className="ch-text-green-400 ch-font-medium">Historical Note:</span> Chain Home stations operated between 20-30 MHz, with huge 110m tall steel transmitter towers and 73m wooden receiver towers. Operators would use goniometers to measure both bearing and elevation angles.
          </p>
          <p>
            Each station was manned by both RAF and WAAF (Women's Auxiliary Air Force) personnel, working in shifts to provide 24/7 coverage across Britain's coastline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StationControls;
