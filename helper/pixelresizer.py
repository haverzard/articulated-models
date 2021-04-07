from PIL import Image
import sys

img = Image.open(sys.argv[1])
width, height = img.size
new_img = Image.new('RGBA', (width * 128, height * 128))
for w in range(width):
    for h in range(height):
        pixel = img.getpixel((w, h))
        for bw in range(w*128, w*128+128):
            for bh in range(h*128, h*128+128):
                new_img.putpixel((bw, bh), pixel)

new_img.save(sys.argv[2])