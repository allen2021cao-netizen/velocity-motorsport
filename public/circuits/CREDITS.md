# Circuit references

## Alpine additions · 2026-09-15

- Red Bull Ring (4,318 m, 10 reference turns): outline from Tomislav Bacinger's MIT-licensed f1-circuits dataset, source snapshot `source-redbull.geojson`. Reference: https://www.redbullring.com/en/track/red-bull-ring-f1-motogp-track/
- Arosa ClassicCar (7,300 m, 76 reference turns, net +422 m): road alignment from OpenStreetMap contributors via routing.openstreetmap.de, between the Langwies/Sapün area and Arosa. Source snapshot `source-arosa-route.json`; adapted geometry `alpine-layouts.json`. © OpenStreetMap contributors, ODbL 1.0: https://www.openstreetmap.org/copyright and https://opendatacommons.org/licenses/odbl/1-0/. The adapted OSM route database is available under ODbL in the downloadable JSON; this does not license game code. Reference: https://www.arosaclassiccar.ch/de/rennen-und-event/situationsplan

These two additions use approximate, authored vertical profiles, not surveyed terrain. Arosa includes approximately 1.2 km of descent and net +422 m; intermediate elevations and the endpoint placement are adapted. Road widths (15 m Red Bull Ring / 9 m Arosa) are gameplay approximations. Mountain silhouettes, snow caps, forest, buildings and facilities are original stylized scenery, not geographically exact reproductions. Arosa is a point-to-point stage; simultaneous four-car racing is a game adaptation of the real hillclimb event. The fictional Alpine Pass has been removed from the playable roster.

Four geographically derived layouts replace procedural loops: Shanghai International Circuit (5451 m), Circuit de Monaco (3337 m), Las Vegas Strip Circuit (6201 m), Miami International Autodrome (5412 m).

Route geometry: https://github.com/bacinger/f1-circuits — Copyright (c) 2019–2025 Tomislav Bacinger, MIT; full license in LICENSE.md. Source snapshot fetched 2026-09-14. Geographic coordinates were projected to a local plane, interpolated with centripetal splines and normalized to published circuit length; Monaco's seam was moved to the start-straight region.

Official reference pages:
- https://www.formula1.com/en/racing/2026/china
- https://www.formula1.com/en/racing/2026/monaco
- https://www.formula1.com/en/racing/2026/las-vegas
- https://www.formula1.com/en/racing/2026/miami

This is an unofficial game adaptation, not a laser scan or a licensed replica. Elevation remains flat; widths are constant gameplay approximations (Shanghai / Vegas 16 m, Miami 13 m, Monaco 9 m). Architecture, vegetation, tunnel, stadium, pit areas and harbor are simplified original meshes. Do not interpret them as surveyed positions or a complete reproduction of actual venue buildings. The playable roster now consists of thirteen map-derived circuits.

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

## Australia expansion
- Mount Panorama / Bathurst: 6,213 m, 23 reference turns; closed loop. Official facts: https://www.bathurst.nsw.gov.au/Services/Facilities/Mount-Panorama/About-the-Mount/Track-Facts
- Phillip Island Grand Prix Circuit: 4,445 m, 12 reference turns; closed loop. Official map: https://www.phillipislandcircuit.com.au/circuit-info/circuit-map/
- Route reference files are publicly provided by Emtron Australia: https://docs.emtronaustralia.com.au/motorsport/tracks/aus/tracks/index.html . Source files: source-bathurst.geojson and source-phillip.geojson. Fetched 2026-09-15. Original source credit: Emtron Australia Pty Ltd. No affiliation or endorsement is implied.
- Inner-edge coordinates were projected into metres, shifted toward the roadway, smoothed and normalized to circuit length. Bathurst source elevation was smoothed and normalized to the published 174 m elevation range. Phillip Island elevation is an authored approximation (about 33 m range), not a surveyed profile. Constant game road widths are 9 m / 12 m. Course geometry and terrain are game adaptations, not laser scans.
- Derived route data: australian-layouts.json; reproducible conversion: tools/build-australian-layouts.mjs. Scenery uses original procedural terrain, eucalyptus-inspired trees, grandstands and a coastal ocean; positions and coastline are artistic approximations. Shared texture credits: /environment/alpine/CREDITS.md.

## Suzuka and Fuji Speedway
Route references: [Emtron Japan public track downloads](https://docs.emtronaustralia.com.au/motorsport/tracks/jp/tracks/index.html), full Suzuka and Fuji inner-edge GeoJSON. Sources are attributed to their provider; no open-source licence is asserted for these downloads. Official dimensions: [Suzuka](https://www.suzukacircuit.jp/eng/course_s/), [Fuji Speedway](https://www.fsw.tv/). Routes are smoothed and scaled for gameplay. Elevations, Suzuka bridge clearance, scenery, wheel placement and the compressed Fuji mountain are authored approximations, not surveyed or laser-scanned reproductions.

### Japanese scenery revision (September 2026)
Visual land-use reference: Google Maps satellite views of Suzuka (34.8445, 136.535) and Fuji Speedway (35.3715, 138.927), viewed in browser only. No Google imagery or 3D tiles are bundled. Tilted Google 3D was unavailable in the review browser. Suzuka's official park information and circuit maps inform wheel scale and site character. Wheel location reference: OpenStreetMap way 184107083, 34.84599 N, 136.53887 E (via Mapcarta), © OpenStreetMap contributors, ODbL. Terrain, trees, agricultural parcels, buildings and aerial camera routes are original procedural game approximations; buildings are not a parcel-by-parcel or photogrammetric reconstruction.

### Australian destination tours
Independent artistic composites; race roads are hidden only while viewing these scenes. Phillip Island references: Cape Woolamai/Pinnacles (https://www.visitphillipisland.com.au/discover/cape-woolamai), The Nobbies and Seal Rocks (https://www.penguins.org.au/attractions/reserves/the-nobbies/), Pyramid Rock (https://www.visitphillipisland.com.au/). Bathurst references: Wahluu lookout (https://www.bathurst.nsw.gov.au/Services/Facilities/Mount-Panorama/Experiences/The-Boardwalk) and Chifley Dam (https://www.bathurst.nsw.gov.au/Services/Water/Dams/Chifley-Dam). Landforms are original game scenery, using existing credited photographic sky/ground textures; landmarks are compressed together for a continuous tour, not reproduced at surveyed positions.
