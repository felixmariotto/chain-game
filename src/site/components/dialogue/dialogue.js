
import './dialogue.css';
import { elem, icon } from '../../utils.js';

//

const dialogueContainer = elem({ id: 'dialogue-container' });
const dialogueFrame = elem({ id: 'dialogue-frame' });
const thumbnail = elem({ id: 'dialogue-thumbnail' });
const textContent = elem({ id: 'dialogue-text' });
const arrow = icon( 'fas fa-caret-down' );

dialogueContainer.append( dialogueFrame );
dialogueFrame.append( thumbnail, textContent );
textContent.append( arrow )

//

let currentStory, currentLine, currentChar, started, listeningNext;

function setTemplate( template ) {

	console.log( 'set template', template );

}

function readStory( story ) {

	currentStory = story;
	currentLine = 0;
	currentChar = 0;

	console.log( 'story', story );

}

function nextLine() {

	textContent.innerHTML = '';
	textContent.append( arrow );

	currentLine ++;
	currentChar = 0;

	if ( currentLine > currentStory.length - 1 ) {

		currentLine = 0;
		dialogueContainer.end();

	}

}

//

let isLoopOn = false;

function startLoop() {

	isLoopOn = true;

	loop();

}

function endLoop() { isLoopOn = false }

function loop() {

	if ( isLoopOn ) setTimeout( loop, 50 )

	if ( currentStory ) {

		const line = currentStory[ currentLine ];

		if ( currentChar > line.m.length - 1 ) {

			// show arrow
			// and listen for event

			listeningNext = true;

		} else {

			listeningNext = false;

			// print the current character

			textContent.append( line.m[ currentChar ] );

			// will print the next character on next loop call.

			currentChar ++;

		}

	}

}

//

dialogueContainer.start = function ( dialogueObj ) {

	if ( !started ) {

		engine.on( 'jump-key-down', () => {

			if ( listeningNext ) nextLine();

		} );

		engine.on( 'pull-key-down', () => {

			if ( listeningNext ) nextLine();

		} );

		engine.on( 'release-key-down', () => {

			if ( listeningNext ) nextLine();

		} );

		started = true;

	}

	startLoop();

	setTemplate( dialogueObj.template );

	readStory( dialogueObj.story );

	dialogueContainer.classList.add( 'active' );

}

dialogueContainer.end = function () {

	endLoop();

	dialogueContainer.classList.remove( 'active' );

	engine.levelManager.resume();

}

//

export default dialogueContainer
