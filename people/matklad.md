# Alex Kladov (matklad)

- **Track:** `systems`
- **Role:** Software engineer at TigerBeetle; creator of `rust-analyzer`
- **Primary URL:** https://matklad.github.io
- **Feeds:** `https://matklad.github.io/feed.xml`
- **Social:** GitHub `@matklad`

## Why Follow
Alex (`matklad`) writes timeless, surgical essays on **how to structure and verify serious software systems**. Even in an era of agent-generated code, his rules of thumb—how to design module boundaries (`Avoid Public Functions Calling Other Public Functions`), how to build swarm/generative fuzzers with oracles (`Finding Bugs`), how to think about Git refs, and how TigerBeetle co-designs storage with its deterministic simulator (`VOPR`)—are pure gold for keeping codebases clean and verifiable.

## Signature Mental Models & Themes
- **Generative / Swarm Testing + Oracles:** Small tricky inputs with randomized feature subsets + a reference oracle catch deep algorithmic bugs example-based unit tests miss.
- **Clean API & Module Boundaries:** Separate public ergonomic entrypoints from private shared helpers; push I/O to the edges and never mock internal methods.
- **300ms Benchmarks & Mechanical Sympathy:** Keep micro-benchmarks in the human-perceptible 100–500ms window so iteration is fast and fixed startup noise vanishes.

## Links
- Blog: https://matklad.github.io
- Atom Feed: https://matklad.github.io/feed.xml
- GitHub: https://github.com/matklad
