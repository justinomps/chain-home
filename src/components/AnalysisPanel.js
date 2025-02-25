import * as React from 'react';
const useEffect = React.useEffect;

const AnalysisPanel = ({
  targets,
  goniometerAngle,
  heightFindingMode,
  verticalGoniometer,
  selectedFrequency,
  showAnalysis,
  getSignalStrength,
  getHeightFindingSignal
}) => {
  // Skip rendering if the analysis panel is hidden
  if (!showAnalysis) {
    return null;
  }

  // Sort targets by range (closest first)
  const sortedTargets = [...targets].sort((a, b) => {
    const rangeA = Math.sqrt(a.x ** 2 + a.y ** 2);
    const rangeB = Math.sqrt(b.x ** 2 + b.y ** 2);
    return rangeA - rangeB;
  });

  return (
    <div className="ch-col-span-1 md:ch-col-span-3 ch-p-4 ch-bg-white ch-rounded ch-text-black ch-mt-6">
      <h3 className="ch-font-bold ch-mb-2">
        Chain Home Operator Analysis Report
      </h3>
      
      <div className="ch-flex ch-gap-4 ch-flex-col md:ch-flex-row">
        {/* Left side - Target data table */}
        <div className="ch-flex-1">
          <div className="ch-grid ch-grid-cols-7 ch-gap-2 ch-text-sm ch-mb-1 ch-border-b ch-border-gray-300 ch-font-semibold">
            <div>Raid Number</div>
            <div>Range (mi)</div>
            <div>Bearing (°)</div>
            <div>Alt (ft)</div>
            <div>Speed (mph)</div>
            <div>Aircraft</div>
            <div>Signal</div>
          </div>
          
          {sortedTargets.map((target, index) => {
            const range = Math.sqrt(target.x ** 2 + target.y ** 2);
            const bearing = ((Math.atan2(target.y, target.x) * 180) / Math.PI + 360) % 360;
            const speedMph = target.speed * 3600;
            const signalStrength = getSignalStrength(target, goniometerAngle, selectedFrequency);
            const isDetectable = signalStrength > 0.1;
            const heightSignal = getHeightFindingSignal(
              target, 
              goniometerAngle, 
              verticalGoniometer, 
              selectedFrequency, 
              heightFindingMode
            );
            
            // Calculate altitude confidence based on height finding accuracy
            let altitudeConfidence = "Unknown";
            if (heightFindingMode && heightSignal > 0.5) {
              altitudeConfidence = "High";
            } else if (heightFindingMode && heightSignal > 0.2) {
              altitudeConfidence = "Medium";
            } else if (heightFindingMode && heightSignal > 0.1) {
              altitudeConfidence = "Low";
            }

            // Different row styling based on detectability
            const rowClass = isDetectable 
              ? "ch-grid ch-grid-cols-7 ch-gap-2 ch-text-sm ch-hover:bg-gray-100" 
              : "ch-grid ch-grid-cols-7 ch-gap-2 ch-text-sm ch-text-gray-400 ch-hover:bg-gray-100";

            return (
              <div key={index} className={rowClass}>
                <div>{target.id}</div>
                <div>{range.toFixed(1)}</div>
                <div>{bearing.toFixed(1)}°</div>
                <div>
                  {Math.round(target.altitude).toLocaleString()} 
                  {heightFindingMode && isDetectable && (
                    <span className={`ch-ml-1 ch-text-xs ${
                      altitudeConfidence === "High" ? "ch-text-green-600" :
                      altitudeConfidence === "Medium" ? "ch-text-yellow-600" :
                      "ch-text-red-600"
                    }`}>
                      ({altitudeConfidence})
                    </span>
                  )}
                </div>
                <div>{speedMph.toFixed(0)}</div>
                <div>{target.aircraftType} × {target.count}</div>
                <div>
                  <div className="ch-w-full ch-bg-gray-200 ch-rounded-full ch-h-2.5">
                    <div 
                      className={`ch-h-2.5 ch-rounded-full ${isDetectable ? 'ch-bg-green-600' : 'ch-bg-gray-400'}`} 
                      style={{ width: `${Math.min(signalStrength * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {sortedTargets.length === 0 && (
            <div className="ch-text-gray-500 ch-py-4 ch-text-center">
              No aircraft detected. Adjust goniometer or check power settings.
            </div>
          )}
        </div>
        
        {/* Right side - Statistical summary and operational notes */}
        <div className="ch-w-full md:ch-w-80 ch-shrink-0">
          <div className="ch-bg-gray-100 ch-p-3 ch-rounded ch-mb-4">
            <h4 className="ch-font-bold ch-text-sm ch-mb-2">Operational Summary</h4>
            <div className="ch-text-sm">
              <div className="ch-flex ch-justify-between ch-mb-1">
                <span>Total Raids:</span>
                <span className="ch-font-medium">{targets.length}</span>
              </div>
              <div className="ch-flex ch-justify-between ch-mb-1">
                <span>Aircraft Count:</span>
                <span className="ch-font-medium">
                  {targets.reduce((sum, target) => sum + target.count, 0)}
                </span>
              </div>
              <div className="ch-flex ch-justify-between ch-mb-1">
                <span>Frequency:</span>
                <span className="ch-font-medium">{selectedFrequency} MHz</span>
              </div>
              <div className="ch-flex ch-justify-between">
                <span>Mode:</span>
                <span className="ch-font-medium">
                  {heightFindingMode ? 'Height Finding' : 'Range Finding'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="ch-bg-gray-100 ch-p-3 ch-rounded">
            <h4 className="ch-font-bold ch-text-sm ch-mb-2">Filter Report</h4>
            <div className="ch-text-sm">
              <p className="ch-mb-3">
                Estimated formation based on signal strength and range:
              </p>
              
              {targets.length > 0 ? (
                <div className="ch-mb-4">
                  {targets.some(t => !t.isEscort && t.count > 5) && (
                    <div className="ch-flex ch-items-center ch-mb-2">
                      <div className="ch-w-3 ch-h-3 ch-rounded-full ch-bg-red-500 ch-mr-2"></div>
                      <span>Large bomber formation detected</span>
                    </div>
                  )}
                  {targets.some(t => t.isEscort) && (
                    <div className="ch-flex ch-items-center ch-mb-2">
                      <div className="ch-w-3 ch-h-3 ch-rounded-full ch-bg-yellow-500 ch-mr-2"></div>
                      <span>Fighter escort present</span>
                    </div>
                  )}
                  {targets.some(t => t.speed * 3600 > 300) && (
                    <div className="ch-flex ch-items-center">
                      <div className="ch-w-3 ch-h-3 ch-rounded-full ch-bg-blue-500 ch-mr-2"></div>
                      <span>High-speed aircraft present</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="ch-text-gray-500">No aircraft detected to filter.</p>
              )}
              
              <div className="ch-text-xs ch-text-gray-500 ch-mt-4">
                <p className="ch-mb-1">
                  <span className="ch-font-medium">Historical Note:</span> Chain Home data would be relayed to Filter Rooms, where WAAF plotters would update the operations table with raid information.
                </p>
                <p>
                  After filtering, information would be sent to the Fighter Command Operations Room for tactical decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
