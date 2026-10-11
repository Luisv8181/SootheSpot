# Water artwork provenance

These two original background images were generated with the built-in image generation tool, reviewed visually, and compressed locally to WebP using the existing Sharp dependency. They ship with the application; viewing a World makes no request to an image service. No user information was included in the prompts. These are authored SootheSpot visuals, not clinician recommendations or cultural representations.

- `ocean-dusk.webp`: 1536 × 1024, 217,176 bytes.
- `quiet-pool.webp`: 1536 × 1024, 300,420 bytes.

## Ocean prompt

Production artwork for SootheSpot Ocean Calm, landscape 1536x1024, image only with no text, UI, borders or logos. Poetic cinematic painted shoreline at dusk, warm apricot to lavender sky, a small pale sun centered at 50% width and 27% height. Distant desaturated mountains at the edges, teal ocean in the lower half, horizon at 43%. Translucent shallow water, soft sand and foam, organic grain, painterly richness with photographic light. Center 60% must work as a portrait crop. No people, buildings, animals, boats, dramatic waves or concentric patterns. An interactive water layer will be added later.

## Pool prompt

Production original artwork for SootheSpot Ripple Field, landscape 1536x1024, image only with no text, UI, borders or logos. Overhead still shallow natural pool at twilight, sea glass teal and midnight green, center with soft sand and light caustics, vague canopy reflections at the edge. Rocks and fern at extreme bottom corners, center 70% open for touch waves. Tactile, uncluttered amber and blue silver, painterly photographic calm. No rings, ripples, waves, flowers, fish or people. Portrait center should stay luminous with a dark vignette.

## Ocean audio

`ocean-shore.mp3` (55 seconds, stereo, 128 kbps, 881,101 bytes) is adapted from **Oceanwavescrushing** by **Luftrum**, recorded at Kalundborg Fjord, Røsnæs, on 16 February 2008. Source: https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg (original Freesound source: https://freesound.org/people/Luftrum/sounds/48412/). License: **Creative Commons Attribution 3.0 Unported**, https://creativecommons.org/licenses/by/3.0/. No endorsement is implied. Credit and license links also appear in the Ocean sound controls.

Changes: used seconds 10–70, applied 70 Hz high-pass / 6500 Hz low-pass filtering and a 0.7 peak limiter, joined the last and first five seconds with a linear crossfade, and encoded to MP3 without source metadata. The resulting local 55-second loop has no abrupt silence at its boundary. Playback is opt-in; gain defaults to 15% of full-scale and can be changed using the volume slider. The file loads only after the sound control is selected.

## Vast Sky

`vast-sky.webp` (1120 × 2240 portrait, 427,296 bytes) is the night-sky photograph behind the Vast Sky world, generated with the built-in image generation tool, visually reviewed, and compressed locally to WebP with Pillow. It ships with the application; viewing the world makes no request to an image service. No user information was included in the prompt. The constellation star-maps, letterforms, and melodies are authored SootheSpot interaction layers drawn on canvas, not part of the photograph.

Prompt: vertical night-sky photograph for a calm interactive experience, 9:16 portrait. Deep indigo sky, dense realistic Milky Way band arcing across the upper two thirds, fine star field down to the corners, very faint warm horizon glow at the bottom edge. Photographic, long-exposure clarity, no moon, no clouds, no landscape silhouette, no text, no watermark. Center 70% must stay open and readable behind glowing foreground elements.

## Soft Focus and Grounding Garden

`focus-clearing.webp` and `garden-path.webp` are original 1536 × 1024 images generated with the built-in image-generation tool, visually reviewed and compressed locally to WebP. No user data was included. The focus light and sensory trail are separate, authored UI layers. Full prompts and provenance are recorded in [Atmosphere artwork notes](../../docs/superpowers/specs/2026-10-09-atmosphere-artwork.md).

## Quiet Rain

`quiet-rain.webp` and `quiet-rain-portrait.webp` are original landscape/portrait artwork generated with the built-in image-generation tool, reviewed and encoded locally to WebP. Full prompts and transformations are recorded in [Quiet Rain artwork notes](../../docs/plans/2026-10-11-quiet-rain-artwork.md). The drop refraction and condensation clearing are authored Canvas layers. Rain audio is locally synthesized filtered noise, not a recording. No personal information, runtime image service, audio download, microphone or interaction persistence is involved.
