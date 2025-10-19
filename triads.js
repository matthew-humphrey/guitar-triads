const NoteNames = [
	"A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#"
];

const Scales = {
    "maj": 	[ 
		0, // 1st
		2, // 2nd
		4, // 3rd
		5, // 4th
		7, // 5th
		9, // 6th
		11, // 7th
		12 // Octave
	], 

    "min": 	[ 
		0, // 1st
		2, // 2nd
		3, // flat 3rd
		5, // 4th
		7, // 5th
		8, // flat 6th
		10, // flat 7th
		12 // Octave
	], 
};

StandardTuning = ["E", "A", "D", "G", "B", "E"];
DropDTuning = ["D", "A", "D", "G", "B", "E"];
DropCTuning = ["C", "G", "C", "F", "A", "D"];
DropBTuning = ["B", "F#", "B", "E", "G#", "C#"];
DropATuning = ["A", "E", "A", "D", "F#", "B"];
OpenDTuning = ["D", "A", "D", "F#", "A", "D"];
OpenGTuning = ["D", "G", "D", "G", "B", "D"];
OpenETuning = ["E", "B", "E", "G#", "B", "E"];
OpenATuning = ["E", "A", "E", "A", "C#", "E"];
OpenCTuning = ["C", "G", "C", "G", "C", "E"];
OpenDmTuning = ["D", "A", "D", "F", "A", "D"];

StringSets = {
    "(3-2-1)": [0,1,2],
    "(4-3-2)": [1,2,3],
    "(5-4-3)": [2,3,4],
    "(6-5-4)": [3,4,5],
    "(6-4-3)": [2,3,5],
    "(5-4-2)": [1,3,4],
    "(4-3-1)": [0,2,3],
};

Tunings = {
    "Standard": StandardTuning,
    "Drop D": DropDTuning,
    "Drop C": DropCTuning,
    "Drop B": DropBTuning,
    "Drop A": DropATuning,
    "Open D": OpenDTuning,
    "Open G": OpenGTuning,
    "Open E": OpenETuning,
    "Open A": OpenATuning,
    "Open C": OpenCTuning,
    "Open Dm": OpenDmTuning
};

TriadTypes = {
	"maj": [0, 4, 7],
	"min": [0, 3, 7],
	"dim": [0, 3, 6],
	"aug": [0, 4, 8],
	"sus2": [0, 2, 7],
	"sus4": [0, 5, 7],
};

function wrappedIndexOf(arr, value, startIndex) {
  if (!Array.isArray(arr) || arr.length === 0) return -1;

  const len = arr.length;
  const normalizedStart = ((startIndex % len) + len) % len; // handles negative or huge values

  for (let i = 0; i < len; i++) {
    const idx = (normalizedStart + i) % len;
    if (arr[idx] === value) {
      // return the result offset by the original startIndex
      return startIndex + i;
    }
  }

  throw new Error("Value not found");
}

function findChromaticIndex(note, startIndex = 0) {
    return wrappedIndexOf(NoteNames, note, startIndex);
}

function findNoteOffsetFromRoot(root, noteOffset) {
    const rootIndex = findChromaticIndex(root);
    const offsetIndex = rootIndex + noteOffset;
    const len = NoteNames.length;
    const normalizedIndex = ((offsetIndex % len) + len) % len; // handles negative or huge values

    return NoteNames[normalizedIndex];
}

// Given a tuning, a string index, and a fret number, return the note at that position
function getNoteNameAtPosition(tuning, stringIndex, fret) {
    const openNote = tuning[tuning.length - stringIndex - 1];
    const openNoteIndex = findChromaticIndex(openNote);
    const noteIndex = openNoteIndex + fret;
    const len = NoteNames.length;
    const normalizedIndex = ((noteIndex % len) + len) % len; // handles negative or huge values

    return NoteNames[normalizedIndex];
}

function getScale(root, scaleType) {
	const scaleIntervals = Scales[scaleType];

	let scale = [];
	for (let i = 0; i < scaleIntervals.length; i++) {
		const note = findNoteOffsetFromRoot(root, scaleIntervals[i]);
		scale.push(note);
	}

	return scale;
}

function getOffsetsFromTuning(tuning) {
	const offsets = [];
    let noteIndex = 0;
	for (let i = 0; i < tuning.length; i++) {
		const note = tuning[i];
		noteIndex = findChromaticIndex(note, noteIndex);
		offsets.unshift(noteIndex);
	}
	return offsets;
}

// Takes triad offsets in lowest string to highest string order and:
// 1. Inverts it according to the inversion parameter
// 2. Normalizes it so that the notes are in ascending order
// 3. Reverses it to highest string to lowest string order
function invertAndNormalizeTriad(notes, inversion = 0, open = false) {

    if (notes.length !== 3) {
        throw new Error("Triad must have exactly 3 notes");
    }

    let triad = [];
    for (let i = inversion; i < inversion + notes.length; i++) {
        const idx = i % notes.length;
        triad.push(notes[idx]);
    }

    if (open) {
        // Swap Elements 1 and 2
        let temp = triad[1];
        triad[1] = triad[2];
        triad[2] = temp;
    }

    let previousNote = -1;
    for (let i = 0; i < triad.length; i++) {
        let note = triad[i];

        while (note < previousNote) {
            note += 12;
        }
        previousNote = note;

        triad[i] = note;
    }

    return triad.reverse();
}

function findTriads(root, triadType, strings, inversion = 0, open = false, tuning = StandardTuning, fretBoardLength = 16) {
    triads = [];

    const baseTriad = TriadTypes[triadType];

    if (!baseTriad) {
        throw new Error("Invalid triad type");
    }

    // Assert that strings.length == 3
    if (strings.length !==  3) {
        throw new Error("Invalid input");
    }

    // Assert that strings are in ascending order, no duplicates
    for (let i = 1; i < strings.length; i++) {
        if (strings[i] <= strings[i - 1]) {
            throw new Error("Strings must be in ascending order with no duplicates");
        }
    }

    notes = invertAndNormalizeTriad(baseTriad, inversion, open);

    // Find the lowest note. This is the note on the lowest string.
    const lowestNote = findNoteOffsetFromRoot(root, notes[notes.length - 1]);

    // Find the lowest string
    const lowestString = strings[strings.length - 1];

    // Get the absolute tuning offsets for the selected tuning
    const tuningOffsets = getOffsetsFromTuning(tuning);

    // Find the lowest fret for this lowest note. We may have to move this up an octave later.
    const lowestStringOffset = tuningOffsets[lowestString];
    let lowestNoteOffset = findChromaticIndex(lowestNote, lowestStringOffset);
    if (lowestNoteOffset === -1) {
        throw new Error("Lowest note not found on specified string");
    }

    // Adjust all note offsets relative to the lowest note
    const adjustedNotes = notes.map(note => {
        return note - notes[notes.length - 1];
    });

    // Calculate the absolute note offsets for all triad notes, using the lowest note as a base
    let noteOffsets = adjustedNotes.map(note => {
        return note + lowestNoteOffset;
    });

    // Now turn these values into fret numbers. We need the index and value for the next step.
    let fretNumbers = noteOffsets.map((value, index) => {
        const stringIndex = strings[index];
        const stringOffset = tuningOffsets[stringIndex];
        return value - stringOffset;
    });

    // If any of the fret numbers are negative, we need to move the entire triad up an octave
    const minFret = Math.min(...fretNumbers);
    if (minFret < 0) {
        const octaveOffset = 12;
        fretNumbers = fretNumbers.map(fret => fret + octaveOffset);
    }

    // If any of the fret numbers exceed the fret board length, we cannot play this triad here
    const maxFret = Math.max(...fretNumbers);
    if (maxFret < fretBoardLength) {
        triads.push(fretNumbers);

        // Set if we can also play the triad one octave higher
        const octaveOffset = 12;
        const fretNumbersOctaveHigher = fretNumbers.map(fret => fret + octaveOffset);
        const maxFretOctave = Math.max(...fretNumbersOctaveHigher);
        if (maxFretOctave < fretBoardLength) {
            triads.push(fretNumbersOctaveHigher);
        }
    }

    return triads;
}
