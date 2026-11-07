# Implementation Plan — Smart MIRA Conversational Engine & Interactive "MIRA & Lab" Console

## Why MIRA Was Failing
1. **Brittle Keyword Matcher**: Previously, `findMiraAnswer()` only checked a short list of exact keywords and, whenever a user's message scored below `3`, it blindly returned the **first static answer of the chapter**—even if you typed `"hey"`, `"hello"`, `"how does this component work?"`, or `"what is this website?"`.
2. **Disconnected Inline Panel in Slide 04 (`MIRA & Lab`)**: The inline panel only swapped a single static card instead of functioning as a responsive, conversational MIRA console connected to the chapter's actual components (`hotspots`), steps, discoveries, and website metadata.

---

## Planned Upgrades (`src/chapters/components/AskEngineerModal.tsx`)

### 1. Multi-Intent Conversational & Component Engine (`resolveMiraResponse`)
Upgrade MIRA's brain to recognize and answer all natural categories of user questions:
- **Greetings & Conversation (`hey`, `hello`, `hi`, `how are you`, `thanks`, `bye`, `help`)**:
  - Greets the visitor warmly in character as **MIRA**, introduces the current chapter's spacecraft, and suggests topics to ask about.
- **Website, Project & Team NovoSriti (`website`, `project`, `team`, `novosriti`, `space apps`, `challenge`, `abandoned`, `who made this`, `what is this`)**:
  - Explains that **Mission Remnants** ("Built for a Question") was created by **Team NovoSriti** for the **NASA Space Apps Challenge** (*Challenge: "Abandoned, But Not Forgotten"*), detailing how the Scroll Prologue, 6 Documentary Chapters, and 6 3D Mission Lab simulations work together.
- **Spacecraft Component & Subsystem Encyclopedia**:
  - Directly connects MIRA to all **spacecraft components and hotspots** across all 6 chapters (e.g., *Fused-Silica Corner-Cube Prisms, Dust Cover, Leveling Socket, 20-Layer Mylar Skirt, Beryllium Seismometer, SNAP-27 / SNAP-19 / MHW-RTG Plutonium Generators, Viking Soil Scoop, GCMS & Labeled Release Ovens, 18-Nozzle Thrusters, Warm Electronics Box, Aerogel, Rocker-Bogie Suspension, Rock Abrasion Tool (RAT), Pancam, Coaxial Carbon-Fiber Rotors, Swashplate, Garmin LIDAR, Wright Flyer Swatch, 3.7m High-Gain Dish, Golden Record, Magnetometer Boom*).
  - Asking *"how does the [component] work?"* or *"tell me about the components"* explains its exact engineering function and scientific finding.
- **Chapter Questions (`how does it work`, `what did it discover`, `where is it now`, `is it still working`, `distance`, `how to play the 3D lab`)**:
  - Dynamically answers from the active chapter's `steps`, `discovery`, `status`, `facts`, and `Mission Lab` controls.
- **Smart Contextual Fallback**:
  - Never repeats a random static answer; if a question is open-ended, MIRA provides a tailored summary of the current spacecraft and lists specific components you can ask about.

### 2. Fix & Upgrade MIRA in Slide 04 (`MIRA & Lab` Section)
- Turn `MiraChapterSection` in Slide 04 into a responsive **Interactive MIRA Console**:
  - Includes instant quick-action prompts (`Say Hello`, `How It Works`, `Explain Components`, `About This Website`, plus the 5 chapter-specific questions).
  - Supports natural chat input with instant scrolling reply history and `Listen to MIRA` voice narration right inside the `MIRA & Lab` slide.
