# Nexus Logo Master Pack

Source artwork: 1254 × 1254 px RGB image.

## Contents
- `original/` — original master image.
- `png/black-background/` — PNG exports at 20 sizes (16–4096 px).
- `png/transparent-background/` — approximate background-removed PNGs at the same sizes. Inspect edges before production use.
- `jpg/` — high-quality JPEG.
- `webp/` — lossless and high-quality WebP.
- `tiff/` — LZW-compressed TIFF tagged at 300 DPI.
- `bmp/` — BMP.
- `ico/` — multi-resolution favicon ICO.
- `svg/` — SVG wrapper embedding the original raster to preserve its appearance.
- `pdf/print-sizes/` — square PDFs with physical page sizes of 1, 2, 3, 4, 6, 8, 10 and 12 inches.
- `preview/` — quick preview.

## Important vector detail
The SVG and PDFs preserve the raster artwork; they are not fully path-traced vector artwork. The source contains glossy gradients, glow and shading. A true vector redraw would need to recreate those details as vector shapes and may not be pixel-identical. Exports above 1254 px are upscaled and do not add source detail.

## Next.js
Use the original PNG in `public/brand/nexus-master-original.png` and display it with:
```tsx
<img src="/brand/nexus-master-original.png" alt="Nexus" width={512} height={512} />
```
