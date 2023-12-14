import React, { useState, useEffect } from 'react'
import SingleSlider from './SingleSlider'
import IntegerSliderEntry from './IntegerSliderEntry'
import HighLimitSliderEntry from './HighLimitSliderEntry'

interface SliderEntryProps {
	onSubmit: (sliderValues: Record<string, number>) => void
}

const SliderEntry: React.FC<SliderEntryProps> = ({ onSubmit }) => {
	const [sliderValues, setSliderValues] = useState({
		hardness: 6,
		density: 2,
		flexibility: 3,
		durability: 256,
		mining_level: 2,
		mining_speed: 5
	})

	const handleSliderChange = (sliderName: string, newValue: number) => {
		setSliderValues((prevValues) => ({
			...prevValues,
			[sliderName]: newValue
		}))
	}

	useEffect(() => {
		handleEntrySubmit()
	}, [sliderValues])

	const handleEntrySubmit = () => {
		onSubmit(sliderValues)
	}

	return (
		<div
			className="entry"
			style={{
				position: 'relative',
				backgroundColor: 'var(--discord-gray-2)',
				borderRadius: '8px',
				padding: '10px',
				color: 'var(--discord-white)'
			}}
		>
			<SingleSlider label="Hardness" value={sliderValues.hardness} onChange={(value) => handleSliderChange('hardness', value)} />
			<SingleSlider label="Density" value={sliderValues.density} onChange={(value) => handleSliderChange('density', value)} />
			<SingleSlider label="Flexibility" value={sliderValues.flexibility} onChange={(value) => handleSliderChange('flexibility', value)} />
			<HighLimitSliderEntry label="Durability" value={sliderValues.durability} onChange={(value) => handleSliderChange('durability', value)} />
			<IntegerSliderEntry label="Mining Level" value={sliderValues.mining_level} onChange={(value) => handleSliderChange('mining_level', value)} />
			<SingleSlider label="Mining Speed" value={sliderValues.mining_speed} onChange={(value) => handleSliderChange('mining_speed', value)} />
		</div>
	)
}

export default SliderEntry
