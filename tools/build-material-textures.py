"""Build small, seamless equipment textures using only the Python standard library.

The transparent PNGs are decoded once by the browser, including catalog previews.
No per-device noise filters, image downloads, or animation frames are needed.
"""

from pathlib import Path
import math
import random
import struct
import zlib


DESTINATION = Path(__file__).resolve().parents[1] / "assets" / "textures"


def write_texture(name, width, height, sample):
    rng = random.Random(7183)
    rows = bytearray()
    for y in range(height):
        rows.append(0)
        for x in range(width):
            value = sample(x, y, rng)
            tone = 255 if value > 0 else 0
            rows.extend((tone, tone, tone, min(255, round(abs(value)))))

    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))

    image = b"\x89PNG\r\n\x1a\n"
    image += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    image += chunk(b"IDAT", zlib.compress(rows, 9))
    image += chunk(b"IEND", b"")
    (DESTINATION / name).write_bytes(image)
    print(f"{name}: {len(image):,} bytes")


TAU = math.tau
brush_rng = random.Random(276)
brush_rows = [brush_rng.gauss(0, 9) for _ in range(256)]
coat_rng = random.Random(482)
coat_cells = [[coat_rng.gauss(0, 5) for _ in range(64)] for _ in range(64)]


def aluminium(x, y, rng):
    # Long, irregular machining strokes, with fine, non-directional metal grain.
    sweep = .7 + .3 * math.sin(TAU * x / 512 + math.sin(TAU * y / 256))
    return brush_rows[y] * sweep + rng.gauss(0, 3.3)


def coating(x, y, rng):
    # Fine orange-peel relief, without a regular dot pattern or oversized speckles.
    xx, yy = (x % 4) / 4, (y % 4) / 4
    cell_x, cell_y = x // 4, y // 4
    top = coat_cells[cell_y][cell_x] * (1 - xx) + coat_cells[cell_y][(cell_x + 1) % 64] * xx
    bottom = coat_cells[(cell_y + 1) % 64][cell_x] * (1 - xx) + coat_cells[(cell_y + 1) % 64][(cell_x + 1) % 64] * xx
    return top * (1 - yy) + bottom * yy + rng.gauss(0, 5.5)


def walnut(x, y, rng):
    warp = 2.8 * math.sin(TAU * x / 768) + 1.2 * math.sin(TAU * x * 3 / 768 + TAU * y / 256)
    grain = math.sin(TAU * y * 43 / 256 + warp)
    pores = max(0, grain) ** 16
    fibres = math.sin(TAU * y * 97 / 256 + warp * 2)
    growth = math.sin(TAU * y * 7 / 256 + warp * .4)
    return -pores * 38 + fibres * 6 + growth * 10 + rng.gauss(0, 3)


def linen(x, y, rng):
    # Alternating over/under threads, soft fibre highlights, and dark interstices.
    xx, yy = x % 12, y % 12
    vertical = math.sin(math.pi * xx / 12) ** .7
    horizontal = math.sin(math.pi * yy / 12) ** .7
    over = (x // 12 + y // 12) % 2
    thread = vertical if over else horizontal
    crossing = min(vertical, horizontal)
    return (thread - .62) * 72 + (crossing - .5) * 20 + rng.gauss(0, 4)


def leather(x, y, rng):
    cells = math.sin(TAU * x * 17 / 256 + 1.8 * math.sin(TAU * y * 13 / 256))
    cells *= math.cos(TAU * y * 19 / 256 + math.sin(TAU * x * 11 / 256))
    crease = max(0, .18 - abs(cells)) * 110
    return cells * 7 - crease + rng.gauss(0, 4)


if __name__ == "__main__":
    write_texture("machined-aluminium.png", 512, 256, aluminium)
    write_texture("powder-coat.png", 256, 256, coating)
    write_texture("walnut-veneer.png", 768, 256, walnut)
    write_texture("woven-linen.png", 96, 96, linen)
    write_texture("cabinet-leather.png", 256, 256, leather)
