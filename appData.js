let chromaticScale = [
	"C",
	"C#",
	"D",
	"Eb",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"Bb",
	"B",
	"C",
	"C#",
	"D",
	"Eb",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"Bb",
	"B",
	"C",
	"C#",
	"D",
	"Eb",
	"E",
	"F",
	"F#"
];

let steps = [
		[
			[2, 4, 5, 7, 9, 11, 12], //major
			[4, 7, 12], //triad
			[4, 7, 11, 12],  // maj 7th
			[4, 7, 10, 12], // 7th
			[2, 4, 7, 9, 12] //pentatonic
		],
		[
			[2, 3, 5, 7, 8, 10, 12],  //minor
			[3, 7, 12],  //triad
			[3, 7, 10, 12],  // min 7th
			[3, 6, 10, 12],  //
			[3, 5, 7, 10, 12] //pentatonic
		]
	];

let stringNotes =[
	[
		chromaticScale.slice(4, 4 + 16),
		chromaticScale.slice(11, 11 + 16),
		chromaticScale.slice(7, 7 + 16),
		chromaticScale.slice(2, 2 + 16),
		chromaticScale.slice(9, 9 + 16),
		chromaticScale.slice(4, 4 + 16),
	],
	[
		chromaticScale.slice(4, 4 + 16),
		chromaticScale.slice(0, 0 + 16),
		chromaticScale.slice(7, 7 + 16),
		chromaticScale.slice(0, 0 + 16),
		chromaticScale.slice(7, 7 + 16),
		chromaticScale.slice(0, 0 + 16),		
	],
	[
		chromaticScale.slice(9, 9 + 16),
		chromaticScale.slice(2, 2 + 16),
		chromaticScale.slice(7, 7 + 16),
		chromaticScale.slice(0, 0 + 16),
	]
];

let stringSets = [
	[
		[2,1,0],
		[3,2,1],
		[4,3,2],
		[5,4,3],
	],
	[
		[2,1,0],
		[3,2,1],
		[4,3,2],
		[5,4,3],
	],
	[
		[2,1,0],
		[3,2,1],
	]
		
];

//  cello
// let stringSets = [
// 	[2,1,0],
// 	[3,2,1],
// ];
	
// let stringNotes = [
// 	chromaticScale.slice(9, 9 + 16),
// 	chromaticScale.slice(2, 2 + 16),
// 	chromaticScale.slice(7, 7 + 16),
// 	chromaticScale.slice(0, 0 + 16),
// ];