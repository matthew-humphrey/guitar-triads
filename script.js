function cloneCanvas() {
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

const selectionSummary = document.getElementById("selectionSummary");
const legend = document.querySelector('.legend');

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


function highLightSet(start, num){
	num = num-1
	ctx.fillStyle = "orange"
	ctx.globalAlpha = .1
	boards.forEach(board =>{
		ctx.fillRect(board.x+protoBoard.stringSpace*(tuningStrings.length-start) ,board.y,-1*protoBoard.stringSpace*num,protoBoard.height)	
	})
	ctx.globalAlpha = 1	
}


function fullTriadSetMajor(key, set){	
	let scale = getScale(key,0)
	keyChooser.selectedIndex = chromaticScale.indexOf(key);
	highLightSet(set,3)
	scale.pop()
	scale.forEach( (note, index) => {
		if( [0,3,4].indexOf(scale.indexOf(note)) > -1 ){
			sketchMajorTriad(boards[index],set, note, 0, "red")
			sketchMajorTriad(boards[index],set, note, 1, "blue")
			sketchMajorTriad(boards[index],set, note, 2, "purple")				
		}else if(scale.indexOf(note) === 6 ){
			sketchDimChord(boards[index],set, note, 0, "red")
			sketchDimChord(boards[index],set, note, 1, "blue")
			sketchDimChord(boards[index],set, note, 2, "purple")				
		}else{			
			sketchMinorTriad(boards[index],set, note, 0, "red")
			sketchMinorTriad(boards[index],set, note, 1, "blue")
			sketchMinorTriad(boards[index],set, note, 2, "purple")					
		}				
	})
	if(selectionSummary){
		selectionSummary.textContent = `${scale[0]} Major - Triads on Strings ${set}, ${set+1}, ${set+2}`;
	}
	ctx.fillStyle = "#3e4444";
	ctx.font = 'bold 26px serif';
	labels = [`${scale[0]} (I)`, `${scale[1]}m (ii)`, `${scale[2]}m (iii)`, `${scale[3]} (IV)`, `${scale[4]} (V)`, `${scale[5]}m (vi)`, `${scale[6]}\xB0 (vii)`]
	labels.forEach((label, index) => {
		ctx.font = 'bold 26px serif';
		const labelY = boards[index].y - protoBoard.fretSpace*1.2;
		const labelX = boards[index].x - protoBoard.stringSpace/2 + protoBoard.width/2;
		ctx.fillText(label, labelX, labelY)	
	}) 
	ctx.textAlign = "center";
}
function fullTriadSetMinor(key, set){	
	let scale = getScale(key,1)
	keyChooser.selectedIndex = chromaticScale.indexOf(key);
	highLightSet(set,3)
	scale.pop()
	scale.forEach( (note, index) => {
		if( [2,5,6].indexOf(scale.indexOf(note)) > -1 ){
			sketchMajorTriad(boards[index],set, note, 0, "red")
			sketchMajorTriad(boards[index],set, note, 1, "blue")
			sketchMajorTriad(boards[index],set, note, 2, "purple")				
		}else if(scale.indexOf(note) === 1 ){
			sketchDimChord(boards[index],set, note, 0, "red")
			sketchDimChord(boards[index],set, note, 1, "blue")
			sketchDimChord(boards[index],set, note, 2, "purple")				
		}else{			
			sketchMinorTriad(boards[index],set, note, 0, "red")
			sketchMinorTriad(boards[index],set, note, 1, "blue")
			sketchMinorTriad(boards[index],set, note, 2, "purple")					
		}				
	})
	if(selectionSummary){
		selectionSummary.textContent = `${scale[0]} Minor - Triads on Strings ${set}, ${set+1}, ${set+2}`;
	}
	ctx.fillStyle = "#3e4444";
	ctx.font = 'bold 26px serif';
	labels = [`${scale[0]}m (i)`, `${scale[1]}\xB0 (ii)`, `${scale[2]} (III)`, `${scale[3]}m (iv)`, `${scale[4]}m (v)`, `${scale[5]} (VI)`, `${scale[6]} (VII)`]
	labels.forEach((label, index) => {
		ctx.font = 'bold 26px serif';
		const labelY = boards[index].y - protoBoard.fretSpace*1.2;
		const labelX = boards[index].x - protoBoard.stringSpace/2 + protoBoard.width/2;
		ctx.fillText(label, labelX, labelY)	
	}) 
	ctx.textAlign = "center";
}

function updateScaleandTriads(){
	layoutBoards()
	refreshScale()
	chordCtx.clearRect(0,0,chordCanvas.width, chordCanvas.height)
	if(majMinChooser.selectedIndex === 0){
		fullTriadSetMajor(keyChooser.options[keyChooser.selectedIndex].text, stringSetChooser.selectedIndex+1)
	}else{
		fullTriadSetMinor(keyChooser.options[keyChooser.selectedIndex].text, stringSetChooser.selectedIndex+1)
	}
	// Draw open string notes on top of everything else
	boards.forEach(board => {
		drawOpenStringNotes(board)
	})
	alignLegendToBoards()
}

keyChooser.selectedIndex = 0;
updateScaleandTriads()


window.addEventListener('resize', updateScaleandTriads);

console.log("..")
