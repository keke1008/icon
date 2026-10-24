// src/main.py の create_icon_image と同じ 32x32 グリッドで描画する
const ICON_SIZE = 32;
const MID_COLOR = "#101010";
const MID_MARGIN = 5;
const INNER_MARGIN = 8;

const iconColors = { outer: "none", inner: "none" };

const drawSquareCentered = (ctx, margin, color) => {
	ctx.fillStyle = color;
	ctx.fillRect(margin, margin, ICON_SIZE - margin * 2, ICON_SIZE - margin * 2);
};

const drawIcons = () => {
	document.querySelectorAll("canvas.preview-icon").forEach((canvas) => {
		const ctx = canvas.getContext("2d");
		drawSquareCentered(ctx, 0, iconColors.outer);
		drawSquareCentered(ctx, MID_MARGIN, MID_COLOR);
		drawSquareCentered(ctx, INNER_MARGIN, iconColors.inner);
	});
};

const setIconColor = (iconArea, color) => {
	iconColors[iconArea] = color;
	document.body.style.setProperty(`--${iconArea}-color`, color);
	drawIcons();
};

const colorPickers = document.querySelectorAll("form.color-picker");
colorPickers.forEach((colorPicker) => {
	const { h, s, l, color: colorOutput } = colorPicker.elements;
	const sliders = colorPicker.querySelectorAll(".color-slider");

	const update = () => {
		const color = `hsl(${h.value} ${s.value}% ${l.value})`;
		setIconColor(colorPicker.dataset.iconArea, color);
		colorOutput.value = color;
		sliders.forEach((slider) => {
			slider.nextElementSibling.value = slider.value;
		});
	};
	colorPicker.addEventListener("input", update);
	update();
});
