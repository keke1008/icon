#!/usr/bin/env python

from math import log2
from typing import TypeAlias
from PIL import Image, ImageDraw

Color: TypeAlias = tuple[int, int, int] | tuple[int, int, int, int]


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


def create_icon_image(size: int, inner: Color, outer: Color) -> Image.Image:
    exp2 = log2(size)
    assert exp2.is_integer()
    assert exp2 >= log2(32)

    image = Image.new("RGBA", (size, size), outer)
    draw = ImageDraw.Draw(image)
    scale = int(size / 32)

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
        fill_color=inner,
    )

    return image


def main():
    for size in [32, 64, 128, 256]:
        icon_image = create_icon_image(
            size=size,
            inner=(96, 255, 165),
            outer=(68, 181, 117),
        )
        for ext in ["ico", "png"]:
            icon_image.save(f"dest/icon-{size}.{ext}", sizes=[(size, size)])

    print("Done")


if __name__ == "__main__":
    main()
