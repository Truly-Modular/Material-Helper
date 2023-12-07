import React, { useState, ChangeEvent, useEffect } from 'react';

interface MaterialGroupsProps {
  onSubmit: (displayNames: string[]) => void;
}

const MaterialGroups: React.FC<MaterialGroupsProps> = ({ onSubmit }) => {
  const [displayNames, setDisplayNames] = useState(['metal']);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Validate input as the user types
    const inputValue = e.target.value;

    // Split the input by commas and trim spaces, allowing commas within entries
    const validDisplayNames = inputValue
        .split(',')
        .map((name) => (name === ' ' ? name : name.replace(/[^a-zA-Z]/g, '').trim().toLowerCase()))
        .filter((name) => name !== '')

    setDisplayNames(validDisplayNames);
    onSubmit(validDisplayNames);
  };

  useEffect(() => {
    // Trigger onSubmit when the component mounts with the default entry
    onSubmit(displayNames);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="entry" style={{ position: 'relative', backgroundColor: 'var(--discord-gray-2)', borderRadius: '8px', padding: '10px' }}>
      <label htmlFor="materialGroupsInput" style={{ display: 'block', color: 'var(--discord-white)', marginBottom: '5px' }}>
        Material Groups
      </label>
      <input
        type="text"
        id="materialGroupsInput"
        value={displayNames.join(', ')}
        onChange={handleInputChange}
        placeholder="e.g., metal, wood, stone"
        onKeyDown={(e) => {
            const inputElement = e.target as HTMLInputElement;
            // Remove a single space if the last character is a space when Backspace is pressed
            if (e.key === 'Backspace' && inputElement.value.endsWith(' ')) {
              setDisplayNames((prevNames) => prevNames.slice(0, -1));
            } else if (e.key === ',' && inputElement.selectionStart === inputElement.value.length) {
              // Add an empty entry when comma is pressed at the end
              setDisplayNames((prevNames) => [...prevNames, '']);
            }
          }}
        style={{
          backgroundColor: 'var(--discord-gray-3)',
          color: 'var(--discord-white)',
          border: 'none',
          width: '90%',
          padding: '10px',
          borderRadius: '8px',
          outline: 'none', // Remove the default focus outline
        }}
      />
    </div>
  );
};

export default MaterialGroups;
