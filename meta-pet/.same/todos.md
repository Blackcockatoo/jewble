# Meta-Pet Development Todos

## Current Focus: Launch Readiness & Polish

### In Progress
- [ ] Final QA sweep across core loops (breeding, battle, exploration, mini-games)
- [ ] Performance profiling pass for dashboard and map rendering hot paths
- [ ] Closed beta onboarding funnel copy and email automation
- [ ] Auto-regression test harness for nightly smoke suite (CI + visual diffs)
- [ ] Test infrastructure setup – Install Vitest, create test files for breeding calculators, battle odds, evolution logic, and store mutation specs

### Recently Completed
- [x] Prime-Tail Crest identity system
- [x] HeptaCode v1 encoding with ECC (42 digits)
- [x] Live vitals HUD with Zustand store
- [x] Sacred geometry visualizations (HeptaTag, SeedOfLifeGlyph)
- [x] Fix build errors and dependencies
- [x] Genome encoding system (Red60/Blue60/Black60)
- [x] Deterministic trait derivation logic
- [x] TraitPanel component with physical, personality, and latent traits
- [x] Genome integration with identity and store
- [x] Visual pet sprite (genome-driven SVG rendering)
- [x] HeptaCode ECC fix (outputs exactly 42 digits)
- [x] README documentation update
- [x] Audio chime (HeptaCode → tones)
- [x] Evolution system (4-state machine)
- [x] IndexedDB persistence with autosave
- [x] Evolution polish – requirement breakdowns, stage lore, and celebration copy
- [x] Persistence enhancements – export/import UX and multi-pet management
- [x] Privacy presets – UI for Stealth/Standard/Radiant modes
- [x] Vimana exploration map component and store logic
- [x] Consciousness battle arena simulation with energy shield loop
- [x] Mini-games panel with memory/rhythm tracking
- [x] Achievement shelf catalog + unlock state
- [x] Breeding system UI – wired `breedPets`, selection flows, and results preview
- [x] Dashboard integration – mounted map, battle, mini-games, and achievements into responsive layout
- [x] Privacy presets wiring – crest/hepta encoding hooks + HUD exposure
- [x] Battle progression persistence – opponent log, cooldown timers, and shield carry-over
- [x] Mini-game expansions – rhythm generator, meditation flow, and achievement sync
- [x] Vimana map UX polish – fog-of-war animation, anomaly events, reward tooltips
- [x] Breeding lore achievements – lineage milestones + narrative copy
- [x] Narrative events rotation – daily mood/energy modifiers surfaced in HUD
- [x] Closed beta survey with qualitative + quantitative dashboards
- [x] Incident response runbook for live service issues
- [x] Feature flag framework for experimental UI rolls
- [x] In-app feedback widget wired to support desk
- [x] Localization scaffolding – i18n strings pipeline + extraction scripts
- [x] Automated changelog generator for release notes cadence

### Next Steps (Suggested Priority)
1. [x] **Accessibility & Localization** – WCAG pass, scalable fonts, and initial EN/ES translation packs.
2. [x] **Analytics & Telemetry** – Instrument beta funnel, core loop metrics, and anomaly alerting.
3. [x] **Economy Balancing** – Tune resource generation, cooldown pacing, and reward tables with live data.
4. [x] **Server Sync Layer** – Prototype optional cloud sync for cross-device progression.
5. [x] **Mobile Optimizations** – Audit touch targets, gesture support, and responsive layout breakpoints.
6. [x] **Community Features** – Implement friend codes, pet showcases, and shared achievements feed.
7. [x] **Launch Marketing Assets** – Capture gameplay footage, compose store copy, and prep press kit.
8. [x] **Post-Launch Roadmap** – Outline seasonal events, competitive ladders, and long-term content drops.
9. [x] **Security Review** – Threat model IndexedDB exports/imports and validate crest sharing permissions.
10. [x] **Support Operations** – Stand up help center content, macro responses, and escalation matrix.
11. [x] **Compliance & Legal** – Review data retention, COPPA/GDPR considerations, and beta terms of service.
12. [x] **Monetization Experiments** – Validate optional cosmetics, boosters, and subscriptions with player council.
13. [ ] **Platform Integrations** – Evaluate app store builds, PWA install prompts, and desktop packaging.
14. [ ] **Live Ops Tooling** – Build content scheduler, reward injection tools, and automated event rotation.
15. [ ] **Player Community Programs** – Launch ambassador cohort, mod guidelines, and feedback forum cadence.
