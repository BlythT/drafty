# TODO

## MVP

- [x] Default to 8 players since that's typical draft group
- [x] Fix layounts and rotations at each valid player count
- [x] Add pack / pick draft flow
    - [x] Track packs and picks instead of generic turns
    - [x] Advance automatically to the next pick once everyone is done
    - [x] Pause between packs with a clear "new pack" screen
    - [x] Show a finished state at the end of the draft
- [x] Add draft direction reminder
  - Starts clockwise / pass left
  - Ever-present on screen indicator (subtle animation?)
  - Switches direction each pack
- [ ] Configurable timer
- [x] [Host with GitHub pages](https://github.com/BlythT/drafty))
- [x] Enable progressive webapp installation for Android and iOS.

## Nice to have

- [x] Fix colour schemes (currently dull)
- [x] Beautify the design
- [ ] Track how many cards each player should have in hand
- [ ] Settings menu
    - [ ] Keep it out of the main draft UI to avoid clutter
    - [ ] Support variable pack size
    - [ ] Support variable number of packs
    - [ ] Support pick-two formats
- [ ] optional name labels (less important than a life tracker)
- [ ] Pause button to pause the whole process at any point

## Stretch goals / Maybes?
- Auto draft bracketing?
  - Basically a separate app
- Awards for fastest and slowest drafters?
- Chess clock style rules (gain "bonus" seconds in future packs by drafting fast early?)
  - Advanced feature if at all, don't want to overcomplicate and make Drafty the focus, taking away from the actual draft.
