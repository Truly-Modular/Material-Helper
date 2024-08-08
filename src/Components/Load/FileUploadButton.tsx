import React, { useEffect, useState, ChangeEvent } from 'react'
import { useLoadData } from '../Load/LoadDataProvider'
import { addListener } from 'process'

interface UploadButtonProps {
	onWarning: (message: string, color: string) => void
}

const FileUpload: React.FC<UploadButtonProps> = ({ onWarning }) => {
	const { setLoadData, addWarning } = useLoadData()

	const { registerWarningListener, clearWarningListeners } = useLoadData()

	useEffect(() => {
		// Register the warning listener
		registerWarningListener(onWarning)

		// I prob should de-register this again
		return () => {
			clearWarningListeners()
		}
	}, [registerWarningListener])

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] // Get the first selected file
		fileUpdate(selectedFile)
	}

	const fileUpdate = (selectedFile: File | undefined) => {
		if (selectedFile == undefined) {
			console.log('file is not defined!')
		}
		selectedFile?.text().then((text: string) => {
			try {
				const parsed = JSON.parse(text)
				setLoadData(parsed)
			} catch (error) {
				addWarning('could not load as a material! ' + selectedFile?.name)
				console.log(error)
			}
		})
	}

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
	}

	return (
		<form onSubmit={handleSubmit}>
			<input type="file" onChange={handleFileChange} />
			<button type="submit">Upload</button>
		</form>
	)
}

export default FileUpload
