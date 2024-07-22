import React, { useState } from "react"
import CustomComponent from "./DisplayComponent"
import "../.././App.css"

interface StatBox {
	sliderValues: AppSliderState
	colorPalette: string[]
	translation: string
}

interface AppSliderState {
	hardness: number
	density: number
	flexibility: number
	durability: number
	mining_speed: number
	mining_level: number
}

const StatBoxComponent: React.FC<StatBox> = ({ sliderValues, colorPalette, translation }) => {
	const [localSliderValues, setLocalSliderValues] = useState<AppSliderState>(sliderValues)

	const handleSliderChange = (sliderName: keyof AppSliderState, newValue: number) => {
		setLocalSliderValues((prevValues) => ({ ...prevValues, [sliderName]: newValue }))
	}

	function customPower(x: number, exp: number): number {
		// Handle negative values separately
		if (x < 0) {
			// Check if the exponent is a rational number with an odd numerator
			if (exp % 2 !== 0) {
				return -Math.pow(-x, exp)
			} else {
				// If the exponent is even, the result is not a real number
				return NaN
			}
		} else {
			// For non-negative values, use Math.pow directly
			return Math.pow(x, exp)
		}
	}

	function customDivide(numerator: number, denominator: number): number {
		// Check if the denominator is zero
		if (denominator === 0) {
			return 0
		}

		// Perform the division
		return numerator / denominator
	}

	const result =
		Math.floor(customPower((sliderValues.hardness - 3.4) * 2.3, 1 / 3)) +
		7 -
		Math.floor(sliderValues.density / 4) * 2

	return (
		<div id="display">
			<div style={{ display: "flex", gap: "20px" }}>
				<div id="display-list" style={{ flex: 1 }}>
					<CustomComponent
						imageProps={{
							imageUrl: process.env.PUBLIC_URL + "/images/sword.png",
							colorPalette: colorPalette,
						}}
						headerText={translation + "Sword"}
						lines={[
							{ text: "Attack Damage : " + (sliderValues.hardness + 1).toFixed(2) },
							{ text: "Attack Speed  : 1.6" },
						]}
					/>
					<CustomComponent
						imageProps={{
							imageUrl: process.env.PUBLIC_URL + "/images/axe.png",
							colorPalette: colorPalette,
						}}
						headerText={translation + "Axe"}
						lines={[
							{
								text:
									"Attack Damage : " +
									(
										Math.floor(customPower((sliderValues.hardness - 3.4) * 2.3, 1 / 3)) +
										7 -
										Math.floor(sliderValues.density / 4) * 2
									).toFixed(2),
							},
							{
								text:
									"Attack Speed  : " +
									(
										Math.ceil(customPower(sliderValues.mining_speed - 6, 0.2) - 0.5 + 10) / 10 -
										0.1
									).toFixed(2),
							},
							{ text: "Mining Speed  : " + sliderValues.mining_speed },
						]}
					/>
				</div>
				<div id="display-list" style={{ flex: 2 }}>
					<CustomComponent
						imageProps={{
							imageUrl: process.env.PUBLIC_URL + "/images/helmet.png",
							colorPalette: colorPalette,
						}}
						headerText={translation + "Helmet"}
						lines={[
							{
								text: "Armor                : " + Math.floor(sliderValues.hardness / 2).toFixed(2),
							},
							{
								text:
									"Armor Tougness         : " +
									(sliderValues.mining_level === 2
										? 0
										: ((sliderValues.mining_level - 2) /
												Math.abs(sliderValues.mining_level - 2) /
												2 +
												0.5) *
										  (sliderValues.mining_level - 1)
									).toFixed(2),
							},
							{
								text:
									"Knockback Ressistance  : " +
									(sliderValues.mining_level === 3
										? 0
										: ((sliderValues.mining_level - 3) /
												Math.abs(sliderValues.mining_level - 3) /
												2 +
												0.5) *
										  (sliderValues.mining_level - 3)
									).toFixed(2),
							},
						]}
					/>
					<CustomComponent
						imageProps={{
							imageUrl: process.env.PUBLIC_URL + "/images/chestplate.png",
							colorPalette: colorPalette,
						}}
						headerText={translation + "Chestplate"}
						lines={[
							{
								text:
									"Armor                : " +
									(sliderValues.hardness + 2 - Math.ceil(sliderValues.flexibility / 4)).toFixed(2),
							},
							{
								text:
									"Armor Tougness         : " +
									(sliderValues.mining_level === 2
										? 0
										: ((sliderValues.mining_level - 2) /
												Math.abs(sliderValues.mining_level - 2) /
												2 +
												0.5) *
										  (sliderValues.mining_level - 1)
									).toFixed(2),
							},
							{
								text:
									"Knockback Ressistance  : " +
									(sliderValues.mining_level === 3
										? 0
										: ((sliderValues.mining_level - 3) /
												Math.abs(sliderValues.mining_level - 3) /
												2 +
												0.5) *
										  (sliderValues.mining_level - 3)
									).toFixed(2),
							},
						]}
					/>
					<CustomComponent
						imageProps={{
							imageUrl: process.env.PUBLIC_URL + "/images/leggings.png",
							colorPalette: colorPalette,
						}}
						headerText={translation + "Leggings"}
						lines={[
							{
								text:
									"Armor                : " +
									(
										((sliderValues.hardness -
											Math.ceil(sliderValues.hardness / 6.5) +
											Math.ceil(sliderValues.hardness / 4.5) -
											1) /
											7) *
										7
									).toFixed(2),
							},
							{
								text:
									"Armor Tougness         : " +
									(sliderValues.mining_level === 2
										? 0
										: ((sliderValues.mining_level - 2) /
												Math.abs(sliderValues.mining_level - 2) /
												2 +
												0.5) *
										  (sliderValues.mining_level - 1)
									).toFixed(2),
							},
							{
								text:
									"Knockback Ressistance  : " +
									(sliderValues.mining_level === 3
										? 0
										: ((sliderValues.mining_level - 3) /
												Math.abs(sliderValues.mining_level - 3) /
												2 +
												0.5) *
										  (sliderValues.mining_level - 3)
									).toFixed(2),
							},
						]}
					/>
					<CustomComponent
						imageProps={{
							imageUrl: process.env.PUBLIC_URL + "/images/boots.png",
							colorPalette: colorPalette,
						}}
						headerText={translation + "Boots"}
						lines={[
							{
								text:
									"Armor                : " +
									Math.floor(
										sliderValues.hardness / 2 - Math.floor(sliderValues.density / 4)
									).toFixed(2),
							},
							{
								text:
									"Armor Tougness         : " +
									(sliderValues.mining_level === 2
										? 0
										: ((sliderValues.mining_level - 2) /
												Math.abs(sliderValues.mining_level - 2) /
												2 +
												0.5) *
										  (sliderValues.mining_level - 1)
									).toFixed(2),
							},
							{
								text:
									"Knockback Ressistance  : " +
									(sliderValues.mining_level === 3
										? 0
										: ((sliderValues.mining_level - 3) /
												Math.abs(sliderValues.mining_level - 3) /
												2 +
												0.5) *
										  (sliderValues.mining_level - 3)
									).toFixed(2),
							},
						]}
					/>
				</div>
			</div>
		</div>
	)
}

export default StatBoxComponent
