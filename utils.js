console.clear();


const canvas = document.getElementById("cancan");
const container = document.getElementById("container");

const BOARD_WIDTH = 160;
const BOARD_HEIGHT = 520;
const HORIZONTAL_GAP = 24;
const VERTICAL_GAP = 80;
const TOP_MARGIN = 100;
const BOTTOM_MARGIN = 90;

const rect = container.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height;
const ctx = canvas.getContext("2d");

const backCanvas = document.getElementById("backcan");
const backCtx = backCanvas.getContext("2d");
backCanvas.width = rect.width;
backCanvas.height = rect.height;

const chordCanvas = document.getElementById("chordcan");
chordCanvas.width = rect.width;
chordCanvas.height = rect.height;
const chordCtx = chordCanvas.getContext("2d");
chordCtx.textBaseline = "middle";
chordCtx.textAlign = "center";


ctx.textBaseline = "middle";
ctx.textAlign = "center";
ctx.fillStyle = "#cac8c5"
ctx.fillRect(0,0,canvas.width,canvas.height)

const keyChooser = document.getElementById("keyChooser");
const majMinChooser = document.getElementById("majMinChooser");
const stringSetChooser = document.getElementById("stringSetChooser");
for (let index = 0; index < 12; index++) {
	keyChooser.options[keyChooser.options.length] = new Option(
		chromaticScale[index],
		index
	);
}
keyChooser.selectedIndex = 7;
majMinChooser.selectedIndex = 0;

const ACTIVE_TUNING_INDEX = 0;
const tuningStrings = stringNotes[ACTIVE_TUNING_INDEX];
const tuningStringSets = stringSets[ACTIVE_TUNING_INDEX];

let protoBoard = {
	width: BOARD_WIDTH,
	height: BOARD_HEIGHT,
	stringSpace: BOARD_WIDTH/tuningStrings.length,
	fretSpace: BOARD_HEIGHT/15,
	colors: {
		fretboard: "beige",
		dots: "lightgrey",
		roots: "darkgrey",
		shadowDots: "green",
		shadowRoots: "blue",
		frets: "brown",
		strings: "darkblue",
		fretNums: "grey",
		notes: "#8e8888",
		noteLabels: "#555555"
	}
};

function getScale(root, majOrMin, parts){
	let start = chromaticScale.indexOf(root);
	let newScale = [];
	newScale.push(root);
	for (let i = 0; i < steps[majOrMin][parts].length; i++) {
		newScale.push(chromaticScale[start + steps[majOrMin][parts][i]]);
	}	
	return newScale;
};

function makeFretboard(x,y){
	let b = {}
	b.x = x
	b.y = y	
	b.draw = ()=>{
		ctx.lineWidth = 0.5;
	ctx.globalAlpha = 1;
	ctx.fillStyle = protoBoard.colors.fretboard;
	ctx.fillRect(
		b.x - protoBoard.stringSpace / 2,
		b.y,
		protoBoard.width,
		protoBoard.height
	);
	ctx.drawImage(backCanvas, 0, 0);
	ctx.strokeStyle = protoBoard.colors.strings;
	for (let i = 0; i <= tuningStrings.length-1; i++) {		
		ctx.beginPath();
		ctx.moveTo(b.x + protoBoard.stringSpace * i, b.y);
		ctx.lineTo(b.x + protoBoard.stringSpace * i, b.y + protoBoard.height);
		ctx.stroke();
	}
	ctx.strokeStyle = protoBoard.colors.frets;
	let boldFrets = [0,3,5,7,9,12]

	for (let i = 0; i <= 15; i++) {
		ctx.beginPath();
		if(boldFrets.indexOf(i) > -1 ){
			ctx.lineWidth = 1.5
		}else{
			ctx.lineWidth = .5
		}
		ctx.moveTo(
			b.x- protoBoard.stringSpace / 2,
			b.y + protoBoard.fretSpace * i
		);
		ctx.lineTo(
			b.x + protoBoard.width - protoBoard.stringSpace / 2,
			b.y + protoBoard.fretSpace * i
		);
		ctx.stroke();
	}
	ctx.fillStyle = protoBoard.colors.fretNums;
	ctx.font = '600 16px "Segoe UI", Arial, sans-serif';
	["3", "5", "7", "9", "12"].forEach((num) => {
		ctx.fillText(
			num,
			b.x - 1.1 * protoBoard.stringSpace,
			b.y + protoBoard.fretSpace * num
		);
	});
	}
	return b
}

function drawOpenStringNotes(board){
	tuningStrings.forEach((string, index)=>{
		const openNote = string[0];
		const str = tuningStrings.length-1-index;
		const x = protoBoard.stringSpace*str+board.x;
		const y = board.y - protoBoard.fretSpace*0.3;
			ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
			ctx.fillStyle = protoBoard.colors.noteLabels;
			ctx.fillText(openNote, x, y);
	});
}

const boards = Array.from({ length: 7 }, () => makeFretboard(0, 0));

function layoutBoards(){
	const rect = container.getBoundingClientRect();
	const containerWidth = Math.max(rect.width, BOARD_WIDTH);
	protoBoard.stringSpace = protoBoard.width / tuningStrings.length;
	protoBoard.fretSpace = protoBoard.height / 15;
	let boardsPerRow = Math.min(boards.length, Math.max(1, Math.floor((containerWidth + HORIZONTAL_GAP) / (protoBoard.width + HORIZONTAL_GAP))));
	if (boardsPerRow < 1) {
		boardsPerRow = 1;
	}
	const totalRowWidth = boardsPerRow * protoBoard.width + (boardsPerRow - 1) * HORIZONTAL_GAP;
	const startX = Math.max((containerWidth - totalRowWidth) / 2, 0);
	boards.forEach((board, index) => {
		const row = Math.floor(index / boardsPerRow);
		const col = index % boardsPerRow;
		const left = startX + col * (protoBoard.width + HORIZONTAL_GAP);
		board.x = left + protoBoard.stringSpace / 2;
		board.y = TOP_MARGIN + row * (protoBoard.height + VERTICAL_GAP);
	});
	const rows = Math.ceil(boards.length / boardsPerRow);
	const canvasHeight = TOP_MARGIN + rows * protoBoard.height + Math.max(0, rows - 1) * VERTICAL_GAP + BOTTOM_MARGIN;
	const canvasWidth = containerWidth;
	[canvas, backCanvas, chordCanvas].forEach((c) => {
		c.width = canvasWidth;
		c.height = canvasHeight;
		const context = c.getContext("2d");
		context.clearRect(0, 0, c.width, c.height);
		c.style.width = `${canvasWidth}px`;
		c.style.height = `${canvasHeight}px`;
	});
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	chordCtx.textBaseline = "middle";
	chordCtx.textAlign = "center";
	container.style.height = `${canvasHeight}px`;
}

function refreshScale(){
	ctx.fillStyle = "#cac8c5";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	boards.forEach(board => {
		board.draw()
		drawOpenStringNotes(board)
	})		
}



//---------------------------------------

function showNote(board, string, fret, color, noteLabel, ctx) {
	if(!ctx){
		ctx = chordCtx
	}
	const stringIndex = tuningStrings.length-string;
	const x = protoBoard.stringSpace*stringIndex+board.x;
	const y = protoBoard.fretSpace*fret+board.y-protoBoard.fretSpace*.3;
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.globalAlpha = 1;
	ctx.arc(x,y,12, 0, 6.5, 0);
	ctx.stroke();
	if(fret !== 0){
		ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
		ctx.fillStyle = protoBoard.colors.noteLabels;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(noteLabel, x, y);
	}
}

function sketchTriad(board, root, stringSet, inversion, color){
	stringSet -= 1
	let notes = []
	inversion.forEach((inversion, index)=>{
		let npos = chromaticScale.indexOf(root) + inversion
		let note = chromaticScale[npos]		
		let string = tuningStringSets[stringSet][index]
		let stringPos = tuningStrings[string].indexOf(note)		
		notes.push(stringPos)
	})
	let smallNotes = notes.filter(e => e<4)
	let largeNotes = notes.filter(e => e>6)
	
	//fix 2 low 1 high
	inversion.forEach((inver, index)=>{
		if(smallNotes.length === 2 && largeNotes.length ===1){
			smallNotes.forEach((note, ii)=>{
				if(note < 5){
					smallNotes[ii] += 12
					notes[ii] += 12
				}
			})
		}
	})

	//fix 1 low 2 high
	inversion.forEach((inver, index)=>{
		if(smallNotes.length === 1 && largeNotes.length ===2){
			smallNotes.forEach((note, ii)=>{
				if(note < 5){
					smallNotes[smallNotes.indexOf(note)] += 12
					notes[notes.indexOf(note)] += 12
				}
			})
		}
	})
	
	smallNotes = notes.filter(n => n < 4)
	inversion.forEach((inversion, index)=>{
		let npos = chromaticScale.indexOf(root) + inversion
		let note = chromaticScale[npos]
		let string = tuningStringSets[stringSet][index]
		let stringPos = tuningStrings[string].indexOf(note)
		if(smallNotes.length === 3){
			showNote(board, string+1, notes[index]+12, color, note)	
		}		
		showNote(board, string+1, notes[index], color, note)
	})
}

function sketchMajorTriad(board, stringSet, root, inversion, color) {	
	let inversions = [
		[0, 4, 7],
		[7, 0, 4],
		[4, 7, 0]
	];
	sketchTriad(board, root, stringSet, inversions[inversion], color)
}
function sketchMinorTriad(board, stringSet, root, inversion, color) {	
	let inversions = [
		[0, 3, 7],
		[7, 0, 3],
		[3, 7, 0]
	];
	sketchTriad(board, root, stringSet, inversions[inversion], color)
}
function sketchDimChord(board, stringSet, root, inversion, color) {	
	let inversions = [
		[0, 3, 6],
		[6, 0, 3],
		[3, 6, 0]
	];
	sketchTriad(board, root, stringSet, inversions[inversion], color)
}
