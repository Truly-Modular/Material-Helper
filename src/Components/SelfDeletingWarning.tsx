import React, { useState, useEffect } from "react"

interface WarningProps {
	id: number
	message: string
	onRemove: (id: number) => void
	isSuccessWarning?: boolean
}

const Warning: React.FC<WarningProps> = ({ id, message, onRemove, isSuccessWarning }) => {
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			onRemove(id)
		}, 5000) // 5 seconds

		return () => clearTimeout(timeoutId)
	}, [id, onRemove])

	return (
		<div
			style={{
				backgroundColor: isSuccessWarning ? "green" : "red",
				color: "white",
				padding: "10px",
				marginBottom: "5px",
			}}
		>
			{message}
		</div>
	)
}

export default Warning
