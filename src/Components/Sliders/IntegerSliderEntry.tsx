import React, { useState } from 'react'

interface IntegerSliderEntryProps {
	label: string
	value: number
	onChange: (value: number) => void
}

const IntegerSliderEntry: React.FC<IntegerSliderEntryProps> = ({ label, value, onChange }) => {
	return (
		<div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
			<label
				style={{
					color: 'var(--discord-white)',
					marginRight: '10px',
					width: '27%'
				}}
			>
				{label}:
			</label>
			<input
				type="range"
				value={value}
				defaultValue={value}
				onChange={(e) => onChange(parseInt(e.target.value, 10))}
				min={0}
				max={5}
				style={{
					backgroundColor: 'transparent',
					width: '60%',
					height: '50%'
				}}
			/>
			<div
				style={{
					color: 'var(--discord-white)',
					width: '3%'
				}}
			></div>
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
				min={0}
				max={15}
				style={{
					backgroundColor: 'var(--discord-gray-3)',
					color: 'var(--discord-white)',
					border: 'none',
					width: '10%'
				}}
			/>
		</div>
	)
}

export default IntegerSliderEntry
