import React, { useState } from 'react'
import MaterialEntry from './Components/TextInputs/MaterialId'
import MaterialDisplayName from './Components/TextInputs/MaterialDisplayName'
import SliderEntry from './Components/Sliders/SliderEntry'
import ColorPickerGroup from './Components/ColorPicker/ColorPickerGroup'
import MaterialGroups from './Components/TextInputs/MaterialGroupsProps'
import StatBoxComponent from './Components/Displays/StatDisplays'
import Warning from './Components/SelfDeletingWarning'
import JSZip from 'jszip'
import './App.css'
import ToggleButton from './Components/Buttons/ToggleButton'
import LoadDataProvider, { useLoadData } from './Components/Load/LoadDataProvider'
import FileUpload from './Components/Load/FileUploadButton'

interface AppProps {}

interface AppSliderState {
	[key: string]: number | string
}

const App: React.FC<AppProps> = () => {
	const [materialId, setMaterialId] = useState('')
	const [materialDisplayName, setMaterialDisplayName] = useState('')
	const [materialGroups, setMaterialGroups] = useState<string[]>(['metal'])
	const [colorPalette, setColorPalette] = useState<string[]>(['#000000', '#181818', '#444444', '#6b6b6b', '#969696', '#bebebe', '#d8d8d8', '#ffffff'])

	const [is121Plus, setIs121Plus] = useState(false)

	const [sliderValues, setSliderValues] = useState<AppSliderState>({
		hardness: 5,
		density: 3.8,
		flexibility: 1,
		durability: 256,
		mining_speed: 2,
		mining_level: 5
	})

	const [isAutoGenerateColors, setIsAutoGenerateColors] = useState(false)

	const generateMaterialObject = (): object => {
		const cleanId = materialId.replace(':', '_')
		const json: any = {
			key: `website-${cleanId}`,
			translation: `miapi.material.website-${cleanId}`,
			icon: {
				type: 'item',
				item: materialId
			},
			fake_translation: materialDisplayName,
			groups: materialGroups,
			color_palette: isAutoGenerateColors
				? {
						type: 'image_generated_item',
						item: `${materialId}`
				  }
				: {
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

		Object.keys(sliderValues).forEach((key: string) => {
			const value = sliderValues[key as keyof typeof sliderValues]
			json[key] = value
		})

		return json
	}

	const handleSliderSubmit = (newSliderValues: Record<keyof AppSliderState, number | string>) => {
		// Handle the submission of slider values
		setSliderValues((prevValues) => ({
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
		let test = materialId.includes(':') && materialId.split(':')[1].length > 0 && materialDisplayName !== ''
		return test
	}

	function generateResourcePack(): void {
		if (!isValidMaterial()) {
			warnUnfinishedData()
			return
		}
		const displayID = materialId.split(':')[1]
		const zip = new JSZip()

		// Add folders
		const dataFolder = zip.folder('data')
		const websiteFolder = is121Plus ? dataFolder?.folder('website') : undefined
		const miapiFolder = is121Plus ? websiteFolder?.folder('miapi') : dataFolder?.folder('miapi')
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

		addWarning('Successfully Copied!', 'green')
	}

	const [warnings, setWarnings] = useState<{ id: number; message: string; color: string }[]>([])
	const [warningIdCounter, setWarningIdCounter] = useState(0)

	const addWarning = (message: string, color: string) => {
		const newWarning = {
			id: warningIdCounter,
			message,
			color
		}

		setWarnings((prevWarnings) => [...prevWarnings, newWarning])
		setWarningIdCounter((prevCounter) => prevCounter + 1)
	}

	function warnUnfinishedData(): void {
		addWarning('You need to Set the Material id to a valid ID modID:itemID!\nAlso the Name cannot be Empty', 'red')
	}

	function removeWarning(id: number): void {
		setWarnings((prevWarnings) => prevWarnings.filter((warning) => warning.id !== id))
	}

	const handleGiveButtonPress = () => {
		if (!isValidMaterial()) {
			warnUnfinishedData()
			return
		}
		let command = ''
		const materialJson: any = generateMaterialObject()
		materialJson['parent'] = 'iron'
		delete materialJson['key']
		delete materialJson['translation']
		if (is121Plus) {
			command = `/give @p ${materialId}[miapi_material=${JSON.stringify(materialJson)}]`
		} else {
			command = `/give @p ${materialId}{miapi_material:${JSON.stringify(materialJson)}}`
		}
		navigator.clipboard.writeText(command)
		console.log(command, materialJson)
		addWarning('Successfully Copied! You might want to use a command block!', '#fcba03')
	}

	return (
		<LoadDataProvider>
			<div>
				<div className="Top-banner">
					<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
						<a
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontWeight: 'bold'
							}}
							href={'https://modrinth.com/organization/truly-modular'}
							target="_blank"
							rel="noreferrer"
						>
							<img src={process.env.PUBLIC_URL + '/logo_trans.png'} width={40} height={40} />
							<span>Truly Modular Material Helper</span>
						</a>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								fontSize: '16pt',
								transform: 'scale(75%)'
							}}
						>
							<span>1.20.1</span>
							<ToggleButton isToggled={is121Plus} setIsToggled={setIs121Plus} />
							<span>1.21+</span>
						</div>
					</div>
					<div>
						<FileUpload
							onWarning={(warning, color) => {
								addWarning(warning, color)
							}}
						></FileUpload>
					</div>
					<div style={{ ...rootStyle, display: 'flex', flexDirection: 'row' }}>
						<button style={buttonStyle} onClick={() => generateResourcePack()}>
							Download Data Pack
						</button>
						<button style={buttonStyle} onClick={() => generateMaterialJSON()}>
							Download Material Json
						</button>
						<button style={buttonStyle} onClick={() => generateMaterialJSONAndCopy()}>
							Copy Json to Clipboard
						</button>
						<button style={buttonStyle} onClick={() => handleGiveButtonPress()}>
							Copy /give Command
						</button>
					</div>
				</div>

				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						padding: '20px',
						gap: '20px'
					}}
				>
					<div id="entry-list">
						<div style={{ display: 'flex', gap: '20px' }}>
							<div>
								<h1>Details</h1>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
									<div style={{ display: 'flex', gap: '5px' }}>
										<MaterialEntry onSubmit={(entryText) => setMaterialId(entryText)} />
										<MaterialDisplayName onSubmit={(entryText) => setMaterialDisplayName(entryText)} />
									</div>
									<MaterialGroups onSubmit={handleMaterialGroupsSubmit} />
								</div>
							</div>
							<ColorPickerGroup
								initialColors={colorPalette}
								onSubmit={handleColorPaletteSubmit}
								setColorAutoGenerate={setIsAutoGenerateColors}
								autoGenerateColors={isAutoGenerateColors}
							/>
						</div>

						<div style={{ display: 'flex', gap: '20px' }}>
							<div>
								<h1>Stats</h1>
								<SliderEntry onSubmit={handleSliderSubmit} />
							</div>
							<div>
								<h1>Previews</h1>
								{isAutoGenerateColors && (
									<div style={{ marginBottom: '5px', color: 'var(--warning-red)', fontWeight: 'bold' }}>
										Previews aren't representing ingame colors anymore, since automatic generation is toggled!
									</div>
								)}
								<StatBoxComponent sliderValues={sliderValues} colorPalette={colorPalette} translation={materialDisplayName} />
							</div>
						</div>
					</div>
					<div style={{ position: 'fixed', top: 100, right: 15, zIndex: 9999 }}>
						{warnings.map((warning) => (
							<Warning key={warning.id} id={warning.id} message={warning.message} onRemove={removeWarning} color={warning.color} />
						))}
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}></div>
				</div>
			</div>
		</LoadDataProvider>
	)
}

export default App
