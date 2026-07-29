import React, { useState, useEffect } from "react"

interface WarningProps {
	id: number
	message: string
	onRemove: (id: number) => void
	color: string
}

const dotColorFor = (color: string): string => {
	switch (color) {
		case "red":
			return "var(--red)"
		case "green":
			return "var(--green)"
		case "orange":
			return "var(--orange)"
		default:
			return color || "var(--accent)"
	}
}

const Warning: React.FC<WarningProps> = ({ id, message, onRemove, color }) => {
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			onRemove(id)
		}, 5000) // 5 seconds

		return () => clearTimeout(timeoutId)
	}, [id, onRemove])

	return (
		<div className="toast">
			<div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: dotColorFor(color) }}></div>
			<div style={{ flex: 1, whiteSpace: "pre-wrap" }}>{message}</div>
			<button
				onClick={() => onRemove(id)}
				style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: 0 }}
			>
				×
			</button>
		</div>
	)
}

export default Warning
