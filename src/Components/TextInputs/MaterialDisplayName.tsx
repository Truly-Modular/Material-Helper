import React, { useEffect, useState, ChangeEvent } from 'react'
import { useLoadData } from '../Load/LoadDataProvider'

interface MaterialDisplayNameProps {
	onSubmit: (displayName: string) => void
}

const MaterialDisplayName: React.FC<MaterialDisplayNameProps> = ({ onSubmit }) => {
	const [displayName, setDisplayName] = useState('')
	const { loadData, addWarning } = useLoadData()

	useEffect(() => {
		if (loadData != null) {
			if ('fake_translation' in loadData) {
				try {
					setDisplayName(loadData.fake_translation)
					onSubmit(loadData.fake_translation)
				} catch (error) {
					setDisplayName('')
					addWarning('name could not be read')
				}
			} else {
				setDisplayName('')
				addWarning('name was not found')
			}
		}
	}, [loadData])

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Validate input as the user types
		const inputValue = e.target.value
		setDisplayName(inputValue)
		onSubmit(inputValue)
	}

	return (
		<div
			className="entry special-text"
			style={{
				position: 'relative',
				backgroundColor: 'var(--discord-gray-2)',
				borderRadius: '8px',
				padding: '10px'
			}}
		>
			<label htmlFor="materialNameInput" style={{ display: 'block', color: 'var(--discord-white)', marginBottom: '5px' }}>
				Material Display Name
			</label>
			<input
				type="text"
				id="materialNameInput"
				value={displayName}
				onChange={handleInputChange}
				placeholder="Cool Name"
				style={{
					backgroundColor: 'var(--discord-gray-3)',
					color: 'var(--discord-white)',
					border: 'none',
					width: '90%',
					padding: '10px',
					borderRadius: '8px',
					outline: 'none' // Remove default focus outline
				}}
			/>
		</div>
	)
}

export default MaterialDisplayName
