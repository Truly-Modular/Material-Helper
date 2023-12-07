import React, { ChangeEvent } from 'react';

interface SingleSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const SingleSlider: React.FC<SingleSliderProps> = ({ label, value, onChange }) => {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
      <label
        style={{
          color: 'var(--discord-white)',
          marginRight: '10px',
          width: '30%',
        }}
      >
        {label}:
      </label>
      <input
        type="range"
        value={value}
        defaultValue={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value))}
        min={0}
        max={15}
        step={0.01} // Set a step value to allow for two decimal places
        style={{
          backgroundColor: 'transparent',
          width: '60%',
          height: '50%',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value))}
        min={0}
        max={15}
        step={0.01} // Set a step value to allow for two decimal places
        style={{
          backgroundColor: 'var(--discord-gray-3)',
          color: 'var(--discord-white)',
          border: 'none',
          width: '10%',
        }}
      />
    </div>
  );
};

export default SingleSlider;
