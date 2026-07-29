import React, { useEffect, useMemo, useRef, useState } from 'react'
import ToggleButton from '../Buttons/ToggleButton'

interface PropertyComponentProps {
	label: string
	description?: string
	initialValue?: Record<string, unknown>
	onSubmit?: (value: Record<string, unknown>) => void
	enabled: boolean
	onToggle: () => void
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

const PropertyComponent: React.FC<PropertyComponentProps> = ({ label, description, initialValue, onSubmit, enabled, onToggle }) => {
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

	useEffect(() => {
		if (enabled) {
			requestAnimationFrame(resizeTextarea)
		}
	}, [enabled])

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
		<div className="property-editor">
			<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
				<ToggleButton isToggled={enabled} setIsToggled={onToggle} />
				<span style={{ userSelect: 'none', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', color: 'var(--text)' }}>{label.replace(/_/g, ' ')}</span>
			</div>
			{enabled && (
				<div>
					<div style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginBottom: '6px' }}>{helperText}</div>
					<textarea
						ref={textareaRef}
						value={textValue}
						onChange={handleChange}
						spellCheck={false}
						rows={3}
						placeholder="{}"
						style={{
							width: '100%',
							boxSizing: 'border-box',
							background: 'var(--input-bg)',
							border: '1px solid var(--input-border)',
							color: 'var(--text)',
							borderRadius: '8px',
							padding: '10px',
							fontFamily: 'ui-monospace, Menlo, monospace',
							fontSize: '12px',
							outline: 'none',
							resize: 'vertical'
						}}
					/>
					{errorMessage ? <div style={{ color: '#ffb4b4', fontSize: '11.5px', marginTop: '4px' }}>{errorMessage}</div> : null}
				</div>
			)}
		</div>
	)
}

export default PropertyComponent
