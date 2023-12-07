import React, { useEffect, useState } from 'react'

interface ImageColorizerProps {
	imageUrl: string
	colorPalette: string[]
}

const ImageColorizer: React.FC<ImageColorizerProps> = ({ imageUrl, colorPalette }) => {
	const [colorizedPixels, setColorizedPixels] = useState<string[][]>([])
	let width = 100

	useEffect(() => {
		const colorizeImage = async () => {
			const originalRedValues = await getImageRedValues(imageUrl)
			const colorized = originalRedValues.map((redValue) => recolorPixel(redValue))
			setColorizedPixels(colorized)
		}

		colorizeImage()
	}, [imageUrl, colorPalette])

	const getImageRedValues = async (imageUrl: string): Promise<number[]> => {
		return new Promise((resolve) => {
			const img = new Image()
			img.src = imageUrl
			img.onload = () => {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				if (ctx) {
					canvas.width = img.width
					width = img.width
					canvas.height = img.height
					ctx.drawImage(img, 0, 0, img.width, img.height)
					const imageData = ctx.getImageData(0, 0, img.width, img.height).data

					const redValues: number[] = []

					for (let i = 0; i < imageData.length; i += 4) {
						const r = imageData[i]
						const a = imageData[i]
						redValues.push(r)
					}

					resolve(redValues)
				}
			}
		})
	}

	const recolorPixel = (redValue: number): string[] => {
		const index = (redValue / 255) * (colorPalette.length - 1)
		const colorIndex1 = Math.floor(index)
		const colorIndex2 = colorIndex1 + 1

		if (colorIndex2 >= colorPalette.length) {
			// If colorIndex2 is out of bounds, return the last color
			return [colorPalette[colorPalette.length - 1]]
		}

		const color1 = colorPalette[colorIndex1]
		const color2 = colorPalette[colorIndex2]

		const ratio = index - Math.floor(index)

		// Interpolate between color1 and color2
		const interpolatedColor = interpolateColors(color1, color2, ratio)

		return [interpolatedColor]
	}

	// Function to interpolate between two colors
	const interpolateColors = (color1: string, color2: string, ratio: number): string => {
		const hex = (c: number) => {
			const hex = c.toString(16)
			return hex.length === 1 ? '0' + hex : hex
		}

		const r1 = parseInt(color1.slice(1, 3), 16)
		const g1 = parseInt(color1.slice(3, 5), 16)
		const b1 = parseInt(color1.slice(5, 7), 16)

		const r2 = parseInt(color2.slice(1, 3), 16)
		const g2 = parseInt(color2.slice(3, 5), 16)
		const b2 = parseInt(color2.slice(5, 7), 16)

		const r = Math.floor(r1 + (r2 - r1) * ratio)
		const g = Math.floor(g1 + (g2 - g1) * ratio)
		const b = Math.floor(b1 + (b2 - b1) * ratio)

		return `#${hex(r)}${hex(g)}${hex(b)}`
	}

	return (
		<div style={{ display: 'grid', gridTemplateColumns: `repeat(${width}, 1px)`, gap: '0' }}>
			{colorizedPixels.map((pixelColor, index) => (
				<span
					key={index}
					style={{
						width: '1px',
						height: '1px',
						backgroundColor: pixelColor[0],
						display: 'inline-block'
					}}
				/>
			))}
		</div>
	)
}

export default ImageColorizer
