import React, { ChangeEvent, useEffect, useState } from 'react'

interface SingleSliderProps {
	label: string
	value: number
	onChange: (value: number) => void
}

const SingleSlider: React.FC<SingleSliderProps> = ({ label, value, onChange }) => {
	const [textvalue, setText] = useState('' + value)
	function textParse(test: string): void {
		if (test.endsWith('.') || test.endsWith(',')) {
			setText(test)
			//onChange(parseFloat(test))
		} else {
			setText('' + parseFloat(test))
			onChange(parseFloat(test))
		}
	}

	function sliderUpdate(test: string): void {
		onChange(parseFloat(test))
		setText('' + parseFloat(test))
	}

	useEffect(() => {
		console.log(`Value changed to: ${value}`)
	}, [value]) // Specify 'value' as a dependency

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
				onChange={(e: ChangeEvent<HTMLInputElement>) => sliderUpdate(e.target.value)}
				min={0}
				max={15}
				step={0.01} // Set a step value to allow for two decimal places
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
				value={textvalue}
				onChange={(e: ChangeEvent<HTMLInputElement>) => textParse(e.target.value)}
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

export default SingleSlider
