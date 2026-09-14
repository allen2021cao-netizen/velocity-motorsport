# Circuit references

Four geographically derived layouts replace procedural loops: Shanghai International Circuit (5451 m), Circuit de Monaco (3337 m), Las Vegas Strip Circuit (6201 m), Miami International Autodrome (5412 m).

Route geometry: https://github.com/bacinger/f1-circuits — Copyright (c) 2019–2025 Tomislav Bacinger, MIT; full license in LICENSE.md. Source snapshot fetched 2026-09-14. Geographic coordinates were projected to a local plane, interpolated with centripetal splines and normalized to published circuit length; Monaco's seam was moved to the start-straight region.

Official reference pages:
- https://www.formula1.com/en/racing/2026/china
- https://www.formula1.com/en/racing/2026/monaco
- https://www.formula1.com/en/racing/2026/las-vegas
- https://www.formula1.com/en/racing/2026/miami

This is an unofficial game adaptation, not a laser scan or a licensed replica. Elevation remains flat; widths are constant gameplay approximations (Shanghai / Vegas 16 m, Miami 13 m, Monaco 9 m). Architecture, vegetation, tunnel, stadium, pit areas and harbor are simplified original meshes. Do not interpret them as surveyed positions or a complete reproduction of actual venue buildings. The Alps route remains fictional; the other eleven routes now reference actual circuits.

## Open city edition
The four circuit routes retain their geographic outlines. Their surroundings are now fictional composites: downtown-style districts and stylized city landmarks are intentionally relocated near the circuits. Shanghai adds Oriental Pearl and Lujiazui silhouettes; Miami combines South Beach-inspired hotels and a Freedom Tower-inspired landmark with the stadium; Las Vegas adds illuminated hotel wings and a pyramid; Monaco adds casino and palace-inspired architecture. Continuous catch fences and road-edge walls are removed. Low kerbs, open shoulders, road markings and braking boards remain. Leaving the shoulder slows the car and invalidates shortcut laps.

## Standalone city explorer
Shanghai, Las Vegas, Miami and Monaco city tours now use separate city portrait scenes with no racing circuit meshes. Their landmarks, waterfronts, blocks, camera framing and lighting are artistic composites, not photogrammetry or a geographically exact reconstruction. Waterfront views use planar reflected city geometry; tours release their GPU resources and restore circuit lighting when returning to the garage.

## Seven-city expansion · 2026-09-15

| City | Circuit reference | Game lap / width | Official reference |
|---|---|---|---|
| Tokyo | Big Sight street circuit, 2024 | 2585 m / 9 m | https://www.fiaformulae.com/en/news/493595/what-does-the-tokyo-formula-e-street-circuit-look-like |
| Dubai | Dubai Autodrome, Grand Prix | 5390 m / 14 m | https://dubaiautodrome.ae/about-us/ |
| Los Angeles metro | Long Beach street circuit, IndyCar layout | 3167 m / 10 m | https://www.indycar.com/Schedule/2025/Long-Beach |
| London | ExCeL, 2023–24 | 2090 m / 8 m | https://www.fia.com/news/seven-cup-destiny-season-10-crown-be-decided-london |
| New York | Brooklyn / Red Hook, 2021–22 | 2320 m / 8 m | https://en.wikipedia.org/wiki/Brooklyn_Street_Circuit |
| Paris | Les Invalides, 2016–19 | 1930 m / 9 m | https://new.abb.com/formula-e/2018-19/paris |
| Hong Kong | Central Harbourfront, 2016–19 | 1860 m / 8 m | https://hkformulae.com/race-info/hk-circuit/ |

Long Beach is a separate city in the Los Angeles metropolitan area, not downtown Los Angeles. Historic Formula E layouts are intentionally retained. London is a flat adaptation of the indoor/outdoor route; exhibition-hall interiors, elevation transitions and the actual surface-grip changes are not reproduced. Pit lanes, attack-mode detours and barriers are excluded. Corner counts identify the reference circuits, not a count of game spline control points.

The six map-based routes were independently traced to anchors, smoothed to eliminate pixel stair steps and sharp joins, then normalized to the reference lap distance. They are approximate driving routes, not surveyed coordinates. Narrow corners and lane spacing are adapted to this game's constant road widths. Dubai's historical map reports 5370 m; the game uses the venue's published 5390 m. Tokyo's map was cross-checked against the 2024 race map, including the added chicane.

### Map attribution and route-data licenses

The six derived route datasets (tokyo, dubai, london, newyork, paris, hongkong) are available in [city-layouts.json](city-layouts.json), licensed CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/ . Changes: manual centerline tracing, corner smoothing, local coordinates, and length normalization. Dubai's CC BY-SA 3.0 source is adapted under the later compatible CC BY-SA 4.0 license. This license applies to these route data and their traced anchors, not the independent game code or original architectural meshes.

- Tokyo: MaxLikesStuff, **Tokyo Street Circuit.png**, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Tokyo_Street_Circuit.png
- Dubai: Will Pittenger, **Dubai Autodrome--Grand Prix Course.svg**, CC BY-SA 3.0. https://commons.wikimedia.org/wiki/File:Dubai_Autodrome--Grand_Prix_Course.svg
- London: MaxLikesStuff, **London ePrix 2023.png**, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:London_ePrix_2023.png
- New York: Mannivu, **New York City Layout 2021.svg**, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:New_York_City_Layout_2021.svg
- Paris: IgnacioR96, **Paris Street Circuit.png**, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Paris_Street_Circuit.png
- Hong Kong: Amara aenea, **Hong Kong Circuit.png**, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Hong_Kong_Circuit.png

Long Beach: © OpenStreetMap contributors, ODbL 1.0, obtained from Tobi's track-atlas, OSM relation 18052024: https://github.com/tobi/track-atlas/tree/main/tracks/long-beach . The `la` dataset in [city-layouts.json](city-layouts.json) and [source-long-beach.geojson](source-long-beach.geojson) are available under ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/ . Changes: local projection, smoothing and distance normalization. Attribution: https://www.openstreetmap.org/copyright . Snapshot accessed 2026-09-15.

### City portraits and racing surroundings

All seven cities also have standalone 3D portrait scenes shared by the selection preview and City Explorer. Tokyo combines Tokyo Tower, Rainbow Bridge and Big Sight; Dubai combines Burj Khalifa, sail-hotel and Museum-of-the-Future-inspired silhouettes; Los Angeles combines Griffith Observatory, Hollywood hills and a Pacific Park-style pier; London combines Elizabeth Tower/Westminster, London Eye and Tower Bridge; New York combines Empire State Building, Brooklyn Bridge and Statue of Liberty; Paris combines Eiffel Tower, Invalides and Arc de Triomphe; Hong Kong combines Bank of China Tower, IFC and the convention centre with ridge scenery and Star Ferry-style boats.

These are original, simplified architectural interpretations. Landmarks are deliberately relocated to compose a recognizable city, including along the circuit; geographic distance, building proportions and skyline placement are artistic choices. No licensed commercial-game models or paid assets were used. City Explorer contains no circuit, racing barriers or racing cars.
