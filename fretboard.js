
let activeTuning = StandardTuning;

const canvas = document.getElementById("cancan");
const container = document.getElementById("container");

const BOARD_FRET_LENGTH = 16;
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


let protoBoard = {
	width: BOARD_WIDTH,
	height: BOARD_HEIGHT,
	stringSpace: BOARD_WIDTH/activeTuning.length,
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
	for (let i = 0; i <= activeTuning.length-1; i++) {
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
	activeTuning.forEach((openNote, index)=>{
		const x = protoBoard.stringSpace*index+board.x;
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
	protoBoard.stringSpace = protoBoard.width / activeTuning.length;
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
	})		
}

function highLightStringSet(strings){

	boards.forEach(board =>{
		strings.forEach(string =>{
			const stringIndex = activeTuning.length - string - 1;
			const x = protoBoard.stringSpace*stringIndex+board.x;
			ctx.fillStyle = "orange";
			ctx.globalAlpha = .2;
			ctx.fillRect(x - protoBoard.stringSpace / 2, board.y, protoBoard.stringSpace, protoBoard.height);
			ctx.globalAlpha = 1;
		});
	});
	ctx.globalAlpha = 1;
}

function showNote(board, string, fret, color, noteLabel, ctx, chordRoot) {
	if(!ctx){
		ctx = chordCtx
	}
	const stringIndex = activeTuning.length - string - 1;
	const x = protoBoard.stringSpace*stringIndex+board.x;
	const y = protoBoard.fretSpace*fret+board.y-protoBoard.fretSpace*.3;
	
	// Check if this note matches the chord root
	const isRootNote = chordRoot && noteLabel === chordRoot;
	
	// Draw background circle with same color as string area shading
	ctx.beginPath();
	ctx.fillStyle = "#f5d4a6"; // Solid color that matches 10% orange over beige background
	ctx.globalAlpha = 1;
	ctx.arc(x,y,12, 0, 6.5, 0);
	ctx.fill();
	
	// Draw the note circle outline with thicker line for root notes
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = isRootNote ? 5 : 3; // Thicker line for root notes
	ctx.globalAlpha = 1;
	ctx.arc(x,y,12, 0, 6.5, 0);
	ctx.stroke();
	
	// Always draw the note label (including for fret 0/open strings)
	ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
	ctx.fillStyle = protoBoard.colors.noteLabels;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(noteLabel, x, y);
}

function isOpenVoice(strings) {
	// Iterate over strings and return true if strings are not adjacent
	for (let i = 1; i < strings.length; i++) {
		if (strings[i] !== strings[i - 1] + 1) {
			return true;
		}
	}
	return false;
}

function sketchTriad(board, strings, root, triadType, inversion, color) {
	const open = isOpenVoice(strings);
	const triads = findTriads(root, triadType, strings, inversion, open, activeTuning, BOARD_FRET_LENGTH);

	triads.forEach((triad, index) => {
		triad.forEach((fret, stringIndex) => {
			const string = strings[stringIndex];
			const noteName = getNoteNameAtPosition(activeTuning, string, fret)
			showNote(board, string, fret, color, noteName, undefined, root)
		});
	});
}

