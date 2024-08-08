import React, { useEffect, useState, ChangeEvent } from 'react'
import { useLoadData } from '../Load/LoadDataProvider'
import { addListener } from 'process'

interface UploadButtonProps {
	onWarning: (message: string, color: string) => void
}

const FileUpload: React.FC<UploadButtonProps> = ({ onWarning }) => {
	const { setLoadData, addWarning } = useLoadData()
	const [filename, setFileName] = useState<string>('')

	const { registerWarningListener, clearWarningListeners } = useLoadData()

	const buttonStyle = {
		padding: '10px',
		margin: '5px',
		backgroundColor: '#7289DA', // Discord's primary blue color
		color: '#ffffff', // Discord's white color
		border: 'none',
		borderRadius: '5px',
		cursor: 'pointer',
		display: 'inline-block'
	}

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
				setFileName(selectedFile.name)
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
			<label style={buttonStyle}>
				Load From File
				<input
					type="file"
					onChange={handleFileChange}
					style={{ display: 'none' }} // Hide the default file input
				/>
			</label>
			{filename}
		</form>
	)
}

export default FileUpload
