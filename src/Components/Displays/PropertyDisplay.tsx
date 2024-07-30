import {useEffect, useRef, useState} from "react"

const PropertyDisplay = () => {
	const dropdownButtonRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [properties, setProperties] = useState<{[uuid: string]: {}}>({})

	const options = ["default", "handheld", "tool", "blade", "head", "axe", "pickaxe", "hammer", "hoe", "shovel", "armor", "helmet", "chest", "pants", "boots", "custom"]

	function generateId() {
		return "_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
	}

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

	return (
		<div style={{
			'backgroundColor': 'var(--discord-gray-2)',
			width: '100%'
		}}>
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
							{options.map(option => {
								return (
									<li 
										onClick={() => {
											let uuid
											do {
												uuid = generateId()
											} while (properties[uuid] !== undefined)
											setIsDropdownOpen(false)
										}}
									className="dropdown-item" key={option}>{option}</li>
								)
							})}
						</ul>
					</div>
				)}
			</div>
		</div>
	)
}

export default PropertyDisplay
