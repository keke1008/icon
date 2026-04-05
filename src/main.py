#!/usr/bin/env python

import math
import sys
from dataclasses import dataclass

from PIL import Image, ImageDraw

type Color = str | tuple[int, int, int, int]


@dataclass(frozen=True)
class IconColor:
    outer: Color
    inner: Color


COLORS = {
    "green": IconColor(outer="#44B575", inner="#60FFA5"),
    "red": IconColor(outer="#BB3232", inner="#FF5656"),
    "blue": IconColor(outer="#0076FF", inner="#00BFFF"),
}


def draw_square_centered(
    image_draw: ImageDraw.ImageDraw,
    image_size: int,
    margin_width: int,
    fill_color: Color,
):
    top_left = margin_width
    bottom_right = image_size - 1 - margin_width
    image_draw.rectangle(
        xy=((top_left, top_left), (bottom_right, bottom_right)),
        fill=fill_color,
    )


def create_icon_image(size: int, color: IconColor) -> Image.Image:
    assert math.log2(size).is_integer()
    assert size >= 32

    image = Image.new("RGBA", (size, size), color.outer)
    draw = ImageDraw.Draw(image)
    scale = size // 32

    draw_square_centered(
        image_draw=draw,
        image_size=size,
        margin_width=5 * scale,
        fill_color=(0, 0, 0, 0),
    )

    draw_square_centered(
        image_draw=draw,
        image_size=size,
        margin_width=8 * scale,
        fill_color=color.inner,
    )

    return image


def main():
    assert len(sys.argv) == 2
    output_dir = sys.argv[1]
    icon_size = 256

    for name, color in COLORS.items():
        icon = create_icon_image(size=icon_size, color=color)
        icon.save(f"{output_dir}/icon-{name}-{icon_size}.png")


if __name__ == "__main__":
    main()
