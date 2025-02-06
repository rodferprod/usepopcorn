import { useState } from "react";
import PropTypes from "prop-types";

/*
    Placing CSS objects outside of the component we prevent
    it to re-render each time we change the component state.
    But, for the styles that we'll make dynamic changes we
    need to keep it inside the component of course.
*/
const containerStyle = {
	display: "flex",
	alignItems: "center",
	gap: "16px",
};

const starContainerStyle = {
	display: "flex",
};

/*  The Star functionality will handle three different events:
        onclick;
        onMouseOver; and
        onMouseOut.
    The initial state of the Stars will be empty.
    When we click or hover on it we'll set full stars from the start
    until the star we're clicking or hovering.
    When we leave the mouse out of it the stars will be empty again
    and just will be filled from the click event.
    The prop fullStar will be a boolean value.
        If it's true we'll render the filled star;
        If it's false we'll render the empty star.
    A full star will be settled through onClick and onMouseOver events.
    The click event will stablish the permanent filled stars.
    The onMouseHover event will stablish filled stars just temporarelly.
    So, we'll need two different states to handle with the filled star.
 */
function Star({
	color,
	size,
	fullStar,
	handleClick,
	handleOnHoverIn,
	handleOnHoverOut,
}) {
	const starStyle = {
		width: `${size}px`,
		height: `${size}px`,
		display: "inline-block",
		cursor: "pointer",
	};

	return (
		<span
			role="button"
			style={starStyle}
			onClick={handleClick}
			onMouseOver={handleOnHoverIn}
			onMouseOut={handleOnHoverOut}
		>
			{fullStar ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill={color}
					stroke={color}
				>
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
				</svg>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke={color}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="{2}"
						d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
					/>
				</svg>
			)}
		</span>
	);
}

/*  With the PropTypes package (included on the project when using create-react-app)
    we'll define all the types of the props we're using in this component to make it
    reusable for everyone and to ensure that the values passed throught it will work
    as espected. If another developer try to use it passing wrong types values this
    package will print error messages to guide the corrections.
    
    OBS: Pay attention when setting it up on the component using .propTypes instead PropTypes.
    
    Tip: To make a prop value to be required we just need to include .isRequired
    at the end of a definition:
    Ex.: maxRating: PropTypes.number.isRequired
 */
StarRating.propTypes = {
	maxRating: PropTypes.number.isRequired,
	defaultRating: PropTypes.number,
	size: PropTypes.number,
	color: PropTypes.string,
	className: PropTypes.string,
	messages: PropTypes.array,
	onSetRating: PropTypes.func,
};

export default function StarRating({
	maxRating = 5,
	color = "#fcc419",
	size = 48,
	className = "",
	messages = [],
	defaultRating = 0,
	onSetRating,
}) {
	// Setting default value for maxRating prop
	const [rating, setRating] = useState(defaultRating);
	const [tempRating, setTempRating] = useState(rating);

	const textStyle = {
		lineHeight: "1",
		margin: "0",
		color: color,
		fontSize: size,
	};

	function handleSetRating(rating) {
		setRating(rating);
		onSetRating && onSetRating(rating);
	}

	return (
		<div style={containerStyle} className={className}>
			<div style={starContainerStyle}>
				{/* Creating an array of elements with Array.from() method:
                    Param1: An object informing the length property of the array
                    Param2: A map function that will interate throught the informed length
                    It'll create our stars dynamicaly.
                */}
				{Array.from({ length: maxRating }, (elem, index) => (
					<Star
						key={index}
						color={color}
						size={size}
						fullStar={
							tempRating
								? tempRating >= index + 1
								: rating >= index + 1
						}
						handleClick={() => handleSetRating(index + 1)}
						handleOnHoverIn={() => setTempRating(index + 1)}
						handleOnHoverOut={() => setTempRating(rating)}
					/>
				))}
			</div>
			<p style={textStyle}>
				{messages.length === maxRating
					? messages[tempRating ? tempRating - 1 : rating - 1]
					: tempRating || rating || ""}
			</p>
		</div>
	);
}
