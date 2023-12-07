import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker, ColorResult } from 'react-color';

interface ColorPickerProps {
  initialColor: string;
  onChange?: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ initialColor, onChange }) => {
  const [color, setColor] = useState(initialColor);
  const [showPicker, setShowPicker] = useState(false);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !(colorPickerRef.current as any).contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
  
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleColorChange = (newColor: ColorResult) => {
    const newHexColor = newColor.hex;
    setColor(newHexColor);

    if (onChange) {
      onChange(newHexColor);
    }
  };

  const handleColorClick = () => {
    setShowPicker(!showPicker);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={colorPickerRef}>
      <div
        style={{
          backgroundColor: color,
          width: '40px',
          height: '40px',
          cursor: 'pointer',
        }}
        onClick={handleColorClick}
      />
      {showPicker && (
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            top: '50px', // Adjust the position as needed
            left: '0',
          }}
        >
          <SketchPicker color={color} onChange={handleColorChange} />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
