import React from 'react';

const STEPS = [
  { label: 'Upload', number: 1 },
  { label: 'Skills',  number: 2 },
  { label: 'Timeline', number: 3 },
  { label: 'Roadmap', number: 4 },
];

/**
 * ProgressBar — 4-step flow indicator for the analysis wizard.
 * @param {{ currentStep: number }} props  1-based step index
 */
const ProgressBar = ({ currentStep }) => {
  return (
    <div className="steps-bar">
      {STEPS.map((step, idx) => {
        const isCompleted = step.number < currentStep;
        const isActive    = step.number === currentStep;

        return (
          <React.Fragment key={step.number}>
            {/* Step circle */}
            <div className="step-item">
              <div
                className={[
                  'step-circle',
                  isCompleted ? 'step-done' : '',
                  isActive    ? 'step-active' : '',
                ].join(' ')}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span className={`step-label ${isActive ? 'step-label-active' : ''}`}>
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < STEPS.length - 1 && (
              <div className={`step-line ${isCompleted ? 'step-line-done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressBar;
