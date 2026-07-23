const ToggleButton = ({
	isToggled,
	setIsToggled,
	size = 'sm'
}: {
	isToggled: boolean
	setIsToggled: (value: boolean) => void
	size?: 'sm' | 'lg'
}) => {
	const handleToggle = () => {
		setIsToggled(!isToggled)
	}

	return (
		<div className="toggle-button-shell">
			<div
				className={`toggle-switch ${size === 'lg' ? 'toggle-switch-lg' : ''} ${isToggled ? 'toggled' : ''}`}
				onClick={handleToggle}
			>
				<div className="toggle-knob"></div>
			</div>
		</div>
	)
}

export default ToggleButton
