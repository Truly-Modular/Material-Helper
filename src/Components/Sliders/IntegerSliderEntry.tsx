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

	return (
		<div style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
			{editableLabel ? (
				<input
					type="text"
					style={{
						backgroundColor: "var(--discord-gray-3)",
						color: "var(--discord-white)",
						border: "none",
						width: "21%",
						marginRight: "10px",
					}}
					value={label}
					onChange={(event) => {
						onLabelChange?.(event.target.value)
					}}
				/>
			) : (
				<label
					style={{
						color: "var(--discord-white)",
						marginRight: "10px",
						width: "27%",
					}}
				>
					{label}:
				</label>
			)}
			<input
				type="range"
				value={value}
				defaultValue={value}
				onChange={(e) => {
					onChange(parseInt(e.target.value, 10))
				}}
				min={0}
				max={5}
				style={{
					backgroundColor: "transparent",
					width: editableLabel ? "62%" : "60%",
					height: "50%",
				}}
			/>
			<div
				style={{
					color: "var(--discord-white)",
					width: "3%",
				}}
			></div>
			<input
				type="text"
				value={text}
				onChange={(e) => {
					textParse(e.target.value)
				}}
				min={0}
				max={15}
				style={{
					backgroundColor: "var(--discord-gray-3)",
					color: "var(--discord-white)",
					border: "none",
					width: "10%",
				}}
			/>
		</div>
	)
}

export default IntegerSliderEntry
