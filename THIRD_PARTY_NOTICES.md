# Asset and library credits

Vehicle coachwork in `src/automotive/` is original programmatic geometry. Shape parameters are artistic modelling targets, not manufacturer CAD or certified specifications. Public visual references include Porsche's 993 Turbo model archive (https://www.porsche.com/usa/accessoriesandservice/classic/models/993/993-turbo/), Ferrari's F40 archive (https://www.ferrari.com/en-EN/auto/f40), Nissan Heritage (https://www.nissan-global.com/EN/HERITAGE_COLLECTION/skyline.html), and BMW's M3 GTR presentation (https://www.press.bmwgroup.com/usa/article/detail/T0229402EN_US/2001-bmw-m3-gtr-race-and-road-cars-to-be-presented-at-legends-of-the-autobahn-concours-d%E2%80%99elegance?language=en_US). Four selected vehicles use original, approximate coachwork with additional model-specific details. Nine selected vehicles use imported GLBs. Additional Porsche, BMW, Ford, Ferrari F40, Nissan R34, Toyota Supra, Audi R8 and McLaren F1 LM model credits, licenses and modifications are listed in public/models/CREDITS.md (published at /models/CREDITS.md).

Environment photography and PBR textures: **Poly Haven**, CC0, bundled locally at 2K HDR / 1K texture resolution. Sources: https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky (day), https://polyhaven.com/a/kloppenheim_06_puresky (sunset/night lighting), https://polyhaven.com/a/overcast_soil_puresky (rain/overcast), https://polyhaven.com/a/asphalt_02 (diffuse, OpenGL normal, roughness). License: https://polyhaven.com/license . Night appearance adapts the sunset panorama. Clouds are captured HDR panoramas, not volumetric simulations.

City architecture, structural landmarks, vegetation and terrain are original procedural geometry in src/environment. Buildings and road layouts are artistic approximations, not surveyed replicas. Landmark references include https://www.toureiffel.paris/fr/le-monument/chiffres-cle , https://en.tokyotower.co.jp/plan/towerpedia/ and https://www.visitdubai.com/en/places-to-visit/burj-khalifa .

The original game was retrieved from https://speed.chentaoai.com/ at the owner's request for this rebuild. Its procedural car profiles and city generator are retained and modified.

Ferrari 458 Italia model: **vicent091036**, distributed by the Three.js project in its car-materials example. Source model attribution: https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6 . Distribution source: https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/ferrari.glb . Example and attribution: https://threejs.org/examples/webgl_materials_car.html . Original model author credit is preserved in the game. Modifications: materials, dimensions, orientation, wheel pivots and integration with the driving model. The original Sketchfab page was unavailable during this rebuild; this document does not assert a separate model license beyond the upstream distribution.

Three.js: Copyright 2010–2025 Three.js Authors, MIT license; see https://github.com/mrdoob/three.js/blob/dev/LICENSE .

Draco decoder: Google, Apache License 2.0. Bundled from Three.js examples/jsm/libs/draco/gltf. See https://github.com/google/draco/blob/main/LICENSE . No encoder is required at runtime.

Vehicle and city names identify the represented subjects. This project is not affiliated with Ferrari, Polyphony Digital, Sony or Gran Turismo. No GT7 code, models, textures, audio or other game assets are included.

## Four brand replacements

### veneno-detailed.glb — Lamborghini venevo

Credit: Jonrss (https://sketchfab.com/huy14320000006).
Source: https://sketchfab.com/3d-models/lamborghini-venevo-5884f95259ff411c95510cdde5ede33e
License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ (embedded source metadata).
Distribution and resource hashes: tools/classic-vehicle-sources.json.
Modifications: dimensions, wheel/caliper separation, material calibration, Draco/WebP compression and distance body variant.

### slr-detailed.glb — Mercedes-Benz SLR McLaren

Credit: Car2022 (https://sketchfab.com/Car2022).
Source: https://sketchfab.com/3d-models/mercedes-benz-slr-mclaren-4eb0a08f2c0c4c64b1a3299d5e3954ee
License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ (embedded source metadata).
Distribution and resource hashes: tools/classic-vehicle-sources.json.
Modifications: dimensions, wheel/caliper separation, material calibration, Draco/WebP compression and distance body variant.

### challenger-detailed.glb — Dodge CHALLENGER

Credit: Gesy (https://sketchfab.com/mrgesy).
Source: https://sketchfab.com/3d-models/dodge-challenger-2c1f18d2f0214cb7a746fc5dd2baeebe
License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ (embedded source metadata).
Distribution and resource hashes: tools/classic-vehicle-sources.json.
Modifications: dimensions, wheel/caliper separation, material calibration, Draco/WebP compression and distance body variant.

### c7-detailed.glb — Chevrolet Corvette (C7)

Credit: Martin Trafas (https://sketchfab.com/Bexxie).
Source: https://sketchfab.com/3d-models/chevrolet-corvette-c7-2b509d1bce104224b147c81757f6f43a
License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ (embedded source metadata).
Distribution and resource hashes: tools/classic-vehicle-sources.json.
Modifications: dimensions, wheel/caliper separation, material calibration, Draco/WebP compression and distance body variant.

Challenger is a customized 2006 Concept model with an exposed intake; its source carries NoAI. Used only for ordinary rendering and mechanical geometry processing. Veneno and SLR retain source interiors; Challenger and C7 interiors are less detailed than their exteriors. Source instrument faces and steering wheels are static; the HUD provides live telemetry. These are artist models, not manufacturer CAD or scans.

Race sound effects: ElevenLabs Explore library. Current source clips, generated groups, IDs and adaptations are documented in public/audio/CREDITS.md. AI sound design, not exact manufacturer recordings. https://elevenlabs.io/sound-effects

## Circuit route data
Four layouts adapted from Tomislav Bacinger’s MIT-licensed f1-circuits dataset. See public/circuits/CREDITS.md and LICENSE.md for sources, transformations and full license.
