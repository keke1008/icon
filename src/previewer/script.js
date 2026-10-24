const PLACEHOLDER_PATTERN = /@(\w+)@/g;
const PREVIEW_SIZES = [16, 24, 32, 48, 64, 128];

const iconPairTemplate = document.getElementById("icon-pair-template");
const createIconPair = () => iconPairTemplate.content.cloneNode(true);

document.querySelectorAll(".preview-background").forEach((background) => {
	background.append(createIconPair());
});

document.querySelectorAll(".size-preview").forEach((sizePreview) => {
	PREVIEW_SIZES.forEach((size) => {
		const item = document.createElement("figure");
		item.className = "size-preview-item";
		item.style.setProperty("--icon-size", `${size}px`);

		const caption = document.createElement("figcaption");
		caption.className = "preview-caption";
		caption.textContent = `${size}px`;

		item.append(createIconPair(), caption);
		sizePreview.append(item);
	});
});

// テンプレートの @area@ を CSS 変数に置き換えて埋め込み、以降は CSS 変数の更新だけで色を変える
const iconTemplate = await fetch("../icon.svg.in")
	.then((res) => {
		if (!res.ok) {
			throw new Error(`${res.status} ${res.statusText}`);
		}
		return res.text();
	})
	.catch((error) => {
		alert(`Failed to load ../icon.svg.in: ${error.message}`);
		throw error;
	});
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
		// colors.json にそのまま貼れるよう、resvg も解釈できるカンマ区切りの書式にする
		const color = `hsl(${h.value}, ${s.value}%, ${l.value}%)`;
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
