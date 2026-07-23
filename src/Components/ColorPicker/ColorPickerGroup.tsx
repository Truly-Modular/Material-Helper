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
		<section className="card-section">
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
				<h2 className="section-heading">Material Colors</h2>
				<div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
					<label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
						<input
							type="checkbox"
							checked={autoGenerateColors}
							onChange={(e) => setColorAutoGenerate(e.target.checked)}
							style={{ accentColor: 'var(--accent)', width: '15px', height: '15px', cursor: 'pointer' }}
						/>
						Generate Automatically
					</label>
					<div style={{ display: 'flex', gap: '6px' }}>
						<button
							onClick={addColor}
							disabled={gradientColors.length >= 10 || autoGenerateColors}
							style={{
								width: '28px',
								height: '28px',
								borderRadius: '6px',
								border: '1px solid var(--input-border)',
								background: 'var(--input-bg)',
								color: 'var(--text)',
								cursor: 'pointer',
								fontSize: '14px'
							}}
						>
							+
						</button>
						<button
							onClick={removeColor}
							disabled={gradientColors.length <= 2 || autoGenerateColors}
							style={{
								width: '28px',
								height: '28px',
								borderRadius: '6px',
								border: '1px solid var(--input-border)',
								background: 'var(--input-bg)',
								color: 'var(--text)',
								cursor: 'pointer',
								fontSize: '14px'
							}}
						>
							−
						</button>
					</div>
				</div>
			</div>
			{/* Color Pickers */}
			<div
				style={{
					display: 'flex',
					gap: '10px',
					flexWrap: 'wrap',
					marginBottom: '14px',
					opacity: autoGenerateColors ? 0.5 : 1,
					filter: autoGenerateColors ? 'grayscale(100%)' : 'none'
				}}
			>
				{gradientColors.map((color, index) => (
					<ColorPicker
						key={colorPickerKeys[index] ?? index}
						initialColor={color}
						onChange={(newColor) => handleColorChange(index, newColor)}
						disabled={autoGenerateColors}
					/>
				))}
			</div>
			{/* Banner with dynamic gradient background */}
			<div
				style={{
					height: '40px',
					borderRadius: '8px',
					border: '1px solid var(--input-border)',
					background: `linear-gradient(to right, ${gradientColors.join(', ')})`,
					opacity: autoGenerateColors ? 0.5 : 1,
					filter: autoGenerateColors ? 'grayscale(100%)' : 'none'
				}}
			/>
		</section>
	)
}

export default ColorPickerGroup
