# 地下狂飙 · Motorsport

A modular browser racing game rebuilt from the original speed.chentaoai.com mobile game.

## Run and build

Node 22+ is recommended. Run `npm ci`, then `npm run dev`. `npm run build` type-checks the new TypeScript systems and produces `dist/`. `npm test` checks physics and race rules. Netlify builds using the checked-in `netlify.toml`.

## Contents

- Responsive three-step menu (car / circuit / setup), one scrolling control panel, persistent start button and a measured WebGL preview viewport. Vehicle and city scenes are explicitly isolated on every transition.
- Three CPU levels: Club / Sport / Expert. Corner-speed planning looks 200 metres ahead; acceleration and braking use the player's performance model without catch-up boosts. A deterministic two-lap benchmark yields approximately 111 / 96 / 87 seconds, not measured human win rates. Car choice and driving skill still affect results.
- Faster low-speed steering and recentring; live sensitivity settings; optional corner braking assistance, with separate assisted/manual best-lap records. Cockpit and bonnet cameras follow per-car body-local anchors, including actual imported steering-wheel position for the 458.

- 13 vehicles: 13 imported GLBs (Ferrari 458 and F40, Porsche 911 Carrera 4S, BMW M4 Competition, Ford GT40 Mark II, Nissan R34, tuned Toyota Supra A80, Audi R8, McLaren F1 LM, Lamborghini Veneno, Dodge Challenger Concept, Mercedes-Benz SLR McLaren and Chevrolet Corvette C7 Stingray). The R34 has an original approximate right-hand-drive cabin; F40 speed/RPM dials are supplemented; the Supra retains its detailed modified interior with articulated steering. Source credits and limitations: `public/models/CREDITS.md`.
- Detailed vehicles load on selection and before a race, with cached requests and a serial decode queue. Six imported bodies have decimated distance variants with hysteresis; player/showroom views retain full detail. This reduces rigid-body geometry at distance, while articulated wheel geometry remains detailed. Physical phone performance still requires device testing.
- Asset reproduction: `node tools/fetch-vehicles.mjs`, `node tools/fetch-classic-vehicles.mjs`, `node tools/prepare-vehicles.mjs`, then `node tools/prepare-vehicle-lods.mjs`. Downloads are verified by SHA-256. The procedural coachwork remains a fallback and is an authored approximation, not manufacturer CAD or a scan.
- Vehicle Atelier: neutral studio lighting, front/rear/side views and wheel close-up, accessible from the garage. `node tools/vehicle-check.mjs` checks all 13 cars and captures front/rear views; the geometry test checks finite vertices, axle spacing, tire contact and polygon budget.
- 12 city environments with distinct facades, structural landmarks, street grids, balconies, cornices, shops, drainage, lamps and vegetation. Photographic HDR skies provide environment reflections; asphalt uses local diffuse/normal/roughness textures. Waterfronts have animated wave normals; mountain regions have terrain and snow lines. **Routes and building placements are artistic approximations, not GIS-derived or surveyed replicas.**
- City Explorer: inspect each city's landmark and skyline from the garage. Architecture uses instanced geometry and cached sky/road resources. Clouds are photographic panoramas, not volumetric simulations. New environment systems are in `src/environment/`; assets are in `public/environment/`. Run `node tools/environment-check.mjs` against the development server to check all 12 city environments.
- One-lap sprint, three-lap race, solo three-lap time trial, eight-lap endurance with fuel, tire wear and an eight-second service stop.
- 120 Hz fixed-step approximate bicycle dynamics, grip-limited steering/braking, tire compounds and temperature, rain grip, adjustable downforce and brake balance, optional ABS/TCS abstractions.
- Keyboard, simultaneous touch controls and standard gamepads; automatic pause on loss of focus. Fuel service: stop below 5 km/h in the first 4.5% of the circuit and hold P or the service button for eight seconds.
- Local best-lap persistence partitioned by track, car, weather and setup; ordered checkpoint validation; resetting invalidates that lap's best-time eligibility.
- Three.js r180, PBR car paint, environment lighting, shadow maps, optional bloom, anti-aliasing, static mesh batching and adaptive resolution.

## Controls

WASD / arrows: throttle, brake and steer. Space: handbrake. C: cycle chase, cockpit and bonnet cameras. Esc: pause. R: reset to track (invalidates the current lap). M: mute. P: endurance service. Gamepad left stick steers, RT accelerates, LT brakes, A applies the handbrake. The pause settings' three sensitivity levels now affect physical steering input.

`node tools/release-check.mjs` covers 320/390-pixel portrait, 844-pixel landscape and desktop menus, preview isolation, all 13 cockpit/bonnet views and a CPU race. `node tools/interaction.mjs` verifies simultaneous touch input and pit service. Set `TEST_URL` to run against a deployed build.

## Layout

`src/main.ts` boots the application; `src/runtime.js` integrates the retained city generator, audio and race presentation. `src/vehicles.js`, `cars.js` and `tracks.js` contain vehicle geometry and content. `src/physics.ts`, `session.ts`, `graphics.ts` and `assets.ts` implement the new subsystems. GLB and Draco resources live under `public/` and are served locally. HTML is only the application entry point; the engine and assets are compiled and deployed separately.

## Scope and limitations

This is a substantial browser-game upgrade, not GT7-level simulation or production. Cabin fidelity varies between the imported models. No licensed GT7 resources, real-time ray tracing, geographic street scan, multiplayer server or force-feedback steering-wheel system is implemented. The bicycle model and ABS/TCS are gameplay approximations. AI has curvature-based braking and overtaking, but still follows the circuit spline; unfinished competitors' result times are estimates marked with `*`.

High quality is intended for hardware-accelerated desktop browsers; choose balanced/low for constrained devices. Tests run in desktop Edge and a mobile-sized viewport; they do not establish performance on physical phones. Modern WebGL 2 and ES2022 are required.

Design reference: https://www.gran-turismo.com/us/products/gt7/ (driving, tuning and weather feedback); https://threejs.org/docs/ (PBR and renderer). Asset credits are in THIRD_PARTY_NOTICES.md and the game interface.

### Remaining six vehicle pass

Nine cars now use imported GLBs: Audi R8 and McLaren F1 LM join the previous seven. The new main models total about 2.42 MB, plus 0.84 MB of optional distance bodies. R8 has an original approximate left-hand-drive cabin; F1 LM retains its source cockpit with static steering/instrument faces. Four cars (Diablo SV, Viper GTS, CLK GTR, Corvette C5) receive original model-specific geometry refinements. They remain artistic approximations, not equivalent to scanned high-fidelity assets.

Reproduce additional assets with the existing source manifest and:

```sh
node tools/fetch-classic-vehicles.mjs
node tools/prepare-vehicles.mjs r8 mcf1
node tools/prepare-vehicle-lods.mjs r8 mcf1
node tools/remaining-six-check.mjs
```

Quality is always high on launch and when selecting a vehicle or track. The external top-right selector can lower it afterward; changing quality does not rebuild a running race. Replacement slots use distinct lap-record identifiers. See tools/vehicle-performance.md for specification sources and gameplay tuning.

Race audio uses separate replacement banks for five supercars, plus the existing six-cylinder and muscle banks, with per-car combustion profiles, shift transients, traction-driven tire scrub, road/wind layers and spatial nearby rivals. Audio is silenced in menus, on pause and when the page is hidden; sample failures retain a synthesized fallback. Source credits: public/audio/CREDITS.md.

### Four geography-based circuits
Shanghai, Monaco, Las Vegas and Miami use local projected GeoJSON routes, normalized to published circuit length. Circuit cards, minimap and simulation share one spline. Venue scenery adds pits, stepped stands, barriers, metre-spaced brake boards and city-specific stadium / tunnel / skyline approximations. Acute corners retain their peak curvature in AI braking. Elevation is still flat and scenery is not surveyed. Sources: public/circuits/CREDITS.md.

Supercar audition: /sound-preview.html shares the exact race audio engine, with idle, middle RPM, high RPM and gradual rev controls. The rejected shared exotic clip is no longer shipped. New sources remain AI designs, not exact OEM recordings.
