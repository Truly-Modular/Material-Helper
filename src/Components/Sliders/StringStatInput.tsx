import React from "react"

interface StringStatEntryProps {
	label: string
	value: string
	onChange: (value: string) => void
	editableLabel?: boolean
	onLabelChange?: (value: string) => void
}

const StringStatEntry: React.FC<StringStatEntryProps> = ({
	label,
	value,
	onChange,
	editableLabel,
	onLabelChange,
}) => {
	return (
		<div style={{ marginBottom: "20px", width: "100%", display: "flex", alignItems: "center" }}>
			{editableLabel ? (
				<input
					type="text"
					style={{
						backgroundColor: "var(--discord-gray-3)",
						color: "var(--discord-white)",
						border: "none",
						width: "28%",
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
				type="text"
				value={value}
				defaultValue={value}
				onChange={(e) => {
					onChange(e.target.value)
				}}
				style={{
					backgroundColor: "var(--discord-gray-3)",
					color: "var(--discord-white)",
					border: "none",
					width: "100%",
				}}
			/>
		</div>
	)
}

export default StringStatEntry
