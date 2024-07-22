import React, { useState } from "react"
import ColorPicker from "./ColoPickerProps"

interface ColorPickerGroupProps {
	initialColors: string[]
	onSubmit?: (colors: string[]) => void
}

const ColorPickerGroup: React.FC<ColorPickerGroupProps> = ({ initialColors, onSubmit }) => {
	const [gradientColors, setGradientColors] = useState<string[]>(initialColors)

	const handleColorChange = (index: number, newColor: string) => {
		const updatedColors = [...gradientColors]
		updatedColors[index] = newColor
		setGradientColors(updatedColors)

		// Trigger the onSubmit callback with the updated colors
		if (onSubmit) {
			onSubmit(updatedColors)
		}
	}

	// Create a dynamic gradient background using the updated colors
	const gradientBackground = `linear-gradient(to right, ${gradientColors.join(", ")})`

	return (
		<div>
			<h1>Material Colors</h1>
			<div className="entry">
				{/* Color pickers */}
				<div
					style={{
						display: "flex",
						gap: "5px",
						margin: "10px",
					}}
				>
					<label>Generate Automatically</label>
					<input type="checkbox" />
				</div>
				<div
					style={{
						margin: "20px",
						marginTop: "0px",
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
					}}
				>
					{gradientColors.map((color, index) => (
						<ColorPicker
							key={index}
							initialColor={color}
							onChange={(newColor) => handleColorChange(index, newColor)}
						/>
					))}
				</div>
				{/* Banner with dynamic gradient background */}
				<div
					style={{
						marginLeft: "10px",
						marginRight: "10px",
						height: "50px", // Adjust the height as needed
						background: gradientBackground,
						borderRadius: "8px", // Optional: Add rounded corners
					}}
				/>
			</div>
		</div>
	)
}

export default ColorPickerGroup
