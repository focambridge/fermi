# Who has passed through? A probe-coverage simulator

A toy galaxy for exploring Fermi’s paradox. Civilisations appear at random places and times, send out ordinary or self-replicating probes, and the model works out how likely it is that anything ever came past the Sun.

There are no dependencies and no build step.

## Files

- `index.html` is the interactive page. It loads `core.js` from the same folder.
- `core.js` is the simulation core. It works as a browser script and as a Node module.
- `batch.js` is a command-line tool for running many random galaxies and sweeping one setting.

## Running the page

Open `index.html` in a browser. It works straight from the file system, so no server is needed.

If your browser blocks local scripts, serve the folder instead:

```
python3 -m http.server 8000
```

and visit http://localhost:8000.

The page loads the Archivo typeface from Google Fonts when you’re online. Offline, it falls back to your system font and everything else works the same.

## Batch runs (Node 16 or later)

```
node batch.js --help
node batch.js --preset=survey --runs=500
node batch.js --preset=edge --sweep=reliab=0.22,0.24,0.26,0.28,0.3,0.35
node batch.js --strategy=aimed --probes=1e6 --sweep=range=500,2000,10000 --full
node batch.js --preset=scatter --json > results.jsonl
```

Each setting is run across many random galaxies. The table reports the mean chance the Sun has been visited by the present day, the median and 10th/90th percentiles across galaxies, the share of galaxies where that chance exceeds 50%, and how often self-replicators reached the Sun. With `--full` it also reports the average share of all stars visited, which is slower because it computes coverage across the whole galaxy.

## Using the core from your own code

```js
const core = require('./core.js');

const params = {
  civs: 100, period: 1000, life: 1e4,          // count, millions of years, years
  strategy: 'aimed', probes: 1e6, speed: 1,     // 'random' | 'aimed', count, % of light speed
  near: 100, range: 2000,                       // AU (random probes), light-years (aimed probes)
  prefer: true, lifeShare: 1e-3,                // visit life-bearing worlds first, and how common they are
  repShare: 0, reliab: 0.6, pause: 1000         // % releasing replicators, 0–1, years
};

const st = core.simulate(params, 12345);        // one galaxy, fixed seed
const sun = core.sunStats(st, st.T);            // pSun, pRecent, expected visits, light and reach counts
const F = core.field(st, st.T, core.makeField()); // per-square coverage; F.gal is the share of all stars visited

const quick = core.sunOnce(params, core.makeCfg(params), 99); // fast: the Sun only
```

## How the model works

- The galaxy is a flat disk of about 120 billion stars, divided into squares 1,000 light-years across. Odds are computed for the real number of stars in each square.
- Probes fired in random directions use three-dimensional geometry: a probe launched from *r* light-years away passes within *d* of a given star with probability *d*²/4*r*².
- Aimed probes are shared evenly among stars within range, or among life-bearing stars first.
- Self-replicators spread from square to square at a speed set by the probe speed, a 7-light-year hop and the build pause. Each link succeeds with the chosen reliability, so the spread is a percolation process. On this grid it fizzles below a reliability of about 0.25.
- Light travels at its own speed, so a civilisation is in our sky only while light from its active years is arriving.
- Stars don’t move. In reality the Sun orbits the galaxy roughly every 230 million years, which mixes neighbourhoods.
- A visit means a probe passed by or arrived, not that it stayed or left traces.
