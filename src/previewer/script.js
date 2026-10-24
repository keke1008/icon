// src/main.py の create_icon_image と同じ 32x32 グリッドで描画する
const ICON_SIZE = 32;
const MID_COLOR = "#101010";
const MID_MARGIN = 5;
const INNER_MARGIN = 8;

const ICON_AREAS = [
	{ area: "outer", name: "Outer" },
	{ area: "inner", name: "Inner" },
];

const iconColors = {};
const iconContexts = [...document.querySelectorAll("canvas.preview-icon")].map(
	(canvas) => canvas.getContext("2d"),
);

const drawSquareCentered = (ctx, margin, color) => {
	ctx.fillStyle = color;
	ctx.fillRect(margin, margin, ICON_SIZE - margin * 2, ICON_SIZE - margin * 2);
};

const drawIcons = () => {
	iconContexts.forEach((ctx) => {
		drawSquareCentered(ctx, 0, iconColors.outer);
		drawSquareCentered(ctx, MID_MARGIN, MID_COLOR);
		drawSquareCentered(ctx, INNER_MARGIN, iconColors.inner);
	});
};

const colorPickers = document.querySelector(".color-pickers");
const colorPickerTemplate = document.getElementById("color-picker-template");

ICON_AREAS.forEach(({ area, name }) => {
	const fragment = colorPickerTemplate.content.cloneNode(true);
	const colorPicker = fragment.querySelector("form");
	fragment.querySelector(".color-picker-name").textContent = name;

	const { h, s, l, color: colorOutput } = colorPicker.elements;

	const update = () => {
		const color = `hsl(${h.value} ${s.value}% ${l.value})`;
		iconColors[area] = color;
		colorPicker.style.setProperty("--color", color);
		colorOutput.value = color;
		[h, s, l].forEach((slider) => {
			slider.nextElementSibling.value = slider.value;
		});
	};
	colorPicker.addEventListener("input", () => {
		update();
		drawIcons();
	});
	update();

	colorPickers.append(fragment);
});
drawIcons();
