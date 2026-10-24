const PLACEHOLDER_PATTERN = /@(\w+)@/g;

// テンプレートの @area@ を CSS 変数に置き換えて埋め込み、以降は CSS 変数の更新だけで色を変える
const iconTemplate = await fetch("../icon.svg.in").then((res) => res.text());
const iconAreas = new Set(
	[...iconTemplate.matchAll(PLACEHOLDER_PATTERN)].map(([, area]) => area),
);
const iconSvg = iconTemplate.replace(PLACEHOLDER_PATTERN, "var(--$1-color)");
document.querySelectorAll(".preview-icon").forEach((icon) => {
	icon.innerHTML = iconSvg;
});

const colorPickers = document.querySelector(".color-pickers");
const colorPickerTemplate = document.getElementById("color-picker-template");

iconAreas.forEach((area) => {
	const fragment = colorPickerTemplate.content.cloneNode(true);
	const colorPicker = fragment.querySelector("form");
	fragment.querySelector(".color-picker-name").textContent = area;

	const { h, s, l, color: colorOutput } = colorPicker.elements;

	const update = () => {
		const color = `hsl(${h.value} ${s.value}% ${l.value})`;
		document.body.style.setProperty(`--${area}-color`, color);
		colorPicker.style.setProperty("--color", color);
		colorOutput.value = color;
		[h, s, l].forEach((slider) => {
			slider.nextElementSibling.value = slider.value;
		});
	};
	colorPicker.addEventListener("input", update);
	update();

	colorPickers.append(fragment);
});
