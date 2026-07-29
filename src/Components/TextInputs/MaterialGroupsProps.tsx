import React, { useState, ChangeEvent, useEffect } from 'react'
import { useLoadData } from '../Load/LoadDataProvider'

interface MaterialGroupsProps {
	onSubmit: (displayNames: string[]) => void
}

const MaterialGroups: React.FC<MaterialGroupsProps> = ({ onSubmit }) => {
	const [displayNames, setDisplayNames] = useState(['metal'])
	const { loadData, addWarning } = useLoadData()

	useEffect(() => {
		if (loadData != null) {
			try {
				if ('groups' in loadData && Array.isArray(loadData.groups)) {
					const allStrings = loadData.groups.every((item: any) => typeof item === 'string')
					if (allStrings) {
						setDisplayNames(loadData.groups)
						onSubmit(loadData.groups)
					} else {
						addWarning('groups could not be read correctly')
					}
				} else {
					addWarning('groups were not found')
				}
			} catch (error) {
				addWarning('groups could not be read')
			}
		}
	}, [loadData])

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Validate input as the user types
		const inputValue = e.target.value

		// Split the input by commas and trim spaces, allowing commas within entries
		const validDisplayNames = inputValue
			.split(',')
			.map((name) =>
				name === ' '
					? name
					: name
							.replace(/[^a-zA-Z]/g, '')
							.trim()
							.toLowerCase()
			)
			.filter((name) => name !== '')

		setDisplayNames(validDisplayNames)
		onSubmit(validDisplayNames)
	}

	const removeGroup = (index: number) => {
		const next = displayNames.filter((_, i) => i !== index)
		setDisplayNames(next)
		onSubmit(next)
	}

	useEffect(() => {
		// Trigger onSubmit when the component mounts with the default entry
		onSubmit(displayNames)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div>
			<label htmlFor="materialGroupsInput" className="field-label">
				Material Groups
			</label>
			<input
				type="text"
				id="materialGroupsInput"
				value={displayNames.join(', ')}
				onChange={handleInputChange}
				placeholder="e.g., metal, wood, stone"
				onKeyDown={(e) => {
					const inputElement = e.target as HTMLInputElement
					// Remove a single space if the last character is a space when Backspace is pressed
					if (e.key === 'Backspace' && inputElement.value.endsWith(' ')) {
						setDisplayNames((prevNames) => prevNames.slice(0, -1))
					} else if (e.key === ',' && inputElement.selectionStart === inputElement.value.length) {
						// Add an empty entry when comma is pressed at the end
						setDisplayNames((prevNames) => [...prevNames, ''])
					}
				}}
				className="field-input"
				style={{ marginBottom: '8px' }}
			/>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
				{displayNames.map((name, index) => (
					<div key={index} className="chip">
						<span>{name}</span>
						<button type="button" onClick={() => removeGroup(index)}>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

export default MaterialGroups
