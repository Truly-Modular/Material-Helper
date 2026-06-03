import React, { useEffect, useMemo, useState } from 'react'
import MaterialEntry from './Components/TextInputs/MaterialId'
import MaterialDisplayName from './Components/TextInputs/MaterialDisplayName'
import SliderEntry from './Components/Sliders/SliderEntry'
import ColorPickerGroup from './Components/ColorPicker/ColorPickerGroup'
import MaterialGroups from './Components/TextInputs/MaterialGroupsProps'
import PropertyComponent from './Components/TextInputs/PropertyComponent'
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

const AppContent: React.FC = () => {
	const { loadData } = useLoadData()
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
	const [generateConverters, setGenerateConverters] = useState(true)
	const [propertyFields, setPropertyFields] = useState({
		properties: {} as Record<string, unknown>,
		display_properties: {} as Record<string, unknown>,
		hidden_properties: {} as Record<string, unknown>
	})
	const [enabledPropertyFields, setEnabledPropertyFields] = useState({
		properties: false,
		display_properties: false,
		hidden_properties: false
	})

	const generateMaterialObject = (): object => {
		const cleanId = materialId.replace(':', '_')
		const json: any = {
			translation: is121Plus ? materialDisplayName : `miapi.material.website-${cleanId}`,
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
						colors: colorPalette.reduce(
							(acc, color, index, array) => {
								const step = Math.round(255 / (array.length - 1))

								acc[Math.min(255, Math.round(step * index))] = color.substr(1) // Remove # from color

								// Ensure the last entry is always at 255
								if (index === array.length - 1) {
									acc[255] = color.substr(1)
								}

								return acc
							},
							{} as Record<string, string>
						),
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

		if (enabledPropertyFields.properties && Object.keys(propertyFields.properties).length > 0) {
			json.properties = propertyFields.properties
		}
		if (enabledPropertyFields.display_properties && Object.keys(propertyFields.display_properties).length > 0) {
			json.display_properties = propertyFields.display_properties
		}
		if (enabledPropertyFields.hidden_properties && Object.keys(propertyFields.hidden_properties).length > 0) {
			json.hidden_properties = propertyFields.hidden_properties
		}

		if (!is121Plus) {
			json.key = `website-${cleanId}`
		}
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

	const hasPropertyContent = (field: 'properties' | 'display_properties' | 'hidden_properties') => {
		return Object.keys(propertyFields[field]).length > 0
	}

	const handlePropertyFieldSubmit = (field: 'properties' | 'display_properties' | 'hidden_properties') => {
		return (value: Record<string, unknown>) => {
			setPropertyFields((prev) => ({
				...prev,
				[field]: value
			}))

			if (Object.keys(value).length > 0) {
				setEnabledPropertyFields((prev) => ({
					...prev,
					[field]: true
				}))
			}
		}
	}

	const togglePropertyField = (field: 'properties' | 'display_properties' | 'hidden_properties') => {
		setEnabledPropertyFields((prev) => ({
			...prev,
			[field]: !prev[field]
		}))
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

	const floatingToggleBoxStyle = {
		display: 'flex',
		flexDirection: 'column' as const,
		gap: '8px',
		padding: '10px',
		borderRadius: '10px',
		backgroundColor: '#2f3136',
		border: '1px solid #3a3f4b',
		color: '#ffffff',
		minWidth: '280px',
		boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
	}

	const floatingToggleRowStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
		gap: '10px',
		padding: '6px 0'
	}

	const loadedPropertyFields = useMemo(
		() => ({
			properties: loadData?.properties && typeof loadData.properties === 'object' && !Array.isArray(loadData.properties) ? loadData.properties : {},
			display_properties:
				loadData?.display_properties && typeof loadData.display_properties === 'object' && !Array.isArray(loadData.display_properties)
					? loadData.display_properties
					: {},
			hidden_properties:
				loadData?.hidden_properties && typeof loadData.hidden_properties === 'object' && !Array.isArray(loadData.hidden_properties)
					? loadData.hidden_properties
					: {}
		}),
		[loadData]
	)

	const hasAnyPropertySectionEnabled = Object.values(enabledPropertyFields).some(Boolean)
	const hasAnyPropertyContent = (['properties', 'display_properties', 'hidden_properties'] as const).some(
		(field) => hasPropertyContent(field) || Object.keys(loadedPropertyFields[field]).length > 0
	)
	const shouldShowPropertySection = hasAnyPropertySectionEnabled || hasAnyPropertyContent

	useEffect(() => {
		if (!loadData) {
			return
		}

		const nextEnabled = {
			properties: Object.keys(loadedPropertyFields.properties).length > 0,
			display_properties: Object.keys(loadedPropertyFields.display_properties).length > 0,
			hidden_properties: Object.keys(loadedPropertyFields.hidden_properties).length > 0
		}

		setEnabledPropertyFields(nextEnabled)
		setPropertyFields({
			properties: loadedPropertyFields.properties as Record<string, unknown>,
			display_properties: loadedPropertyFields.display_properties as Record<string, unknown>,
			hidden_properties: loadedPropertyFields.hidden_properties as Record<string, unknown>
		})
	}, [loadData, loadedPropertyFields])

	function isValidMaterial(): boolean {
		let test = materialId.includes(':') && materialId.split(':')[1].length > 0 && materialDisplayName !== ''
		return test
	}

	function generateResourcePack(): void {
		if (!isValidMaterial()) {
			warnUnfinishedData()
			return
		}
		const modID = materialId.split(':')[0]
		const displayID = materialId.split(':')[1]
		const zip = new JSZip()

		// Add folders
		const dataFolder = zip.folder('data')
		const websiteFolder = dataFolder?.folder('web_helper_' + modID)
		const miapiFolder = is121Plus ? websiteFolder?.folder('miapi') : dataFolder?.folder('miapi')
		const materialFolder = miapiFolder?.folder('materials')
		const mcMeta = {
			pack: {
				pack_format: 16,
				description: 'Generated Material ' + displayID
			}
		}

		// Add files
		if (is121Plus) {
			materialFolder?.file(displayID + '.json', JSON.stringify(generateMaterialObject())) // Add your file content here
		} else {
			materialFolder?.file(displayID + '.json', JSON.stringify(generateMaterialObject())) // Add your file content here
		}
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
		const jsonData = JSON.stringify(generateMaterialObject(), null, 4)

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
		if (is121Plus) {
			const materialJson: any = {}
			const overwriteMaterial: any = { ...generateMaterialObject() }
			if (generateConverters) {
				overwriteMaterial.generate_converters = true
			}
			materialJson['parent'] = 'miapi:metal/iron'
			materialJson['overwrite'] = overwriteMaterial
			delete materialJson['key']
			delete materialJson['translation']
			command = `/give @p ${materialId}[miapi:modular_material=${JSON.stringify(materialJson)}]`
			navigator.clipboard.writeText(command)
			console.log(command, materialJson)
		} else {
			const materialJson: any = generateMaterialObject()
			materialJson['parent'] = 'iron'
			delete materialJson['key']
			delete materialJson['translation']
			command = `/give @p ${materialId}{miapi_material:${JSON.stringify(materialJson)}}`
			navigator.clipboard.writeText(command)
			console.log(command, materialJson)
		}
		addWarning('Successfully Copied! You might want to use a command block!', '#fcba03')
	}

	return (
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
						<img src={process.env.PUBLIC_URL + '/logo_trans.png'} alt="Truly Modular logo" width={40} height={40} />
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
						is121Plus={is121Plus}
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

					<div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: '1 1 420px', alignItems: 'stretch' }}>
							<div>
								<h1>Stats</h1>
								<SliderEntry onSubmit={handleSliderSubmit} is121Plus={is121Plus} setIs121Plus={setIs121Plus} />
							</div>
							{shouldShowPropertySection && (
								<div
									className="property-section"
									style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}
								>
									<h2 className="section-heading">Properties</h2>
									{(['properties', 'display_properties', 'hidden_properties'] as const)
										.filter(
											(field) => enabledPropertyFields[field] || hasPropertyContent(field) || Object.keys(loadedPropertyFields[field]).length > 0
										)
										.map((field) => (
											<PropertyComponent
												key={field}
												label={field}
												initialValue={loadedPropertyFields[field] as Record<string, unknown>}
												onSubmit={handlePropertyFieldSubmit(field)}
											/>
										))}
								</div>
							)}
						</div>
						<div style={{ flex: '0 0 420px' }}>
							<h1>Previews</h1>
							{isAutoGenerateColors && (
								<div style={{ marginBottom: '5px', color: 'var(--warning-red)', fontWeight: 'bold' }}>
									Previews aren't representing ingame colors anymore, since automatic generation is toggled!
								</div>
							)}
							<StatBoxComponent sliderValues={sliderValues} colorPalette={colorPalette} translation={materialDisplayName} is121={is121Plus} />
						</div>
					</div>
				</div>
				<div style={{ position: 'fixed', top: 100, right: 15, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
					<div style={floatingToggleBoxStyle}>
						<div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b9bbbe', marginBottom: '4px' }}>
							Toggles
						</div>
						{is121Plus && (
							<div style={floatingToggleRowStyle}>
								<ToggleButton isToggled={generateConverters} setIsToggled={setGenerateConverters} />
								<span style={{ fontWeight: 600, color: '#ffffff' }}>Generate converters</span>
							</div>
						)}
						{(['properties', 'display_properties', 'hidden_properties'] as const).map((field) => (
							<div key={field} style={floatingToggleRowStyle}>
								<ToggleButton isToggled={enabledPropertyFields[field]} setIsToggled={() => togglePropertyField(field)} />
								<span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#ffffff' }}>{field}</span>
							</div>
						))}
					</div>
					{warnings.map((warning) => (
						<Warning key={warning.id} id={warning.id} message={warning.message} onRemove={removeWarning} color={warning.color} />
					))}
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}></div>
			</div>
		</div>
	)
}

const App: React.FC<AppProps> = () => (
	<LoadDataProvider>
		<AppContent />
	</LoadDataProvider>
)

export default App
