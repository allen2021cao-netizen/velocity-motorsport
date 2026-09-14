# Detailed vehicle models

These files are artistic models, not manufacturer CAD or scans. Vehicle names do not imply endorsement.

## porsche-detailed.glb — Porsche 911 Carrera 4S

Credit: Karol Miklas (https://sketchfab.com/karolmiklas) / Lionsharp Studios.
Source: https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf
Distribution: https://github.com/playcanvas/web-components/tree/main/examples/assets/models
The embedded source metadata identifies Karol Miklas and CC BY-SA 4.0; PlayCanvas's accompanying attribution identifies Lionsharp Studios and CC BY 4.0. We retain both credits and distribute this adapted model under **CC BY-SA 4.0**: https://creativecommons.org/licenses/by-sa/4.0/ .
Modifications: ground removed, dimensions normalized, wheel and caliper assemblies separated, Draco geometry / WebP textures. Runtime changes include materials, neutralized front steering, wheel articulation and an original approximate dashboard supplement. The adapted GLB is publicly downloadable at /models/porsche-detailed.glb. The dashboard is an approximation, not a faithful scan.

## bmw-detailed.glb — BMW M4 Competition M Package

Credit: SRT Performance (𝙎𝙍𝙏 𝙋𝙚𝙧𝙛𝙤𝙢𝙖𝙣𝙘𝙚™).
Source: https://sketchfab.com/3d-models/bmw-m4-competition-m-package-5c0a2dafb1ad408d9fc9eeef9aee531b
Distribution and attribution: https://github.com/lukaizj/car-mod-saas/blob/main/public/models/ATTRIBUTION.md
License: **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/ .
Modifications: normalized dimensions, split wheel/caliper assemblies, Draco geometry, WebP textures, revised glass, paint and interior materials. Original textured instruments are decorative; the game HUD displays live telemetry.

## gt40-detailed.glb — Ford GT40 Mark II

Credit: vecarz (https://sketchfab.com/heynic).
Source: https://sketchfab.com/3d-models/ford-gt40-mark-ii-wwwvecarzcom-16e6376958604b3d83b541ee67f4b4c9
Distribution: https://github.com/Vivekkk-1/3D-Models/blob/main/Cars/ford_gt40.glb
License: **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/ .
Modifications: normalized dimensions, separate articulated wheels, Draco geometry, WebP textures, revised glass and opaque-material sorting, camera anchors. Interior details remain limited by the source model.

Ferrari 458 and library credits: /THIRD_PARTY_NOTICES.md.

## f40-detailed.glb — Ferrari F40

Credit: Black Snow (https://sketchfab.com/BlackSnow02).
Source: https://sketchfab.com/3d-models/ferrari-f40-52a66c41cfcd4f999fb1b1c49bf24d70
Distribution: https://github.com/sceneview/sceneview/blob/main/samples/web-demo/site/models/ferrari_f40.glb
License: **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/ . Source metadata and SceneView's asset catalog retain this credit and license.
Modifications: dimensions, separated wheels/brakes, Draco geometry, WebP textures, glass/paint/leather calibration, original live speed/RPM dial overlays. Source steering geometry is retained; it is not independently animated.

## r34-detailed.glb — Nissan Skyline GT-R R34

Credit: Lexyc16 (https://sketchfab.com/Lexyc16).
Source: https://sketchfab.com/3d-models/nissan-skyline-r34-gt-r-ff8fb2251dfa4bb9979e7022c5a6666c
Distribution: https://github.com/GigaSmurf/DS/tree/master/src/assets/nissan_skyline_r34_gt-r
License: **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/ . The source page also carries a NoAI label; this asset is used for ordinary rendering and mechanical geometry processing, not training or image/model generation.
Modifications: normalized size, separated wheels, Draco geometry, WebP textures, material calibration. The source does not provide a complete cabin: a new original, approximate right-hand-drive interior supplies seats, dashboard, vents, steering and live speed/RPM dials. Auxiliary screen values are illustrative, not a mechanical simulation of oil/water/boost.

## supra-mk4-detailed.glb — Toyota Supra Mk4 A80, tuned bodywork

Credit: Black Snow (https://sketchfab.com/BlackSnow02).
Source: https://sketchfab.com/3d-models/toyota-supra-mk4-8bebdee25b774067929bb33e648533ac
Distribution: https://github.com/raquellopes3/Trabalho-de-A-FRAME/tree/main/toyota_supra_mk4
License: **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/ . License and author are embedded in the distributed glTF metadata.
Modifications: normalized dimensions, split wheels and stationary calipers, articulated original steering wheel, orange paint and dark interior materials, Draco geometry and WebP textures. This source represents modified A80 bodywork and interior, not a factory-stock Supra. Original textured instruments are decorative; the HUD provides live telemetry.

## Distance variants

Each `*-body-lod.glb` is a decimated adaptation of the corresponding detailed asset and uses the same author credit and license. The Porsche adaptation remains CC BY-SA 4.0. Wheels remain articulated high-detail assemblies; rigid bodies switch at distance with hysteresis. Original cabin supplements are only shown at close range. Reproduction scripts and SHA-256 manifests are in `tools/` in the source repository.

## r8-detailed.glb — Audi R8

Credit: IPfuentes (https://sketchfab.com/IPfuentes).
Source: https://sketchfab.com/3d-models/audi-r8-3d-model-d999506c52cf4313aad5220f4af2da6c
Distribution: https://github.com/mohammedz00/VM-Tints-Wraps-3D-Website/tree/main/public/audi_r8_3d_model
License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ (embedded source metadata).
Modifications: normalization, separate wheels, rubber/paint/glass calibration, Draco and WebP, rigid-body LOD. A left-hand-drive cabin is an original approximate supplement derived from our cabin geometry, not an Audi scan. Speed/RPM dials and steering animate.

## mcf1-detailed.glb — McLaren F1 LM

Credit: No Limits (https://sketchfab.com/nolimitsofficial).
Source: https://sketchfab.com/3d-models/mclaren-f1-lm-e8aa53610e5047a98bfca98726e670c0
Distribution: https://github.com/abdullahriaz1/temujin/tree/main/public/3d-assets/mclaren_f1_lm
License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ (source page and embedded metadata).
Modifications: scale, wheel separation, paint/glass/interior materials, Draco and WebP, rigid-body LOD. The LM wing and bodywork are retained and identified in the menu. The original central cockpit is retained; its wheel and instrument faces are static. The HUD supplies live telemetry.

## Original classic details

Legacy fallback geometry for the former Diablo SV, Viper GTS, CLK GTR and Corvette C5 slots uses original approximate geometry, with model-specific vents, lamp housings, seams, cabin details and aero surfaces in src/automotive/classic-detail.ts. These fallback meshes are hidden while their replacement GLBs load. They are not scans. Low-poly candidate downloads were evaluated but are not included in the game.

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
