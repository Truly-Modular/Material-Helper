import React, { useState, ChangeEvent, useEffect } from 'react'
import { useLoadData } from '../Load/LoadDataProvider'

interface MaterialEntryProps {
	onSubmit: (entryText: string) => void
}

const MaterialEntry: React.FC<MaterialEntryProps> = ({ onSubmit }) => {
	const [entryText, setEntryText] = useState('')
	const { loadData, addWarning } = useLoadData()

	useEffect(() => {
		if (loadData != null) {
			try {
				const id: string = loadData.icon.item
				if (id !== undefined) {
					setEntryText(id)
					onSubmit(id)
					return
				}
				const items: any[] = loadData.items
				for (const item of items) {
					try {
						const stringID: string = item.item
						if (stringID !== undefined) {
							setEntryText(stringID)
							onSubmit(stringID)
							return
						}
					} catch (error) {}
				}
			} catch (error) {}
			setEntryText('')
			onSubmit('')
			addWarning('id was not found')
		}
	}, [loadData])

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Validate input as the user types
		const inputValue = e.target.value
		const regex = /^[a-z_:1-9A-Z]+$/

		if (regex.test(inputValue) || inputValue === '') {
			setEntryText(inputValue.toLowerCase())
			onSubmit(inputValue.toLowerCase()) // Optionally submit on every key press
		}
	}

	return (
		<div>
			<label htmlFor="materialInput" className="field-label">
				Material Item ID
			</label>
			<input
				type="text"
				id="materialInput"
				value={entryText}
				onChange={handleInputChange}
				placeholder="modid:item_id"
				className="field-input"
				style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
			/>
		</div>
	)
}

export default MaterialEntry
