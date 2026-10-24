const PLACEHOLDER_PATTERN = /@(\w+)@/g;
const PREVIEW_SIZES = [16, 24, 32, 48, 64, 128];

const fetchFile = (path, parse) =>
	fetch(path)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`${res.status} ${res.statusText}`);
			}
			return parse(res);
		})
		.catch((error) => {
			alert(`Failed to load ${path}: ${error.message}`);
			throw error;
		});

const [iconTemplate, presetColors] = await Promise.all([
	fetchFile("../icon.svg.in", (res) => res.text()),
	// colors.json が読めなくても、色一覧以外は使えるようにする
	fetchFile("../colors.json", (res) => res.json()).catch(() => ({})),
]);

const areaColorVar = (area) => `--${area}-color`;

// テンプレートの @area@ を CSS 変数に置き換えて埋め込み、以降は CSS 変数の更新だけで色を変える
const iconAreas = new Set(
	[...iconTemplate.matchAll(PLACEHOLDER_PATTERN)].map(([, area]) => area),
);
const iconSvg = iconTemplate.replace(
	PLACEHOLDER_PATTERN,
	(_, area) => `var(${areaColorVar(area)})`,
);

const cloneTemplate = (id) =>
	document.getElementById(id).content.firstElementChild.cloneNode(true);

const iconPairTemplate = document.getElementById("icon-pair-template");
iconPairTemplate.content.querySelectorAll(".preview-icon").forEach((icon) => {
	icon.innerHTML = iconSvg;
});
const createIconPair = () => cloneTemplate("icon-pair-template");

const createCaptionedIconPair = (caption) => {
	const figure = cloneTemplate("captioned-icon-pair-template");
	figure.querySelector("figcaption").textContent = caption;
	figure.prepend(createIconPair());
	return figure;
};

document.querySelectorAll(".preview-background").forEach((background) => {
	background.append(createIconPair());
});

document.querySelectorAll(".size-preview").forEach((sizePreview) => {
	PREVIEW_SIZES.forEach((size) => {
		const item = createCaptionedIconPair(`${size}px`);
		item.style.setProperty("--icon-size", `${size}px`);
		sizePreview.append(item);
	});
});

// colors.json の色はスライダーとは別に、要素ごとに CSS 変数を上書きして表示する
const colorPresets = document.querySelector(".color-presets");
Object.entries(presetColors).forEach(([name, colors]) => {
	const item = createCaptionedIconPair(name);
	Object.entries(colors).forEach(([area, color]) => {
		item.style.setProperty(areaColorVar(area), color);
	});
	colorPresets.append(item);
});

const colorPickers = document.querySelector(".color-pickers");

iconAreas.forEach((area) => {
	const colorPicker = cloneTemplate("color-picker-template");
	colorPicker.querySelector(".color-picker-name").textContent = area;

	const { elements } = colorPicker;
	const sliders = [elements.h, elements.s, elements.l];

	const update = () => {
		const [h, s, l] = sliders.map((slider) => slider.value);
		// colors.json にそのまま貼れるよう、resvg も解釈できるカンマ区切りの書式にする
		const color = `hsl(${h}, ${s}%, ${l}%)`;
		document.body.style.setProperty(areaColorVar(area), color);
		colorPicker.style.setProperty("--color", color);
		elements.color.value = color;
		sliders.forEach((slider) => {
			elements[`${slider.name}-value`].value = slider.value;
		});
	};
	colorPicker.addEventListener("input", update);
	update();

	colorPickers.append(colorPicker);
});
