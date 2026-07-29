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
	const valueInput = (
		<input
			type="text"
			value={value}
			defaultValue={value}
			onChange={(e) => {
				onChange(e.target.value)
			}}
			className="field-input"
			style={{ flex: 1, fontFamily: "ui-monospace, Menlo, monospace", fontSize: "12.5px", padding: editableLabel ? "6px 8px" : undefined }}
		/>
	)

	if (editableLabel) {
		return (
			<div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
				<input
					type="text"
					value={label}
					onChange={(event) => onLabelChange?.(event.target.value)}
					className="field-input"
					style={{ width: "120px", flexShrink: 0, padding: "6px 8px", fontSize: "12px" }}
				/>
				{valueInput}
			</div>
		)
	}

	return (
		<div>
			<div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
				<span>{label}</span>
			</div>
			{valueInput}
		</div>
	)
}

export default StringStatEntry
