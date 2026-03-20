# TODO

## MVP

- [ ] Default to 8 players since that's typical draft group
- [ ] Fix layounts and rotations at each valid player count
- [ ] Add "turns"
    - [ ] Configure settings before any turn has started, locked in once draft starts to avoid messing things up, simplify interface
    - [ ] When a turn starts (someone touches the screen (whole screen region or just a timer?)), all timers count down together
    - [ ] Players can press their button when they are done, pausing their own timer
    - [ ] A turn ends when either:
      - Every player has paused their timer
      - The time on any timer has run out
    - [ ] Confirmation from player before starting next turn (gives everyone a chance to open their packs, or pause if need a breather, etc)
- [ ] Add draft direction reminder
  - Starts clockwise
  - Ever-present on screen indicator (subtle animation?)
  - Switches direction each turn (CCW, CW, CCW, etc)
- [ ] Configurable timer

## Nice to have

- [ ] Fix colour schemes (currently dull)
- [ ] Beautify the design
- [ ] Track how many cards each player should have in hand
- [ ] Advanced settings (not in main UI to avoid clutter)
    - [ ] Pack size setting (influences number of turns)
    - [ ] Support for pick-two formats
- [ ] optional name labels (less important than a life tracker)
- [ ] Pause button to pause the whole process at any point

## Stretch goals / Maybes?
- Auto draft bracketing?
  - Basically a separate app
- Awards for fastest and slowest drafters?
- Chess clock style rules (gain "bonus" seconds in future packs by drafting fast early?)
  - Advanced feature if at all, don't want to overcomplicate and make Drafty the focus, taking away from the actual draft.