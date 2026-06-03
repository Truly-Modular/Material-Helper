import React, { useEffect, useMemo, useRef, useState } from 'react'

interface PropertyComponentProps {
	label: string
	description?: string
	initialValue?: Record<string, unknown>
	onSubmit?: (value: Record<string, unknown>) => void
}

const parseJsonObject = (value: string): Record<string, unknown> => {
	const trimmed = value.trim()

	if (!trimmed) {
		return {}
	}

	const parsed = JSON.parse(trimmed)

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error('Expected a JSON object')
	}

	return parsed as Record<string, unknown>
}

const PropertyComponent: React.FC<PropertyComponentProps> = ({ label, description, initialValue, onSubmit }) => {
	const [textValue, setTextValue] = useState('{}')
	const [errorMessage, setErrorMessage] = useState('')
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const resizeTextarea = () => {
		const textarea = textareaRef.current
		if (!textarea) {
			return
		}

		textarea.style.height = 'auto'
		textarea.style.height = `${textarea.scrollHeight}px`
	}

	useEffect(() => {
		const nextValue = initialValue && Object.keys(initialValue).length > 0 ? JSON.stringify(initialValue, null, 2) : '{}'
		setTextValue(nextValue)
		requestAnimationFrame(resizeTextarea)
	}, [initialValue])

	const helperText = useMemo(() => {
		if (description) {
			return description
		}

		return 'Use a JSON object of module tags to properties. Example: {"tool": {"luminous_learning": "1"}}'
	}, [description])

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const nextValue = event.target.value
		setTextValue(nextValue)
		requestAnimationFrame(resizeTextarea)

		try {
			const parsedValue = parseJsonObject(nextValue)
			setErrorMessage('')
			onSubmit?.(parsedValue)
		} catch (error) {
			setErrorMessage('Invalid JSON object. Enter a valid object literal.')
		}
	}

	return (
		<div className="entry property-editor" style={{ marginTop: '8px', width: '100%', maxWidth: '100%', textAlign: 'left' }}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
				<label style={{ display: 'block', color: 'var(--discord-white)', fontWeight: 600, textTransform: 'capitalize' }}>{label}</label>
				<span style={{ color: '#d8dee9', fontSize: '12px', lineHeight: 1.4 }}>{helperText}</span>
				<textarea
					ref={textareaRef}
					value={textValue}
					onChange={handleChange}
					spellCheck={false}
					rows={2}
					placeholder="{}"
					style={{
						width: '100%',
						backgroundColor: 'var(--discord-gray-3)',
						color: 'var(--discord-white)',
						border: 'none',
						borderRadius: '8px',
						padding: '10px',
						fontFamily: 'monospace',
						fontSize: '12px',
						minHeight: '48px',
						height: 'auto',
						overflow: 'hidden',
						resize: 'none',
						outline: 'none',
						boxSizing: 'border-box'
					}}
				/>
				{errorMessage ? <span style={{ color: '#ffb4b4', fontSize: '12px' }}>{errorMessage}</span> : null}
			</div>
		</div>
	)
}

export default PropertyComponent
