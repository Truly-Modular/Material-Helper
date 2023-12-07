import React, { useState, ChangeEvent } from 'react';

interface MaterialEntryProps {
  onSubmit: (entryText: string) => void;
}

const MaterialEntry: React.FC<MaterialEntryProps> = ({ onSubmit }) => {
  const [entryText, setEntryText] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Validate input as the user types
    const inputValue = e.target.value;
    const regex = /^[a-z_:1-9A-Z]+$/;

    if (regex.test(inputValue) || inputValue === '') {
      setEntryText(inputValue.toLowerCase());
      onSubmit(inputValue.toLowerCase()); // Optionally submit on every key press
    }
  };

  return (
    <div className="entry" style={{ position: 'relative', backgroundColor: 'var(--discord-gray-2)', borderRadius: '8px', padding: '10px' }}>
      <label htmlFor="materialInput" style={{ display: 'block', color: 'var(--discord-white)', marginBottom: '5px' }}>
        Material Item ID
      </label>
      <input
        type="text"
        id="materialInput"
        value={entryText}
        onChange={handleInputChange}
        placeholder="modid:item_id"
        style={{
          backgroundColor: 'var(--discord-gray-3)',
          color: 'var(--discord-white)',
          border: 'none',
          width: '90%',
          padding: '10px',
          borderRadius: '8px',
          outline: 'none', // Remove default focus outline
        }}
      />
    </div>
  );
};

export default MaterialEntry;
