import React from 'react';

export default function ProgressStep(props) {
  const { steps } = props;
  const stepSize = Math.floor(100 / steps.length);
  const progress = steps.filter(v => v.completed).length / steps.length;

  return (
    <div className="steps" style={{ width: '100%' }}>
      <ul className="steps-container">
        {steps.map(step => (
          <li key={step.label} style={{ width: `${stepSize}%` }} className={step.completed ? 'activated' : ''}>
            <div className="step">
              <div className="step-image"><span></span></div>
              <div className="step-current">{step.label}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="step-bar" style={{ width: `${progress * 100}%` }}></div>
    </div>
  );
}
