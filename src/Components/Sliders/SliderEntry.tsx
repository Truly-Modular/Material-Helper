import React, { useState, useEffect, useRef } from "react"
import SingleSlider from "./SingleSlider"
import IntegerSliderEntry from "./IntegerSliderEntry"
import HighLimitSliderEntry from "./HighLimitSliderEntry"
import StringStatEntry from "./StringStatInput"

interface SliderEntryProps {
	onSubmit: (sliderValues: Record<string, number | string>) => void
}

enum CustomSliderType {
	INTEGER,
	FLOAT,
	STRING,
}

const SliderEntry: React.FC<SliderEntryProps> = ({ onSubmit }) => {
	const [sliderValues, setSliderValues] = useState({
		hardness: 6,
		density: 2,
		flexibility: 3,
		durability: 256,
		mining_level: 2,
		mining_speed: 5,
	})

	const [customSliders, setCustomSliders] = useState<{
		[id: string]: {
			name: string
			value: any
			type: CustomSliderType
			id: string
		}
	}>({})

	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const dropdownButtonRef = useRef<HTMLButtonElement>(null)

	const handleSliderChange = (sliderName: string, newValue: number) => {
		setSliderValues((prevValues) => ({
			...prevValues,
			[sliderName]: newValue,
		}))
	}

	useEffect(() => {
		handleEntrySubmit()
	}, [sliderValues, customSliders])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				!dropdownButtonRef.current?.contains(event.target as Node)
			) {
				setIsDropdownOpen(false)
			}
		}

		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside)
		} else {
			document.removeEventListener("mousedown", handleClickOutside)
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isDropdownOpen])

	const handleEntrySubmit = () => {
		const customSliderValues: { [name: string]: number | string } = {}
		Object.values(customSliders).forEach((slider) => {
			customSliderValues[slider.name] = slider.value
		})
		onSubmit({ ...sliderValues, ...customSliderValues })
	}

	const renderCustomSliders = () => {
		return Object.values(customSliders).map((slider) => {
			let sliderComponent
			switch (slider.type) {
				case CustomSliderType.FLOAT:
					sliderComponent = (
						<SingleSlider
							label={slider.name}
							onChange={(value) => {
								setCustomSliders((prev) => ({
									...prev,
									[slider.id]: {
										...slider,
										value,
									},
								}))
							}}
							value={slider.value}
							editableLabel={true}
							onLabelChange={(value) => {
								setCustomSliders((prev) => ({
									...prev,
									[slider.id]: {
										...slider,
										name: value,
									},
								}))
							}}
						/>
					)
					break
				case CustomSliderType.INTEGER:
					sliderComponent = (
						<IntegerSliderEntry
							label={slider.name}
							value={slider.value}
							onChange={(value) => {
								setCustomSliders((prev) => ({
									...prev,
									[slider.id]: {
										...slider,
										value,
									},
								}))
							}}
							editableLabel={true}
							onLabelChange={(value) => {
								setCustomSliders((prev) => ({
									...prev,
									[slider.id]: {
										...slider,
										name: value,
									},
								}))
							}}
						/>
					)
					break
				case CustomSliderType.STRING:
					sliderComponent = (
						<StringStatEntry
							label={slider.name}
							value={slider.value}
							onChange={(value) => {
								setCustomSliders((prev) => ({
									...prev,
									[slider.id]: {
										...slider,
										value,
									},
								}))
							}}
							editableLabel={true}
							onLabelChange={(value) => {
								setCustomSliders((prev) => ({
									...prev,
									[slider.id]: {
										...slider,
										name: value,
									},
								}))
							}}
						/>
					)
					break
			}

			return (
				<div key={slider.id} style={{ display: "flex", gap: "5px", justifyItems: "center" }}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() => {
							setCustomSliders((prevSliders) => {
								const newSliders = { ...prevSliders }
								delete newSliders[slider.id]
								return newSliders
							})
						}}
					>
						<DeleteIcon />
					</div>
					{sliderComponent}
				</div>
			)
		})
	}

	function generateId() {
		return "_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
	}

	return (
		<div
			className="entry"
			style={{
				position: "relative",
				backgroundColor: "var(--discord-gray-2)",
				borderRadius: "8px",
				padding: "10px",
				color: "var(--discord-white)",
			}}
		>
			<SingleSlider
				label="Hardness"
				value={sliderValues.hardness}
				onChange={(value) => handleSliderChange("hardness", value)}
			/>
			<SingleSlider
				label="Density"
				value={sliderValues.density}
				onChange={(value) => handleSliderChange("density", value)}
			/>
			<SingleSlider
				label="Flexibility"
				value={sliderValues.flexibility}
				onChange={(value) => handleSliderChange("flexibility", value)}
			/>
			<HighLimitSliderEntry
				label="Durability"
				value={sliderValues.durability}
				onChange={(value) => handleSliderChange("durability", value)}
			/>
			<IntegerSliderEntry
				label="Mining Level"
				value={sliderValues.mining_level}
				onChange={(value) => handleSliderChange("mining_level", value)}
			/>
			<SingleSlider
				label="Mining Speed"
				value={sliderValues.mining_speed}
				onChange={(value) => handleSliderChange("mining_speed", value)}
			/>
			{renderCustomSliders()}
			<div style={{ position: "relative" }}>
				<button
					ref={dropdownButtonRef}
					onClick={(e) => {
						e.preventDefault()
						setIsDropdownOpen(!isDropdownOpen)
					}}
					style={{
						width: "100%",
						height: "30px",
						backgroundColor: "var(--discord-gray-3)",
						color: "#ffffff",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					<span style={{ fontSize: "14pt" }}>+</span>
				</button>
				{isDropdownOpen && (
					<div
						ref={dropdownRef}
						style={{
							position: "absolute",
							top: "35px", // Adjust the position as needed
							left: "0",
							backgroundColor: "var(--discord-gray-3)",
							// border: "1px solid #ccc",
							borderRadius: "5px",
							boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
							zIndex: 1,
							width: "100%", // Make the dropdown the same width as the button
						}}
					>
						<ul style={{ listStyle: "none", padding: "10px", margin: 0 }}>
							{Object.keys(CustomSliderType)
								.filter((key) => isNaN(Number(key)))
								.map((key) => (
									<li
										key={key}
										onClick={() => {
											let uuid
											do {
												uuid = generateId()
											} while (customSliders[uuid] !== undefined)
											setCustomSliders({
												...customSliders,
												[uuid]: {
													id: uuid,
													name: "new",
													value: key === "STRING" ? "" : 0,
													type: CustomSliderType[key as keyof typeof CustomSliderType],
												},
											})
											setIsDropdownOpen(false)
										}}
										className="dropdown-item"
									>
										{key}
									</li>
								))}
						</ul>
					</div>
				)}
			</div>
		</div>
	)
}

export default SliderEntry

const DeleteIcon = (props: any) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="lucide lucide-trash-2"
	>
		<path d="M3 6h18" />
		<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
		<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
		<line x1="10" x2="10" y1="11" y2="17" />
		<line x1="14" x2="14" y1="11" y2="17" />
	</svg>
)
