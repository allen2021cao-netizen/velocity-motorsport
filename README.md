# 地下狂飙 · Motorsport

A modular browser racing game rebuilt from the original speed.chentaoai.com mobile game.

## Run and build

Node 22+ is recommended. Run `npm ci`, then `npm run dev`. `npm run build` type-checks the new TypeScript systems and produces `dist/`. `npm test` checks physics and race rules. Netlify builds using the checked-in `netlify.toml`.

## Contents

- Responsive three-step menu (car / circuit / setup), one scrolling control panel, persistent start button and a measured WebGL preview viewport. Vehicle and city scenes are explicitly isolated on every transition.
- Three CPU levels: Club / Sport / Expert. Corner-speed planning looks 200 metres ahead; acceleration and braking use the player's performance model without catch-up boosts. A deterministic two-lap benchmark yields approximately 111 / 96 / 87 seconds, not measured human win rates. Car choice and driving skill still affect results.
- Faster low-speed steering and recentring; live sensitivity settings; optional corner braking assistance, with separate assisted/manual best-lap records. Cockpit and bonnet cameras follow per-car body-local anchors, including actual imported steering-wheel position for the 458.

- 13 vehicles: 12 individually parameterized coachwork models with continuous body surfaces, open wheel arches, separate roof/glazing, seats/instruments/steering, model-specific lighting/aero and independently rotating wheels with stationary calipers; plus a Draco-compressed Ferrari 458 GLB. `src/automotive/` replaces the previous side-profile extrusion at runtime. The twelve generated vehicles are authored approximations, not manufacturer CAD or scanned replicas.
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

This is a substantial browser-game upgrade, not GT7-level simulation or production. Original procedural vehicles remain lower-detail than the featured GLB. No licensed GT7 resources, real-time ray tracing, geographic street scan, multiplayer server or force-feedback steering-wheel system is implemented. The bicycle model and ABS/TCS are gameplay approximations. AI has curvature-based braking and overtaking, but still follows the circuit spline; unfinished competitors' result times are estimates marked with `*`.

High quality is intended for hardware-accelerated desktop browsers; choose balanced/low for constrained devices. Tests run in desktop Edge and a mobile-sized viewport; they do not establish performance on physical phones. Modern WebGL 2 and ES2022 are required.

Design reference: https://www.gran-turismo.com/us/products/gt7/ (driving, tuning and weather feedback); https://threejs.org/docs/ (PBR and renderer). Asset credits are in THIRD_PARTY_NOTICES.md and the game interface.
