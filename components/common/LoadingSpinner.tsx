import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: number; // em pixels
  strokeWidth?: number; // em pixels
}

const LoadingSpinner = ({ size = 24, strokeWidth = 3 }: LoadingSpinnerProps) => {
  const style = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div className={styles.container}>
      <svg className={styles.spinner} style={style} viewBox="0 0 50 50">
        <circle
          className={styles.path}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth={strokeWidth}
        ></circle>
      </svg>
    </div>
  );
};

export default LoadingSpinner;