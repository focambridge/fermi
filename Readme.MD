# Who has passed through?

**An interactive model of probes, light and Fermi’s paradox**

If the galaxy is billions of years old and civilisations are common, where is everybody? This project is a small, explorable model of one part of that question. If other civilisations sent probes out into the galaxy, how likely is it that any of them came past the Sun? And if they existed, would we even be able to see them?

To try it, open `probe-coverage.html` in any browser. There’s nothing to install.

The model was built to explore three questions:

1. If every civilisation sees the universe only through its own light cone (its “time cone”), could the galaxy look empty to almost everyone, even if it isn’t?
2. A probe travels along one trajectory. Once you account for how many probes are sent and where they go, how likely is it that we would actually encounter one?
3. If probes have to send their findings home, and those reports are as old as the light they’re describing, what’s the point of sending them at all?

---

## What the page shows

The map is a top-down view of a model galaxy of about 120 billion stars. Civilisations appear at random times during the period you choose, at random locations weighted by where the stars are. Each one sends out probes while it is active.

- **The coloured glow** shows the share of stars in each region that have been visited, on a logarithmic scale running from 1 in 10¹⁴ up to all of them. Most of the interesting results sit at the faint end of that scale.
- **Teal regions** have been swept by self-replicating probes.
- **Gold dots** are active civilisations, **hollow dots** are civilisations that have gone quiet, and **rings** mark the leading edge of each civilisation’s probes.
- **The Sun** is marked at its real distance from the galactic centre, about 26,000 light-years out.

Beside the map, the page reports the chance that a probe has reached the Sun by the present day, both in the galaxy on screen and averaged over 40 random galaxies with the same settings. It also shows:

- the chance of a visit in the last 100 million years, which is recent enough that traces might survive;
- how many civilisations’ probes have had time to get here;
- how many civilisations’ light has ever reached us, and how many are visible in our sky right now;
- how many waves of self-replicators were released, and how many stalled.

You can play the history forward or scrub through it, choose one of five scenarios, or adjust every assumption directly.

---

## The ideas behind it

### 1. Fermi’s question

The Milky Way is about 100,000 light-years across and over 10 billion years old. Michael Hart (1975) and Frank Tipler (1980) pointed out that even a slow-moving civilisation could spread across the whole galaxy in a few million to a few hundred million years, which is a small fraction of its age. So if expanding civilisations were common, one of them should have reached us long ago. The fact that none seems to have done so needs explaining.

### 2. Light cones: who can see whom

You can only see events whose light has had time to reach you. Physicists call that region of space and time your *past light cone*. For one civilisation to detect another, it isn’t enough for both to exist “at the same time”. The other civilisation’s signal has to arrive *while you are listening*. Two civilisations can both exist and both broadcast, yet never see each other, because each one’s light arrives somewhere after the other has gone quiet or before it has started listening.

- **Our own visibility.** Human radio leakage has been spreading for about a century, so it fills a bubble roughly 100 light-years in radius. That bubble holds around ten thousand stars, out of a few hundred billion in the galaxy, and the signal is so faint that most listeners inside it probably couldn’t detect it. To almost the whole galaxy, technological Earth doesn’t exist yet.
- **Fireflies.** If civilisations stay detectable for only a few thousand years, they behave like fireflies blinking at random times in a huge dark field. Each one’s light sweeps past places where nobody is looking yet, or where nobody is looking any more.
- **Where this stops working.** Light delays can only hide a civilisation for about as long as light takes to cross the galaxy, which is around 100,000 years. The galaxy is a hundred thousand times older than that. A civilisation that arose a million years ago and kept transmitting would have filled the galaxy with its light by now. So light cones explain silence from civilisations that are young or short-lived, but not from ones that are old and long-lived.
- **Life versus technology.** Earth’s atmosphere has contained oxygen, and the ozone it produces, for over two billion years, and that light has crossed the galaxy many times. An astronomer elsewhere with good enough instruments could know there is *life* here. Our technology, on the other hand, is visible only inside our small radio bubble.
- **An empty sky as a selection effect.** Robin Hanson and colleagues (2021) argue that if expanding civilisations spread at close to light speed, their light reaches you only shortly before they do. Anyone who can still look out at an empty sky must therefore be somewhere they haven’t reached yet. Seeing an empty sky may simply be what being early looks like.
- **The far future.** Because the expansion of the universe is accelerating, distant galaxies will eventually move beyond our horizon. In a hundred billion years or so, observers will see only their own merged home galaxy surrounded by darkness (Krauss and Scherrer, 2007). At that point the universe really will look empty to almost everyone.

**In the simulator:** compare “light has ever reached us” with “light is reaching us now”. The *Fireflies* scenario makes the difference stark.

### 3. Probes travel on one trajectory each

The claim that probes could cross the galaxy in ten million years is true, but it quietly assumes a particular kind of probe. What a single probe can achieve depends heavily on how it is sent.

**Probes fired in random directions** almost never encounter anything. A probe launched from *r* light-years away passes within distance *d* of a particular star with probability about *d*² / 4*r*². From 1,000 light-years away, the chance of passing within one light-year of the Sun is about 1 in 4 million. The chance of passing through the region where the planets orbit is about 1 in several trillion. Space is mostly empty, and the targets are tiny by comparison, so even billions of probes achieve very little.

**Aimed probes** do far better, because they are sent to stars rather than in random directions. But there are millions of stars within 1,000 light-years of any point, so a civilisation would need millions of probes to cover them. A sensible civilisation might prioritise. Planets with signs of life are rare, and Earth has shown such signs for billions of years, so if anyone nearby chose targets that way, we would be near the top of the list. Even so, it’s a lottery that depends on someone being within range at the right time.

**Self-replicating probes** change the arithmetic completely, because their number isn’t fixed. If each probe builds two copies at every star system it reaches, only about 37 generations are needed to reach all of the galaxy’s stars, since 2³⁷ is about 140 billion. The limit then becomes how fast the wave spreads, not how many probes there are. If each hop to a neighbouring star is 7 light-years at 1% of light speed, with a 1,000-year pause to build copies, the front crosses the galaxy in about 25 million years. The galaxy is old enough for that to happen hundreds of times over. **If even one civilisation ever released such a wave and it kept going, every star system should have been visited.** This is the version of the Fermi paradox that is still hard to explain away.

### 4. Why a replicator wave might not have reached us

- **Nobody builds them.** Carl Sagan and William Newman (1983) argued that uncontrolled self-replicators are so dangerous that any wise civilisation would refuse to build them.
- **Percolation.** Geoffrey Landis (1998) treated galactic expansion as a percolation process. If each settled site has too low a chance of seeding the next generation, expansion stops in finite clusters. Just above the critical threshold, the settled region becomes fractal, with large empty voids. We could be sitting in one.
- **Patchy steady states.** Simulations that include star motions and settlements that don’t last forever (Carroll-Nellenback, Frank, Wright and Scharf, 2019) find that a galaxy can stay partly settled for very long periods, with regions like ours left unvisited for hundreds of millions of years.
- **They came and we can’t tell.** Plate tectonics and erosion erase Earth’s surface over hundreds of millions of years. A metre-sized probe parked in the asteroid belt would be effectively invisible to current surveys. Only a tiny fraction of the solar system has ever been searched for artefacts at that scale.

**In the simulator:** the replication reliability slider controls percolation. On this model’s grid, the threshold is around 0.25. Across 200 random galaxies per setting, with two civilisations releasing replicators, the chance that the Sun has been reached changes sharply with reliability:

| Reliability | Chance the Sun has been reached |
|---|---|
| 0.22 | about 5% |
| 0.24 | about 26% |
| 0.26 | about 73% |
| 0.28 | about 92% |
| 0.30 | about 98% |

A small change in how reliably probes copy themselves makes the difference between a galaxy full of probes and one that is mostly empty.

### 5. Why send probes if the reports home are stale?

A report radioed home from a probe 1,000 light-years away arrives 1,000 years later, which makes it exactly as old as the light the home world already receives from that star. Relayed along a chain of probes, with pauses at each relay, it arrives even later. Probes can’t beat the light cone for the people back home. But that only removes one motive, getting fresh news. Several others survive:

- **Detail rather than freshness.** A telescope sees a distant planet as a faint point of light. A probe can map it, analyse its chemistry and study any life up close. Planets change over millions of years, so a report that is a thousand years old is effectively current. Staleness matters only for things that change quickly, and the main such thing is civilisations.
- **Acting locally.** Ronald Bracewell (1960) proposed a probe that waits in a promising system and talks to a newly emerging civilisation directly, avoiding centuries of delay between message and reply. The probe doesn’t overcome the light delay; it moves the decision-maker to where the action is.
- **No home to report to.** If the probes are intelligent, or carry the seeds of life (“directed panspermia”, Crick and Orgel, 1973), then they aren’t scouts working for a home world. They *are* the civilisation spreading out. A short-lived species might find this especially appealing: it can’t wait for replies, but it can make sure something of it carries on.
- **Darker motives.** Probes built to eliminate competitors, the “berserkers” of science fiction discussed by David Brin (1983), have no reason to report anything.

There is a wider problem with explaining the silence by motive. An argument against building self-replicators might persuade most civilisations, but it has to persuade *every* civilisation, across billions of years and every possible culture and psychology. The *One replicator* scenario shows why: a single exception, for any reason at all, is enough to sweep the galaxy. Physical barriers apply to everyone, while a motive only needs one civilisation that thinks differently. This is why explanations based on motive are generally considered weaker than those based on physics or capability.

---

## The scenarios

The results below are averages over many random galaxies with the same settings. Any single galaxy on screen can differ a lot; use *New random galaxy* to see how much luck matters.

| Scenario | Set-up | Chance the Sun has been visited | What it illustrates |
|---|---|---|---|
| **Scattershot probes** | 100 civilisations, each firing a billion probes in random directions | about 1 in 5,000 | Nearly all of these civilisations have had time to reach us, but almost none of their probes came this way. Geometry beats numbers. |
| **Targeted survey** | A million probes each, aimed at stars within 2,000 light-years, worlds with signs of life first | about 10% | Aiming helps enormously, but it still depends on someone arising nearby. |
| **One replicator** | One civilisation in a hundred releases reliable self-replicators | effectively certain | One exception is enough to fill the galaxy, usually hundreds of millions of years ago. |
| **Near the threshold** | Two civilisations release self-replicators with reliability 0.26 | about 70% | The spread breaks up and leaves voids. In the default galaxy, most stars are visited but the Sun sits in a gap. |
| **Fireflies** | 300 civilisations over 10 billion years, each active for 1,000 years | about 1 in a million | The light of every one of them has passed Earth at some point, but none is in our sky now. |

---

## What the model leaves out

- **The galaxy is flat and coarse-grained.** It is a disk divided into squares 1,000 light-years across. Odds are worked out for the real number of stars in each square; the dots on the map are only scenery. Random-direction probes use full three-dimensional geometry.
- **Aimed probes are spread evenly** among the stars within range, or among life-bearing stars first.
- **Self-replicators are simplified.** They spread from square to square, at a speed set by the probe speed, a 7-light-year hop and the build pause. Each link succeeds with the chosen reliability.
- **Stars don’t move.** In reality the Sun orbits the galaxy roughly every 230 million years, which mixes neighbourhoods and generally helps probes reach more systems.
- **A visit means a probe passed by or arrived.** Whether it stayed, left anything behind, or could be detected today is a separate question.
- **The numbers are illustrative.** Nobody knows how common civilisations are, how long they last or what they would build. The model is for exploring how the answer depends on those assumptions, not for estimating it.

---

## Running it and experimenting

- **`probe-coverage.html`** is the whole simulator in one file. Open it in any browser.
- **`probe-coverage-sim/`** splits the code into a reusable simulation core (`core.js`) and adds a command-line tool (`batch.js`) for running hundreds of random galaxies and sweeping one setting at a time. It needs Node 16 or later and has no dependencies. For example:

```bash
cd probe-coverage-sim
node batch.js --preset=survey --runs=500
node batch.js --preset=edge --sweep=reliab=0.22,0.24,0.26,0.28,0.3
node batch.js --help
```

See [`probe-coverage-sim/README.md`](probe-coverage-sim/README.md) for the full list of options and how to use the core from your own code.

---

## Further reading

- Bracewell, R. N. (1960). Communications from superior galactic communities. *Nature*.
- Brin, G. D. (1983). The “Great Silence”: the controversy concerning extraterrestrial intelligent life. *Quarterly Journal of the Royal Astronomical Society*.
- Carroll-Nellenback, J., Frank, A., Wright, J. and Scharf, C. (2019). The Fermi paradox and the Aurora effect: exo-civilization settlement, expansion, and steady states. *The Astronomical Journal*.
- Crick, F. H. C. and Orgel, L. E. (1973). Directed panspermia. *Icarus*.
- Hanson, R., Martin, D., McCarter, C. and Paulson, J. (2021). If loud aliens explain human earliness, quiet aliens are also rare. *The Astrophysical Journal*.
- Hart, M. H. (1975). An explanation for the absence of extraterrestrials on Earth. *Quarterly Journal of the Royal Astronomical Society*.
- Krauss, L. M. and Scherrer, R. J. (2007). The return of a static universe and the end of cosmology. *General Relativity and Gravitation*.
- Landis, G. A. (1998). The Fermi paradox: an approach based on percolation theory. *Journal of the British Interplanetary Society*.
- Sagan, C. and Newman, W. I. (1983). The solipsist approach to extraterrestrial intelligence. *Quarterly Journal of the Royal Astronomical Society*.
- Tipler, F. J. (1980). Extraterrestrial intelligent beings do not exist. *Quarterly Journal of the Royal Astronomical Society*.