# Race sound effects

Downloaded from the signed-in owner's ElevenLabs Explore library on 2026-09-14. These are AI-generated sound-design assets, not verified recordings of the named vehicles. Used in the game soundtrack, not offered as a stock-audio library.

| Output | Explore sound ID | Description / intended use |
| --- | --- | --- |
| muscle.wav | Brxk873fdeT1hkBcY9t1 | Stable 2500 RPM supercharged V8 texture; processed for the muscle-car family |
| exotic.wav | q6EBOpBnBkQa7GOtQTVy | Steady high-RPM exotic racing engine |
| six.wav | hPauJnI87mrF5UolXbXE | Porsche-style flat-six steady cruising texture |
| tire.wav | p1U2Hthf4cZBpi8eM5wR | Continuous asphalt tire squeal |
| road.wav | dbkZYQN8YrnVK5ZQKCdB | Continuous dry-asphalt tire rolling |
| impact.wav | zqzpTsUMU1yaKdnbun4N | Short race-car body contact |
| shift.wav | scLv6jITjneyn6gFXlkf | Quick manual gear engagement |

Library: https://elevenlabs.io/app/sound-effects/explore/category/vehicle
Provider: https://elevenlabs.io/sound-effects
Usage guide: https://elevenlabs.io/docs/eleven-creative/playground/sound-effects

Adaptations: mono downmix, 32 kHz band-limited resampling, DC removal, level normalization, loop crossfades and transient trimming. Playback rate, filters and gain follow gameplay. Three library engine textures are combined with thirteen cylinder-count/redline/timbre profiles; this does not provide thirteen exact vehicle recordings. Opponent engine tones, wind and wet-surface texture are synthesized. Reproduction: tools/prepare-race-audio.mjs with the original WAV files in artifacts/audio-sources. No API credential or account data is included.
