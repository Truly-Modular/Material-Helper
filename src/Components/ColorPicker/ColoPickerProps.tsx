import React, { useState, useEffect, useRef } from "react"
import { SketchPicker, ColorResult } from "react-color"

interface ColorPickerProps {
	initialColor: string
	onChange?: (color: string) => void
	disabled?: boolean
}

const ColorPicker: React.FC<ColorPickerProps> = ({ initialColor, onChange, disabled }) => {
	const [color, setColor] = useState(initialColor)
	const [showPicker, setShowPicker] = useState(false)
	const colorPickerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
				setShowPicker(false)
			}
		}

		document.addEventListener("click", handleClickOutside)

		return () => {
			document.removeEventListener("click", handleClickOutside)
		}
	}, [])

	const handleColorChange = (newColor: ColorResult) => {
		const newHexColor = newColor.hex
		setColor(newHexColor)

		if (onChange) {
			onChange(newHexColor)
		}
	}

	const handleColorClick = () => {
		if (!disabled) {
			setShowPicker(!showPicker)
		}
	}

	return (
		<div style={{ position: "relative", display: "inline-block" }} ref={colorPickerRef}>
			<div
				style={{
					backgroundColor: color,
					width: "40px",
					height: "40px",
					cursor: disabled ? "not-allowed" : "pointer",
					filter: disabled ? "grayscale(100%)" : "none",
					opacity: disabled ? 0.5 : 1,
				}}
				onClick={handleColorClick}
			/>
			{showPicker && !disabled && (
				<div
					style={{
						position: "absolute",
						zIndex: 2,
						top: "50px", // Adjust the position as needed
						left: "0",
					}}
				>
					<SketchPicker color={color} onChange={handleColorChange} />
				</div>
			)}
			{disabled && (
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(128, 128, 128, 0.5)",
						zIndex: 1,
						pointerEvents: "none",
					}}
				/>
			)}
		</div>
	)
}

export default ColorPicker
