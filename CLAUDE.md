# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A standalone vanilla JavaScript fireworks animation web app ("Happy New Year"). No build tools, no package manager, no frameworks — three files served directly as static assets. Features dynamic year detection, IP-based localized greetings, countdown intro, and text firework effects.

## Structure

- **index.html** — Entry point; loads CDN dependencies (fscreen, Stage.js, MyMath.js, Meyer Reset CSS, DSEG7 font) and audio from S3
- **script.js** — Single monolithic file (~2,960 lines) containing all application logic
- **style.css** — Styles, countdown overlay, and responsive layout

## Running

Open `index.html` in a browser or serve with any static file server. No build step required.

## Architecture

**State management:** Custom `store` object with pub/sub pattern. Persists to LocalStorage with schema versioning (v1.1, v1.2).

**Rendering:** Dual-canvas approach — a trails layer (persistent) and a main layer (cleared each frame). Uses Stage.js for the animation tick loop. Each particle has a `drawScale` (0.8–1.2) for natural size variation in trail rendering.

**Particle system:** Three particle types (Star, Spark, BurstFlash) using object pooling for performance. Physics simulation includes gravity (0.9 px/s²), air drag, and color transitions. Stars support `flickerFreq` for random blinking during ascent.

**Shell types:** 14 varieties (Crysanthemum, Crackle, Crossette, Falling Leaves, Floral, Ghost, Palm, Strobe, Willow, Peony, Dahlia, Brocade, Waterfall, Random). Each shell is a factory function returning a config object.

**Launch trail variety:** 7 ascent styles (Golden Comet, Corkscrew, Flicker, Twin Comet, Sparkler, Crackle Rise, Bright Comet) randomly assigned in `Shell.launch()`. Text shells get a dedicated golden trail.

**Sequences:** Choreographed launch patterns (Random, TwoRandom, Triple, Pyramid, SmallBarrage, MixedVolley, WideBarrage, DuoPair) with auto-launch and finale modes.

**Text fireworks:** `seqTextMessage()` launches "HAPPY" / "NEW YEAR" as individual character shells using a 7x9 bold bitmap font (`TEXT_BITMAP`). Each character bursts via `burstTextChar()` with multicolor stars. Timer: first at 10s, then every 60s.

**Countdown intro:** `startCountdown()` shows a 5→1 countdown using DSEG7 digital font (red, 38vh) with enter/exit CSS animations before fireworks begin. Detects mobile portrait and shows a rotate-to-landscape hint.

**Dynamic greeting:** Fetches user country from `ipwho.is` API, maps to localized "Happy New Year" greeting via country code dictionary. Falls back to English.

**Audio:** Web Audio API via `soundManager`; buffers preloaded from S3 CDN.

**Responsiveness:** Mobile (≤640px), desktop (>800px) with adaptive quality defaults based on `navigator.hardwareConcurrency`.

## Key Keyboard Shortcuts

- **P** — Pause/resume
- **O** — Toggle settings menu
- **Esc** — Close menu
