import React from 'react'
import MaterialImage from './MaterialImageProp'
import '../.././App.css'

interface LineProps {
	text: string
}

interface MaterialImageProps {
	imageUrl: string
	colorPalette: string[]
}

interface CustomComponentProps {
	imageProps: MaterialImageProps
	headerText: string
	lines: LineProps[]
}

const Line: React.FC<LineProps> = ({ text }) => <div>{text}</div>

const CustomComponent: React.FC<CustomComponentProps> = ({ imageProps, headerText, lines }) => {
	const { imageUrl, colorPalette } = imageProps

	return (
		<div id="entry">
			<div style={{ float: 'left' }}>
				<MaterialImage
					imageUrl={imageUrl}
					colorPalette={colorPalette}
					style={{ width: '100px', height: '100px', objectFit: 'contain', padding: '5px' }}
				/>
			</div>
			<div style={{ float: 'left', marginLeft: '5px' }}>
				<h3>{headerText}</h3>
				{lines.map((line, index) => (
					<Line key={index} text={line.text} />
				))}
			</div>
		</div>
	)
}

export default CustomComponent
