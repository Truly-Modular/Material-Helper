const ToggleButton = ({
	isToggled,
	setIsToggled,
}: {
	isToggled: boolean
	setIsToggled: (value: boolean) => void
}) => {
	const handleToggle = () => {
		setIsToggled(!isToggled)
	}

	return (
		<div className="App">
			<div className={`toggle-switch ${isToggled ? "toggled" : ""}`} onClick={handleToggle}>
				<div className="toggle-knob"></div>
			</div>
		</div>
	)
}

export default ToggleButton
