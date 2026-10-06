# Assets inbox

Drop raw brand files here; they get optimised into `public/` before use.

- `abu-omar/video/` — Abu Omar video (MP4/MOV, highest quality). It is re-encoded with a
  keyframe on every frame so it scrubs smoothly with the scroll (ffmpeg via Homebrew or `npm i -D ffmpeg-static`), e.g.
  `ffmpeg -i in.mov -vf scale=1920:-2 -c:v libx264 -g 1 -crf 22 -an -movflags +faststart public/videos/abu-omar-v2.mp4`,
  then `abuOmarVideoUrl` in `src/content/site.ts` is set to `/videos/abu-omar-v2.mp4` (use a new file name on each change so browsers drop the cached one).
- `abu-omar/3d/` — GLB model (with animations if available) → `public/models/abu-omar.glb`,
  then set `abuOmarModelUrl`.
- `brand/` — logo (SVG or high-resolution PNG preferred).
- `projects/`, `team/` — screenshots and photos.
