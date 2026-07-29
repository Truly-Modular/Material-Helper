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

const Line: React.FC<LineProps> = ({ text }) => (
	<div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, Menlo, monospace', whiteSpace: 'pre' }}>{text}</div>
)

const CustomComponent: React.FC<CustomComponentProps> = ({ imageProps, headerText, lines }) => {
	const { imageUrl, colorPalette } = imageProps

	return (
		<div className="preview-card">
			<MaterialImage
				imageUrl={imageUrl}
				colorPalette={colorPalette}
				style={{
					width: '56px',
					height: '56px',
					objectFit: 'contain',
					imageRendering: 'pixelated',
					flexShrink: 0,
					background: 'var(--input-bg)',
					borderRadius: '8px'
				}}
			/>
			<div style={{ minWidth: 0 }}>
				<h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{headerText}</h3>
				{lines.map((line, index) => (
					<Line key={index} text={line.text} />
				))}
			</div>
		</div>
	)
}

export default CustomComponent
