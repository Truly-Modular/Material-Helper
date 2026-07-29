import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
		materialFolder?.file(displayID + '.json', JSON.stringify(generateMaterialObject()))
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

	// Height sync: keep the Properties panel's min-height matching the left
	// column's overflow past the preview cards, mirroring the two-column layout.
	const leftColRef = useRef<HTMLDivElement>(null)
	const previewsBlockRef = useRef<HTMLDivElement>(null)
	const [propertiesMinHeight, setPropertiesMinHeight] = useState(0)

	useLayoutEffect(() => {
		const leftEl = leftColRef.current
		const previewsEl = previewsBlockRef.current
		if (!leftEl || !previewsEl) {
			return
		}

		const sync = () => {
			const leftHeight = leftEl.getBoundingClientRect().height
			const previewsHeight = previewsEl.getBoundingClientRect().height
			const target = Math.max(0, Math.round(leftHeight - previewsHeight - 14))
			setPropertiesMinHeight((prev) => (Math.abs(prev - target) > 2 ? target : prev))
		}

		const observer = new ResizeObserver(sync)
		observer.observe(leftEl)
		observer.observe(previewsEl)
		sync()

		return () => observer.disconnect()
	}, [])

	const propertyFieldOrder = ['properties', 'display_properties', 'hidden_properties'] as const

	return (
		<div>
			<header
				style={{
					position: "sticky",
					top: 0,
					zIndex: 99,
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					gap: '16px',
					justifyContent: 'space-between',
					padding: '18px 28px',
					background: 'var(--card-bg)',
					borderBottom: '1px solid var(--card-border)'
				}}
			>
				<a
					href="https://modrinth.com/organization/truly-modular"
					target="_blank"
					rel="noreferrer"
					style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)' }}
				>
					<img
						src={process.env.PUBLIC_URL + '/logo_trans.png'}
						alt="Truly Modular logo"
						width={36}
						height={36}
						style={{ borderRadius: '6px' }}
					/>
					<div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
						<span style={{ fontWeight: 700, fontSize: '15px' }}>Truly Modular</span>
						<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Material Helper</span>
					</div>
				</a>

				<div className="segmented-control">
					<button
						onClick={() => setIs121Plus(false)}
						style={{ background: !is121Plus ? 'var(--accent)' : 'transparent', color: !is121Plus ? 'var(--accent-text)' : 'var(--text-secondary)' }}
					>
						1.20.1
					</button>
					<button
						onClick={() => setIs121Plus(true)}
						style={{ background: is121Plus ? 'var(--accent)' : 'transparent', color: is121Plus ? 'var(--accent-text)' : 'var(--text-secondary)' }}
					>
						1.21+
					</button>
				</div>

				<FileUpload
					onWarning={(warning, color) => {
						addWarning(warning, color)
					}}
					is121Plus={is121Plus}
				/>

				<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
					<button className="header-button header-button-primary" onClick={() => generateResourcePack()}>
						Download Data Pack
					</button>
					<button className="header-button" onClick={() => generateMaterialJSON()}>
						Download JSON
					</button>
					<button className="header-button" onClick={() => generateMaterialJSONAndCopy()}>
						Copy JSON
					</button>
					<button className="header-button" onClick={() => handleGiveButtonPress()}>
						Copy /give
					</button>
				</div>
			</header>

			<main
				className="main-grid"
				style={{
					display: 'grid',
					gap: '22px',
					padding: '24px 28px 60px',
					alignItems: 'start'
				}}
			>
				<div ref={leftColRef} style={{ display: 'flex', flexDirection: 'column', gap: '22px', minWidth: 0 }}>
					<section className="card-section">
						<h2 className="section-heading" style={{ marginBottom: '14px' }}>
							Details
						</h2>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
							<MaterialEntry onSubmit={(entryText) => setMaterialId(entryText)} />
							<MaterialDisplayName onSubmit={(entryText) => setMaterialDisplayName(entryText)} />
						</div>
						<MaterialGroups onSubmit={handleMaterialGroupsSubmit} />
					</section>

					<ColorPickerGroup
						initialColors={colorPalette}
						onSubmit={handleColorPaletteSubmit}
						setColorAutoGenerate={setIsAutoGenerateColors}
						autoGenerateColors={isAutoGenerateColors}
					/>

					<section className="card-section">
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
							<h2 className="section-heading">Stats</h2>
							{is121Plus && (
								<label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
									<span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Generate converters</span>
									<ToggleButton isToggled={generateConverters} setIsToggled={setGenerateConverters} size="lg" />
								</label>
							)}
						</div>
						<SliderEntry onSubmit={handleSliderSubmit} is121Plus={is121Plus} setIs121Plus={setIs121Plus} />
					</section>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
					<div ref={previewsBlockRef} style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' }}>
						{isAutoGenerateColors && (
							<div
								style={{
									color: 'var(--orange)',
									fontSize: '12.5px',
									fontWeight: 600,
									background: 'var(--input-bg)',
									border: '1px solid var(--input-border)',
									borderRadius: '8px',
									padding: '10px 12px'
								}}
							>
								Previews aren't representing in-game colors anymore, since automatic generation is toggled!
							</div>
						)}
						<StatBoxComponent sliderValues={sliderValues} colorPalette={colorPalette} translation={materialDisplayName} is121={is121Plus} />
					</div>

					<section
						className="card-section"
						style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
					>
						<h2 className="section-heading" style={{userSelect: 'none'}}>Properties</h2>
						{propertyFieldOrder.map((field) => (
							<PropertyComponent
								key={field}
								label={field}
								initialValue={loadedPropertyFields[field] as Record<string, unknown>}
								onSubmit={handlePropertyFieldSubmit(field)}
								enabled={enabledPropertyFields[field]}
								onToggle={() => togglePropertyField(field)}
							/>
						))}
					</section>
				</div>
			</main>

			<div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '340px' }}>
				{warnings.map((warning) => (
					<Warning key={warning.id} id={warning.id} message={warning.message} onRemove={removeWarning} color={warning.color} />
				))}
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
