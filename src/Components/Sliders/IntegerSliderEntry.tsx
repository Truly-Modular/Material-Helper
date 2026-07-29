import React, { useEffect, useState } from "react"

interface IntegerSliderEntryProps {
	label: string
	value: number
	onChange: (value: number) => void
	editableLabel?: boolean
	onLabelChange?: (value: string) => void
}

const IntegerSliderEntry: React.FC<IntegerSliderEntryProps> = ({
	label,
	value,
	onChange,
	editableLabel,
	onLabelChange,
}) => {
	const [text, setText] = useState("")

	useEffect(() => {
		setText(`${value}`)
	}, [value])

	const textParse = (test: string) => {
		if (test === "-") {
			setText(test)
		} else {
			// Remove all characters that are not numbers, commas, periods, or hyphens
			test = test.replace(/[^0-9\-]/g, "")

			// Remove every minus sign that isn't at the start of the string
			test = test.replace(/(?!^)-/g, "")

			const parsed = test.length === 0 ? 0 : parseInt(test)
			if (isNaN(parsed)) return

			setText(test) // Directly set 'test' as the text
			onChange(parsed)
		}
	}

	const rangeInput = (
		<input
			type="range"
			value={value}
			defaultValue={value}
			onChange={(e) => {
				onChange(parseInt(e.target.value, 10))
			}}
			min={0}
			max={5}
			style={{ accentColor: "var(--accent)", flex: 1, width: "100%" }}
		/>
	)

	const textInput = (
		<input
			type="text"
			value={text}
			onChange={(e) => {
				textParse(e.target.value)
			}}
			className="field-input"
			style={{ width: editableLabel ? "64px" : "70px", flexShrink: 0, fontFamily: "ui-monospace, Menlo, monospace", padding: "6px 8px" }}
		/>
	)

	if (editableLabel) {
		return (
			<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
				<input
					type="text"
					value={label}
					onChange={(event) => onLabelChange?.(event.target.value)}
					className="field-input"
					style={{ width: "120px", flexShrink: 0, padding: "6px 8px", fontSize: "12px" }}
				/>
				{rangeInput}
				{textInput}
			</div>
		)
	}

	return (
		<div>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "6px" }}>
				<span>{label}</span>
				{textInput}
			</div>
			{rangeInput}
		</div>
	)
}

export default IntegerSliderEntry
