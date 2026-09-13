# 地下狂飙 · Motorsport

A modular browser racing game rebuilt from the original speed.chentaoai.com mobile game.

## Run and build

Node 22+ is recommended. Run `npm ci`, then `npm run dev`. `npm run build` type-checks the new TypeScript systems and produces `dist/`. `npm test` checks physics and race rules. Netlify builds using the checked-in `netlify.toml`.

## Contents

- 13 vehicles: 12 enhanced procedural classics and one independently loaded, Draco-compressed Ferrari 458 GLB with interior and animated wheel assemblies.
- 12 city-themed circuits. Shanghai adds a Bund-inspired bank, river and Pudong-inspired skyline. **Routes and building placements are artistic approximations, not GIS-derived or surveyed replicas.**
- One-lap sprint, three-lap race, solo three-lap time trial, eight-lap endurance with fuel, tire wear and an eight-second service stop.
- 120 Hz fixed-step approximate bicycle dynamics, grip-limited steering/braking, tire compounds and temperature, rain grip, adjustable downforce and brake balance, optional ABS/TCS abstractions.
- Keyboard, simultaneous touch controls and standard gamepads; automatic pause on loss of focus. Fuel service: stop below 5 km/h in the first 4.5% of the circuit and hold P or the service button for eight seconds.
- Local best-lap persistence partitioned by track, car, weather and setup; ordered checkpoint validation; resetting invalidates that lap's best-time eligibility.
- Three.js r180, PBR car paint, environment lighting, shadow maps, optional bloom, anti-aliasing, static mesh batching and adaptive resolution.

## Controls

WASD / arrows: throttle, brake and steer. Space: handbrake. C: camera. Esc: pause. R: reset to track (invalidates the current lap). M: mute. P: endurance service. Gamepad left stick steers, RT accelerates, LT brakes, A applies the handbrake.

## Layout

`src/main.ts` boots the application; `src/runtime.js` integrates the retained city generator, audio and race presentation. `src/vehicles.js`, `cars.js` and `tracks.js` contain vehicle geometry and content. `src/physics.ts`, `session.ts`, `graphics.ts` and `assets.ts` implement the new subsystems. GLB and Draco resources live under `public/` and are served locally. HTML is only the application entry point; the engine and assets are compiled and deployed separately.

## Scope and limitations

This is a substantial browser-game upgrade, not GT7-level simulation or production. Original procedural vehicles remain lower-detail than the featured GLB. No licensed GT7 resources, real-time ray tracing, geographic street scan, multiplayer server or force-feedback steering-wheel system is implemented. The bicycle model and ABS/TCS are gameplay approximations. AI has curvature-based braking and overtaking, but still follows the circuit spline; unfinished competitors' result times are estimates marked with `*`.

High quality is intended for hardware-accelerated desktop browsers; choose balanced/low for constrained devices. Tests run in desktop Edge and a mobile-sized viewport; they do not establish performance on physical phones. Modern WebGL 2 and ES2022 are required.

Design reference: https://www.gran-turismo.com/us/products/gt7/ (driving, tuning and weather feedback); https://threejs.org/docs/ (PBR and renderer). Asset credits are in THIRD_PARTY_NOTICES.md and the game interface.
