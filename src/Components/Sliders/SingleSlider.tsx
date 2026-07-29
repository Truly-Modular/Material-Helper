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

	const rangeInput = (
		<input
			type="range"
			value={value}
			defaultValue={value}
			onChange={(e: ChangeEvent<HTMLInputElement>) => sliderUpdate(e.target.value)}
			min={0}
			max={15}
			step={0.01} // Set a step value to allow for two decimal places
			style={{ accentColor: 'var(--accent)', flex: 1, width: '100%' }}
		/>
	)

	const textInput = (
		<input
			type="text"
			value={textvalue}
			onChange={(e: ChangeEvent<HTMLInputElement>) => textParse(e.target.value)}
			className="field-input"
			style={{ width: editableLabel ? '64px' : '70px', flexShrink: 0, fontFamily: 'ui-monospace, Menlo, monospace', padding: '6px 8px' }}
		/>
	)

	if (editableLabel) {
		return (
			<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
				<input
					type="text"
					value={label}
					onChange={(event) => onLabelChange?.(event.target.value)}
					className="field-input"
					style={{ width: '120px', flexShrink: 0, padding: '6px 8px', fontSize: '12px' }}
				/>
				{rangeInput}
				{textInput}
			</div>
		)
	}

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
				<span>{label}</span>
				{textInput}
			</div>
			{rangeInput}
		</div>
	)
}

export default SingleSlider
