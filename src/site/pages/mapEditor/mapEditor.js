
import { elem } from '../../utils.js';
import Button from '../../components/button/Button.js';
import './mapEditor.css';
import bodies from './bodies.js';
import shapes from './shapes.js';
import files from './files.js';

//

let transformControl;

const toolModules = [ bodies, shapes, files ];

//

const editorPage = elem({ id:'editor-page', classes: 'game-container' });

//

const leftContainer = elem({ id: 'editor-left-panel' });
const rightContainer = elem({ id: 'editor-right-panel' });

editorPage.append( leftContainer, rightContainer );

//

const editorConsole = elem({ id: 'editor-console', classes: 'ui-panel' });
const editorViewport = elem({ id: 'editor-viewport', classes: 'ui-panel' });

leftContainer.append( editorConsole, editorViewport );

//

const tools = elem({ id: 'editor-tools', classes: 'ui-panel' });
const toolsOptions = elem({ id: 'editor-tools-options', classes: 'ui-panel' });

rightContainer.append( tools, toolsOptions );

//

tools.append(
	makeToolButton( 'bodies', bodies ),
	makeToolButton( 'shapes', shapes ),
	makeToolButton( 'files', files )
);

function makeToolButton( name, toolModule ) {

	const button = Button( name );

	button.onclick = () => {

		if ( !toolModule.isEnabled ) {

			hideAllTools();

			toolModule.isEnabled = true;

			toolModule.domOptions.style.display = 'inherit';

		}

	}

	return button

}

function hideAllTools() {

	toolModules.forEach( tool => {

		tool.domOptions.style.display = 'none'

		tool.isEnabled = false;

	} );

}

//

toolsOptions.append(
	bodies.domOptions,
	shapes.domOptions,
	files.domOptions
);

//  EVENT LISTENERS

window.addEventListener( 'keydown', (e) => {

	switch ( e.keyCode ) {

		case 83 : switchTransformMode();

	}

} );

window.addEventListener( 'scene-graph-request', (e) => {

	const parsedBodies = bodies.bodies.map( (body) => {

		const parsedBody = {
			trans: body.transformCode
		};

		parsedBody.shapes = body.threeObj.children.map( (shape) => {

			switch ( shape.shapeType ) {

				case 'box':
					return {
						pos: shape.position,
						rot: shape.rotation,
						width: shape.scale.x,
						height: shape.scale.y,
						depth: shape.scale.z,
						type: 'box'
					}
				break

			}

		} );

		return parsedBody

	} );

	files.saveAsJSON( parsedBodies );

} );

window.addEventListener( 'scene-graph-loaded', (e) => {

	engine.core.scene.traverse( (child) => {

		if ( child.shapeType || child.isBody ) {

			child.material.dispose();
			child.geometry.dispose();

		}

	} );

	engine.core.scene.clear();

	engine.core.scene.add( transformControl );

	makeGrid();

	e.detail.forEach( (bodyInfo) => {

		const body = bodies.fromInfo( bodyInfo );

	} );

} );

// TRANSFORM CONTROLS

const transformModes = [ 'translate', 'rotate', 'scale' ];
let transformMode = 0;

function switchTransformMode() {

	if ( !transformControl ) return

	transformMode = ( transformMode + 1 ) % 3;

	transformControl.setMode( transformModes[ transformMode ] );

}

window.addEventListener( 'transform-shape', (e) => {

	transformControl.attach( e.detail );

} );

window.addEventListener( 'end-transform', (e) => {

	transformControl.detach();

} );

// INITIALIZATION

editorPage.start = function start() {

	engine.core.init( editorViewport );

	transformControl = new engine.TransformControls( engine.core.camera, editorViewport );
	transformControl.setSpace( 'local' );

	engine.core.scene.add( transformControl );

	//

	makeGrid();

	//

	const orbitControls = engine.cameraControls.orbitObj( engine.core.scene );

	transformControl.addEventListener( 'mouseDown', () => orbitControls.enabled = false );

	transformControl.addEventListener( 'mouseUp', () => orbitControls.enabled = true );

	//

	engine.core.listenClick( (intersects) => {

		const a = intersects.find( intersect => intersect.object.isEditorShape );

		if ( a ) shapes.selectShape( a.object );

	} );

	//

	engine.core.callInLoop( () => {

		bodies.bodies.forEach( (body) => {

			updateObject.call( body.threeObj, body.transformCode );

		} );

	} );

}

function updateObject( code ) {

	eval( code );

}

//

function makeGrid() {

	const size = 50;
	const divisions = 50;

	const gridHelper = new engine.THREE.GridHelper( size, divisions );
	const axesHelper = new engine.THREE.AxesHelper( size / 2 );

	engine.core.scene.add( gridHelper, axesHelper );

}

//

export default editorPage
