# Race sound effects

Downloaded from the signed-in owner's ElevenLabs Explore library on 2026-09-14. These are AI-generated sound-design assets, not verified recordings of the named vehicles. Used in the game soundtrack, not offered as a stock-audio library.

| Output | Explore sound ID | Description / intended use |
| --- | --- | --- |
| muscle.wav | Brxk873fdeT1hkBcY9t1 | Stable 2500 RPM supercharged V8 texture; processed for the muscle-car family |
| six.wav | hPauJnI87mrF5UolXbXE | Porsche-style flat-six steady cruising texture |
| tire.wav | p1U2Hthf4cZBpi8eM5wR | Continuous asphalt tire squeal |
| road.wav | dbkZYQN8YrnVK5ZQKCdB | Continuous dry-asphalt tire rolling |
| impact.wav | zqzpTsUMU1yaKdnbun4N | Short race-car body contact |
| shift.wav | scLv6jITjneyn6gFXlkf | Quick manual gear engagement |

Library: https://elevenlabs.io/app/sound-effects/explore/category/vehicle
Provider: https://elevenlabs.io/sound-effects
Usage guide: https://elevenlabs.io/docs/eleven-creative/playground/sound-effects

## Supercar replacement — 2026-09-14

The rejected exotic.wav asset has been removed from the public build and playback code. Five supercars now select five distinct new engine clips; McLaren also has a separate idle clip. These remain AI sound designs, not verified original-vehicle recordings.

| Output | ElevenLabs source | Use / limitation |
| --- | --- | --- |
| ferrari458-v2.wav | Generated group 1hC0DH2jh7DEgotX2iTn, variant 4 | 458-inspired naturally aspirated flat-plane V8, steady 3500 RPM prompt |
| ferrari-f40-v2.wav | Explore p6B7RO16IrYqrBhr3C6F | F40 exhaust / in-car description; selected stable window |
| audi-v10-v2.wav | Explore ZAmehVtDSZud3NjXvbkz | Generic constant-RPM sports-car V10, adapted for R8; not an R8 recording |
| lambo-v12-v2.wav | Explore X5wEqA6Xkzf6GBucnWNf | Aventador SVJ-inspired V12 rev; adapted for Veneno, not a Veneno recording |
| mclaren-v12-v2.wav | Generated group BEbb5Wz15s2RbTMPWAyE, variant 4 | F1 LM-inspired naturally aspirated 6.1L V12, steady 3500 RPM prompt |
| mclaren-idle-v2.wav | Explore 5xWLUYllEctDbfEC99OU | McLaren V12 idle description; AI-generated |

Two successful four-second generations used 320 existing member credits in total; no purchase was made. One over-length prompt request failed without charge.

Adaptations: mono downmix, 32 kHz resampling, stable-envelope window selection, sub-bass/DC removal, upper-frequency softening, normalized level and loop crossfades. Five engine banks have independent filtering and combustion harmonics. Middle-RPM samples fade out below their useful range, with synthesized idle support; McLaren blends its separate idle sample. Playback pitch is bounded to reduce extreme stretching. Requested/source RPM values are design references, not measured RPM calibration. Opponents use synthesized voices.

Source/output hashes and exact selected windows: tools/supercar-audio-audit.json. Reproduce with tools/prepare-supercar-audio.mjs and the original WAV files in artifacts/audio-sources. Other six effects are prepared with tools/prepare-race-audio.mjs.
