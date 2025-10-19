// Populate controls that come from internal data structures

const keyChooser = document.getElementById("keyChooser");
const majMinChooser = document.getElementById("majMinChooser");
const stringSetChooser = document.getElementById("stringSetChooser");
const tuningChooser = document.getElementById("tuningChooser");
const typeChooser = document.getElementById("typeChooser");
const legend = document.querySelector('.legend');

for (let index = 0; index < NoteNames.length; index++) {
	keyChooser.options[keyChooser.options.length] = new Option(
		NoteNames[index],
		index
	);
}
keyChooser.selectedIndex = NoteNames.indexOf("C");

majMinChooser.selectedIndex = 0;

for (let key of Object.keys(StringSets)) {
    const index = Object.keys(StringSets).indexOf(key);
    stringSetChooser.options[stringSetChooser.options.length] = new Option(
        key,
        index
    );
}
stringSetChooser.selectedIndex = 0;

for (let key of Object.keys(Tunings)) {
    const index = Object.keys(Tunings).indexOf(key);
    tuningChooser.options[tuningChooser.options.length] = new Option(
        key,
        index
    );
}
tuningChooser.selectedIndex = 0;

typeChooser.options[typeChooser.options.length] = new Option(
	"diatonic",
	0
);
for (let key of Object.keys(TriadTypes)) {
    const index = Object.keys(TriadTypes).indexOf(key);
    typeChooser.options[typeChooser.options.length] = new Option(
        key,
        index+1
    );
}
typeChooser.selectedIndex = 0;


function download() {
    //create a new canvas for drawing
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
	context.fillStyle = "#cac8c5"
	context.fillRect(0,0,newCanvas.width, newCanvas.height)
	
    //apply the old canvas to the new one
	context.drawImage(backCanvas, 0, 0);
    context.drawImage(canvas, 0, 0);
	context.drawImage(chordCanvas, 0, 0);
	var link = document.createElement('a');
	link.download = 'triads.png';
	link.href = newCanvas.toDataURL()
	link.click()
}

function alignLegendToBoards(){
	if(!legend || !boards.length){
		return;
	}
	const containerWidth = container.getBoundingClientRect().width;
	const minY = Math.min(...boards.map((board) => board.y));
	const topRowBoards = boards.filter((board) => Math.abs(board.y - minY) < 0.5);
	const referenceBoard = topRowBoards.reduce((rightmost, board) => {
		if (!rightmost || board.x > rightmost.x) {
			return board;
		}
		return rightmost;
	}, null);
	if(!referenceBoard){
		return;
	}
	const rightEdge = referenceBoard.x + protoBoard.width - protoBoard.stringSpace/2;
	const offset = Math.max(containerWidth - rightEdge, 0);
	legend.style.marginRight = `${offset}px`;
}

function fullTriadSet(key, scaleType, strings){	
	// Get the value from typeChooser. If it's non-zero, then get the text value
	// as we will use that to determine which triad type to draw.
	const typeIndex = typeChooser.selectedIndex;
	const isDiatonic = typeIndex === 0;
	if (!isDiatonic) {
		triadType = typeChooser.options[typeIndex].text;
	}

	let scale = getScale(key, scaleType);
	highLightStringSet(strings);
	scale.pop(); // Discard octave note off the end
	scale.forEach( (root, index) => {
		if (isDiatonic) {
			if (scaleType === "maj") {
				if( [0,3,4].indexOf(scale.indexOf(root)) > -1 ) {
					sketchTriad(boards[index],  strings, root, "maj", 0, "red");
					sketchTriad(boards[index],  strings, root, "maj", 1, "purple");
					sketchTriad(boards[index],  strings, root, "maj", 2, "blue");
				} else if(scale.indexOf(root) === 6 ) {
					sketchTriad(boards[index],  strings, root, "dim", 0, "red");
					sketchTriad(boards[index],  strings, root, "dim", 1, "purple");
					sketchTriad(boards[index],  strings, root, "dim", 2, "blue");
				} else {
					sketchTriad(boards[index],  strings, root, "min", 0, "red");
					sketchTriad(boards[index],  strings, root, "min", 1, "purple");
					sketchTriad(boards[index],  strings, root, "min", 2, "blue");
				}
			}
			else {
				if( [2,5,6].indexOf(scale.indexOf(root)) > -1 ) {
					sketchTriad(boards[index], strings, root, "maj", 0, "red");
					sketchTriad(boards[index], strings, root, "maj", 1, "purple");
					sketchTriad(boards[index], strings, root, "maj", 2, "blue");
				} else if(scale.indexOf(root) === 1 ) {
					sketchTriad(boards[index], strings, root, "dim", 0, "red");
					sketchTriad(boards[index], strings, root, "dim", 1, "purple");
					sketchTriad(boards[index], strings, root, "dim", 2, "blue");
				} else {
					sketchTriad(boards[index], strings, root, "min",0, "red");
					sketchTriad(boards[index], strings, root, "min",1, "purple");
					sketchTriad(boards[index], strings, root, "min",2, "blue");
				}
			}
		} else {
			sketchTriad(boards[index], strings, root, triadType, 0, "red");
			sketchTriad(boards[index], strings, root, triadType, 1, "purple");
			sketchTriad(boards[index], strings, root, triadType, 2, "blue");
		}
	});

	ctx.fillStyle = "#3e4444";
	ctx.font = 'bold 26px serif';
	if (scaleType === "maj") {
		labels = [`${scale[0]} (I)`, `${scale[1]}m (ii)`, `${scale[2]}m (iii)`, `${scale[3]} (IV)`, `${scale[4]} (V)`, `${scale[5]}m (vi)`, `${scale[6]}\xB0 (vii)`]
	} else {
		labels = [`${scale[0]}m (i)`, `${scale[1]}\xB0 (ii)`, `${scale[2]} (III)`, `${scale[3]}m (iv)`, `${scale[4]}m (v)`, `${scale[5]} (VI)`, `${scale[6]} (VII)`]
	}
	labels.forEach((label, index) => {
		ctx.font = 'bold 26px serif';
		const labelY = boards[index].y - protoBoard.fretSpace*1.2;
		const labelX = boards[index].x - protoBoard.stringSpace/2 + protoBoard.width/2;
		ctx.fillText(label, labelX, labelY)	
	}) 
	ctx.textAlign = "center";
}

function updateScaleandTriads() {
	activeTuning = Tunings[ tuningChooser.options[tuningChooser.selectedIndex].text ];
	layoutBoards()
	refreshScale()
	chordCtx.clearRect(0,0,chordCanvas.width, chordCanvas.height)
	const scaleType = (majMinChooser.selectedIndex === 0) ? "maj" : "min"
	const key = keyChooser.options[keyChooser.selectedIndex].text;
	const strings = StringSets[ stringSetChooser.options[stringSetChooser.selectedIndex].text ];
	fullTriadSet(key, scaleType, strings)
	// Draw open string notes on top of everything else
	boards.forEach(board => {
		drawOpenStringNotes(board)
	})
	alignLegendToBoards()
}

updateScaleandTriads()

window.addEventListener('resize', updateScaleandTriads);
