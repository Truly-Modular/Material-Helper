import React, { useState } from 'react'

interface HighLimitSliderEntryProps {
	label: string
	value: number
	onChange: (value: number) => void
}

const HighLimitSliderEntry: React.FC<HighLimitSliderEntryProps> = ({ label, value, onChange }) => {
	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					fontSize: '12.5px',
					color: 'var(--text-secondary)',
					marginBottom: '6px'
				}}
			>
				<span>{label}</span>
				<input
					type="text"
					value={value}
					onChange={(e) => {
						const inputValue = e.target.value
						const intValue = parseInt(inputValue, 10)
						if (!isNaN(intValue)) {
							onChange(intValue)
						}
					}}
					className="field-input"
					style={{ width: '70px', flexShrink: 0, fontFamily: 'ui-monospace, Menlo, monospace', padding: '6px 8px' }}
				/>
			</div>
			<input
				type="range"
				value={value}
				defaultValue={value}
				onChange={(e) => onChange(parseInt(e.target.value, 10))}
				min={0}
				max={2000} // Set a higher max value
				style={{ accentColor: 'var(--accent)', width: '100%' }}
			/>
		</div>
	)
}

export default HighLimitSliderEntry
