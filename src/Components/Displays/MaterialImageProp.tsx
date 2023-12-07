import React, { useEffect, useRef, useState } from 'react'

interface MaterialImageProp {
	imageUrl: string
	colorPalette: string[]
	style?: React.CSSProperties
}

const MaterialImage: React.FC<MaterialImageProp> = ({ imageUrl, colorPalette, style }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const [isImageLoaded, setIsImageLoaded] = useState(false)
	const getColorFromString = (pixel: string): { r: number; g: number; b: number; a: number } => {
		let hex = pixel.replace(/^#/, '')

		// Handle shorthand hex format (e.g., #abc)
		if (hex.length === 3) {
			hex = hex
				.split('')
				.map((char) => char.repeat(2))
				.join('')
		}

		// Parse hex to RGB
		const bigint = parseInt(hex, 16)
		const r = (bigint >> 16) & 255
		const g = (bigint >> 8) & 255
		const b = bigint & 255

		// Check if the original hex string had an alpha component
		const hasAlpha = hex.length === 8

		// If there's an alpha component, extract and convert it
		const a = hasAlpha ? parseInt(hex.slice(6, 8), 16) : 255

		return { r, g, b, a }
	}
	const colorPaletteConverted = colorPalette.map(getColorFromString)

	// Function to transform a single RGBA pixel
	function transformPixel(pixel: { r: number; g: number; b: number; a: number }): { r: number; g: number; b: number; a: number } {
		if (pixel.a < 15) {
			return { r: 255, g: 0, b: 0, a: 0 }
		} else {
			const index = (pixel.r / 255) * (colorPalette.length - 1)
			const colorIndex1 = Math.floor(index)
			const colorIndex2 = colorIndex1 + 1

			if (colorIndex2 >= colorPalette.length) {
				// If colorIndex2 is out of bounds, return the last color
				return colorPaletteConverted[colorPalette.length - 1]
			} else {
				const color1 = colorPaletteConverted[colorIndex1]
				const color2 = colorPaletteConverted[colorIndex2]

				const ratio = index - Math.floor(index)
				return interpolateColors(color1, color2, ratio)
			}
		}
	}

	const interpolateColors = (
		colorA: { r: number; g: number; b: number; a: number },
		colorB: { r: number; g: number; b: number; a: number },
		ratio: number
	): { r: number; g: number; b: number; a: number } => {
		const interpolatedColor = {
			r: colorA.r + (colorB.r - colorA.r) * ratio,
			g: colorA.g + (colorB.g - colorA.g) * ratio,
			b: colorA.b + (colorB.b - colorA.b) * ratio,
			a: colorA.a + (colorB.a - colorA.a) * ratio
		}

		return interpolatedColor
	}

	// Function to apply pixel transformation to the entire image data
	function applyPixelTransformation(imageData: ImageData): ImageData {
		const { data } = imageData

		for (let i = 0; i < data.length; i += 4) {
			const pixel = {
				r: data[i],
				g: data[i + 1],
				b: data[i + 2],
				a: data[i + 3]
			}

			const transformedPixel = transformPixel(pixel)

			data[i] = transformedPixel.r
			data[i + 1] = transformedPixel.g
			data[i + 2] = transformedPixel.b
			data[i + 3] = transformedPixel.a
		}

		return imageData
	}

	const recalculateImage = () => {
		console.log('attemtping redraw')
		if (!isImageLoaded) return

		const canvas = canvasRef.current
		if (!canvas) return
		console.log('attemtping redraw')
		const ctx = canvas.getContext('2d')
		if (!ctx) return
		console.log('attemtping redraw')
		const image = new Image()
		image.src = imageUrl

		image.onload = () => {
			// Draw the original image
			ctx.drawImage(image, 0, 0)

			// Get the image data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

			// Apply pixel transformation
			const transformedImageData = applyPixelTransformation(imageData)

			// Put the modified image data back to the canvas
			ctx.putImageData(transformedImageData, 0, 0)
		}
	}

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const image = new Image()
		image.src = imageUrl

		image.onload = () => {
			canvas.width = image.width
			canvas.height = image.height

			// Draw the original image
			ctx.drawImage(image, 0, 0)

			setIsImageLoaded(true)
		}
	}, [imageUrl])

	useEffect(() => {
		recalculateImage()
	}, [colorPalette, isImageLoaded])

	return <canvas ref={canvasRef} style={style} />
}

export default MaterialImage
