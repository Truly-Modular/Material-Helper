import React, { useState } from 'react'
import MaterialEntry from './Components/TextInputs/MaterialId'
import MaterialDisplayName from './Components/TextInputs/MaterialDisplayName'
import SliderEntry from './Components/Sliders/SliderEntry'
import ColorPickerGroup from './Components/ColorPicker/ColorPickerGroup'
import MaterialGroups from './Components/TextInputs/MaterialGroupsProps'
import StatBoxComponent from './Components/Displays/StatDisplays'
import MaterialImage from './Components/Displays/MaterialImageProp'
import JSZip from 'jszip'
import './App.css'

interface AppProps {}

interface AppSliderState {
	hardness: number
	density: number
	flexibility: number
	durability: number
	mining_speed: number
	mining_level: number
}

const App: React.FC<AppProps> = () => {
	const [materialId, setMaterialId] = useState('')
	const [materialDisplayName, setMaterialDisplayName] = useState('')
	const [materialGroups, setMaterialGroups] = useState<string[]>(['metal'])
	const [colorPalette, setColorPalette] = useState<string[]>(['#000000', '#181818', '#444444', '#6b6b6b', '#969696', '#bebebe', '#d8d8d8', '#ffffff'])

	const [sliderValues, setSliderValues] = useState<AppSliderState>({
		hardness: 6,
		density: 3.8,
		flexibility: 1,
		durability: 256,
		mining_speed: 2,
		mining_level: 5
	})

	const generateMaterialObject = (): object => {
		const cleanId = materialId.replace(':', '_')
		return {
			key: `website-${cleanId}`,
			translation: `miapi.material.website-${cleanId}`,
			icon: {
				type: 'item',
				item: materialId
			},
			fake_translation: materialDisplayName,
			groups: materialGroups,
			hardness: sliderValues.hardness,
			density: sliderValues.density,
			flexibility: sliderValues.flexibility,
			durability: sliderValues.durability,
			mining_speed: sliderValues.mining_speed,
			mining_level: sliderValues.mining_level,
			color_palette: {
				type: 'grayscale_map',
				colors: colorPalette.reduce((acc, color, index, array) => {
					const step = Math.round(255 / (array.length - 1))
					acc[Math.round(step * index)] = color.substr(1) // Remove # from color

					// Ensure the last entry is always at 255
					if (index === array.length - 1) {
						acc[255] = color.substr(1)
					}

					return acc
				}, {} as Record<string, string>),
				filler: 'interpolate'
			},
			items: [
				{
					item: materialId,
					value: 1.0
				}
			]
		}
	}

	const handleSliderSubmit = (newSliderValues: Record<keyof AppSliderState, number>) => {
		// Handle the submission of slider values
		setSliderValues((prevValues) => ({
			...prevValues,
			...newSliderValues
		}))
	}

	const handleMaterialGroupsSubmit = (displayNames: string[]) => {
		setMaterialGroups(displayNames)
	}

	const handleColorPaletteSubmit = (colors: string[]) => {
		setColorPalette(colors)
	}

	const buttonStyle = {
		padding: '10px',
		margin: '5px',
		backgroundColor: '#7289DA', // Discord's primary blue color
		color: '#ffffff', // Discord's white color
		border: 'none',
		borderRadius: '5px',
		cursor: 'pointer'
	}

	const rootStyle = {
		'--button-background': '#7289DA', // Discord's primary blue color
		'--button-text-color': '#ffffff' // Discord's white color
	}

	function isValidMaterial(): boolean {
		let test = materialId.includes(':') && materialId.split(':').length === 2 && materialDisplayName !== ''
		return test
	}

	function warnUnfinishedData(): void {}

	function generateResourcePack(): void {
		if (!isValidMaterial()) {
			warnUnfinishedData()
			return
		}
		const displayID = materialId.split(':')[1]
		const zip = new JSZip()

		// Add folders
		const dataFolder = zip.folder('data')
		const miapiFolder = dataFolder?.folder('miapi')
		const materialFolder = miapiFolder?.folder('materials')
		const mcMeta = {
			pack: {
				pack_format: 16,
				description: 'Generated Material ' + displayID
			}
		}

		// Add files
		materialFolder?.file('generated_' + displayID + '.json', JSON.stringify(generateMaterialObject())) // Add your file content here
		zip?.file('pack.mcmeta', JSON.stringify(mcMeta))

		// Generate ZIP file
		zip.generateAsync({ type: 'blob' }).then((blob) => {
			// Save the ZIP file
			const link = document.createElement('a')
			link.href = URL.createObjectURL(blob)
			link.download = displayID + '_datapack.zip'
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		})
	}

	function generateMaterialJSON(): void {
		if (!isValidMaterial()) {
			warnUnfinishedData()
			return
		}
		const jsonData = JSON.stringify(generateMaterialObject())

		// Create a Blob containing the JSON data
		const blob = new Blob([jsonData], { type: 'application/json' })

		// Create a download link
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = 'generatedMaterial.json'

		// Trigger the download
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	function generateMaterialJSONAndCopy(): void {
		if (!isValidMaterial()) {
			warnUnfinishedData()
			return
		}
		const jsonData = JSON.stringify(generateMaterialObject())

		// Copy JSON data to the clipboard
		navigator.clipboard.writeText(jsonData).then(() => {
			console.log('JSON data copied to clipboard:', jsonData)
		})
	}

	return (
		<div>
			<div className="Top-banner">Truly Modular Material Helper</div>
			<div style={{ display: 'flex', flexDirection: 'row' }}>
				<div id="entry-list">
					<MaterialEntry onSubmit={(entryText) => setMaterialId(entryText)} />
					<MaterialDisplayName onSubmit={(entryText) => setMaterialDisplayName(entryText)} />
					<MaterialGroups onSubmit={handleMaterialGroupsSubmit} />
					<SliderEntry onSubmit={handleSliderSubmit} />
					<ColorPickerGroup initialColors={colorPalette} onSubmit={handleColorPaletteSubmit} />
					<div style={{ ...rootStyle, display: 'flex', flexDirection: 'row' }}>
						<button style={buttonStyle} onClick={() => generateResourcePack()}>
							Download Resource Pack
						</button>
						<button style={buttonStyle} onClick={() => generateMaterialJSON()}>
							Download Material Json
						</button>
						<button style={buttonStyle} onClick={() => generateMaterialJSONAndCopy()}>
							Copy Json to Clipboard
						</button>
					</div>
				</div>
				<StatBoxComponent sliderValues={sliderValues} colorPalette={colorPalette} translation={materialDisplayName} />
			</div>
		</div>
	)
}

export default App
