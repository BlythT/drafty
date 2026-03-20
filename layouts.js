/*
LAYOUTS lets us manually specify the grid-template-areas
and player rotations manually for each player count.

Originally I just numbered evenly across top and bottom
e.g. p1 p2 p3 p7
     p4 p5 p6 p7

However I didn't like how the colours "jump around" when
switching to the next player count
e.g. p1 p2 p3 p4
     p5 p6 p7 p8

See above how p4 goes from bottom left to top right? This happens often.

Whereas you can preserve stable ordering if you do odds-on-top, evens-on-bottom
p1 p3
p2 p4
and so on, for stable colours.
Makes these layouts slightly less simple, but worth it for the end result.
*/
export const LAYOUTS = {
    2: {
        landscape: {
            areas: `"p1 p2"`,
            cols: '1fr 1fr',
            rows: '1fr',
            players: {
                // left side
                p1: 'rotate-90',
                // right side
                p2: 'rotate-270',
            }
        },
        portrait: {
            areas: `"p1"
                    "p2"`,
            cols: '1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                // bottom row
                p2: '',
            }
        }
    },
    3: {
        landscape: {
            areas: `"p1 p3" 
                    "p2 p2"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                // bottom row
                p2: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p3"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-90',
                p2: 'rotate-270',
                // bottom cap
                p3: '',
            }
        }
    },
    4: {
        landscape: {
            areas: `"p1 p3"
                    "p2 p4"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
            }
        }
    },
    5: {
        landscape: {
            areas: `"p1 p3 p5"
                    "p2 p4 p5"`,
            cols: '1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                // end cap
                p5: 'rotate-270',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p5"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                // bottom cap
                p5: '',
            }
        }
    },
    6: {
        landscape: {
            areas: `"p1 p3 p5"
                    "p2 p4 p6"`,
            cols: '1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
            }
        }
    },
    7: {
        landscape: {
            areas: `"p1 p3 p5 p7"
                    "p2 p4 p6 p7"`,
            cols: '1fr 1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
                // end cap
                p7: 'rotate-270',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"
                    "p7 p7"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
                // bottom cap
                p7: '',
            }
        }
    },
    8: {
        landscape: {
            areas: `"p1 p3 p5 p7"
                    "p2 p4 p6 p8"`,
            cols: '1fr 1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                p7: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
                p8: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"
                    "p7 p8"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                p7: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
                p8: 'rotate-270',
            }
        }
    },
    9: {
        landscape: {
            areas: `"p1 p3 p5 p7 p9"
                    "p2 p4 p6 p8 p9"`,
            cols: '1fr 1fr 1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                p7: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
                p8: '',
                // end cap
                p9: 'rotate-270',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"
                    "p7 p8"
                    "p9 p9"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                p7: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
                p8: 'rotate-270',
                // bottom cap
                p9: '',
            }
        }
    },
    10: {
        landscape: {
            areas: `"p1 p3 p5 p7 p9"
                    "p2 p4 p6 p8 p10"`,
            cols: '1fr 1fr 1fr 1fr 1fr',
            rows: '1fr 1fr',
            players: {
                // top row
                p1: 'rotate-180',
                p3: 'rotate-180',
                p5: 'rotate-180',
                p7: 'rotate-180',
                p9: 'rotate-180',
                // bottom row
                p2: '',
                p4: '',
                p6: '',
                p8: '',
                p10: '',
            }
        },
        portrait: {
            areas: `"p1 p2"
                    "p3 p4"
                    "p5 p6"
                    "p7 p8"
                    "p9 p10"`,
            cols: '1fr 1fr',
            rows: '1fr 1fr 1fr 1fr 1fr',
            players: {
                // left column
                p1: 'rotate-90',
                p3: 'rotate-90',
                p5: 'rotate-90',
                p7: 'rotate-90',
                p9: 'rotate-90',
                // right column
                p2: 'rotate-270',
                p4: 'rotate-270',
                p6: 'rotate-270',
                p8: 'rotate-270',
                p10: 'rotate-270',
            }
        }
    },
};