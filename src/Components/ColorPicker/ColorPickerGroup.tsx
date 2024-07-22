import React, { useState } from "react"
import ColorPicker from "./ColoPickerProps"

interface ColorPickerGroupProps {
	initialColors: string[]
	onSubmit?: (colors: string[]) => void
	setColorAutoGenerate: (checked: boolean) => void
	autoGenerateColors: boolean
}

const ColorPickerGroup: React.FC<ColorPickerGroupProps> = ({
	initialColors,
	onSubmit,
	setColorAutoGenerate,
	autoGenerateColors,
}) => {
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
					<input
						type="checkbox"
						checked={autoGenerateColors}
						onChange={(e) => setColorAutoGenerate(e.target.checked)}
					/>
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
							disabled={autoGenerateColors}
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
						filter: autoGenerateColors ? "grayscale(100%)" : "none",
						opacity: autoGenerateColors ? 0.5 : 1,
						position: "relative",
					}}
				/>
			</div>
		</div>
	)
}

export default ColorPickerGroup
