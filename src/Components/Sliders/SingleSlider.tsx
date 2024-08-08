import React, { ChangeEvent, useEffect, useState } from 'react'

interface SingleSliderProps {
	label: string
	value: number
	onChange: (value: number) => void
	editableLabel?: boolean
	onLabelChange?: (value: string) => void
}

const SingleSlider: React.FC<SingleSliderProps> = ({ label, value, onChange, editableLabel, onLabelChange }) => {
	const [textvalue, setText] = useState('' + value)
	function textParse(test: string): void {
		if (test.endsWith('.') || test.endsWith(',') || test === '-') {
			setText(test)
			//onChange(parseFloat(test))
		} else {
			// Remove all characters that are not numbers, commas, periods, or hyphens
			test = test.replace(/[^0-9,.\-]/g, '')

			// Remove every minus sign that isn't at the start of the string
			test = test.replace(/(?!^)-/g, '')

			const parsed = test.length === 0 ? 0 : parseFloat(test)
			if (isNaN(parsed)) return

			setText(test) // Directly set 'test' as the text
			onChange(parsed)
		}
	}

	useEffect(() => {
		setText('' + value)
	}, [value])

	function sliderUpdate(test: string): void {
		onChange(parseFloat(test))
		setText('' + parseFloat(test))
	}

	return (
		<div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
			{editableLabel ? (
				<input
					type="text"
					value={label}
					style={{
						backgroundColor: 'var(--discord-gray-3)',
						color: 'var(--discord-white)',
						border: 'none',
						width: '21%',
						marginRight: '10px'
					}}
					onChange={(event) => {
						onLabelChange?.(event.target.value)
					}}
				/>
			) : (
				<label
					style={{
						color: 'var(--discord-white)',
						marginRight: '10px',
						width: '27%'
					}}
				>
					{label}:
				</label>
			)}
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
					width: editableLabel ? '62%' : '60%',
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
