import React, { useEffect, useState } from 'react'
import ColorPicker from './ColoPickerProps'
import { useLoadData } from '../Load/LoadDataProvider'
import { bool } from 'sharp'

interface ColorPickerGroupProps {
	initialColors: string[]
	onSubmit?: (colors: string[]) => void
	setColorAutoGenerate: (checked: boolean) => void
	autoGenerateColors: boolean
}

const ColorPickerGroup: React.FC<ColorPickerGroupProps> = ({ initialColors, onSubmit, setColorAutoGenerate, autoGenerateColors }) => {
	const [gradientColors, setGradientColors] = useState<string[]>(initialColors)
	const { loadData, addWarning } = useLoadData()
	const [colorPickerKeys, setColorPickerKeys] = useState<string[]>([])

	useEffect(() => {
		if (loadData != null) {
			let success: boolean = false
			try {
				if (loadData.color_palette.type == 'image_generated_item') {
					setColorAutoGenerate(true)
					success = true
					return
				}
				if (loadData.color_palette.type == 'grayscale_map') {
					const colors: string[] = Object.values(loadData.color_palette.colors)

					const colorsDone: string[] = colors.map((color) => {
						return color.startsWith('#') ? color : `#${color}`
					})
					setColorAutoGenerate(false)
					setGradientColors([])
					setGradientColors(colorsDone)

					setColorPickerKeys(gradientColors.map((c) => c + Date.now().toLocaleString()))
					if (onSubmit) {
						onSubmit(colorsDone)
					}
					success = true
					return
				}
			} catch (error) {
				console.log(error)
			}
			if (!success) {
				addWarning('color palette could not be loaded! Setting to generated!')
				setColorAutoGenerate(true)
			}
		}
	}, [loadData])

	const handleColorChange = (index: number, newColor: string) => {
		const updatedColors = [...gradientColors]
		updatedColors[index] = newColor
		setGradientColors(updatedColors)
		if (onSubmit) {
			onSubmit(updatedColors)
		}
	}

	const addColor = () => {
		setGradientColors([...gradientColors, '#ffffff'])
	}

	const removeColor = () => {
		if (gradientColors.length > 2) {
			setGradientColors(gradientColors.slice(0, -1))
		}
	}

	return (
		<div>
			<h1>Material Colors</h1>
			<div className="entry">
				{/* Generate Automatically Checkbox and Plus/Minus Buttons */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between', // Space between elements
						alignItems: 'center', // Align items vertically in the center
						margin: '10px 20px' // Adjust margins as needed
					}}
				>
					{/* Left-aligned checkbox */}
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<label style={{ marginRight: '5px' }}>Generate Automatically</label>
						<input type="checkbox" checked={autoGenerateColors} onChange={(e) => setColorAutoGenerate(e.target.checked)} />
					</div>

					{/* Right-aligned buttons */}
					<div>
						<button onClick={addColor} disabled={gradientColors.length >= 10 || autoGenerateColors} style={{ marginRight: '10px' }}>
							+
						</button>
						<button onClick={removeColor} disabled={gradientColors.length <= 1 || autoGenerateColors}>
							-
						</button>
					</div>
				</div>
				{/* Color Pickers */}
				<div
					style={{
						margin: '20px',
						marginTop: '0px',
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between'
					}}
				>
					{gradientColors.map((color, index) => (
						<ColorPicker
							key={colorPickerKeys[index]}
							initialColor={color}
							onChange={(newColor) => handleColorChange(index, newColor)}
							disabled={autoGenerateColors}
						/>
					))}
				</div>
				{/* Banner with dynamic gradient background */}
				<div
					style={{
						marginLeft: '10px',
						marginRight: '10px',
						height: '50px', // Adjust the height as needed
						background: `linear-gradient(to right, ${gradientColors.join(', ')})`,
						borderRadius: '8px', // Optional: Add rounded corners
						filter: autoGenerateColors ? 'grayscale(100%)' : 'none',
						opacity: autoGenerateColors ? 0.5 : 1,
						position: 'relative'
					}}
				/>
			</div>
		</div>
	)
}

export default ColorPickerGroup
