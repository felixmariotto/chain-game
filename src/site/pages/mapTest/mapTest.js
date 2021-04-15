
import { elem } from '../../utils.js';
import loadingBox from '../../components/loadingBox/loadingBox.js';

//

const gamePage = elem({ id:'main-game-page' });

//

gamePage.start = function start() {

	loadingBox.setUploadingState( 50 );

	engine.core.init();

	engine.cameraControls.orbitObj( engine.core.scene );

	// physics tests

	const world = engine.physics.World();
	engine.core.scene.add( world );

	const map = engine.physics.Body();
	// map.damping = 0;

	// ground
	const ground = engine.physics.Box( 15, 1, 30 );
	ground.position.y -= 3;
	ground.rotation.x = -0.1;
	ground.makeHelper();

	// wall back
	const wallBack = engine.physics.Box( 15, 8, 1 );
	wallBack.position.z -= 7;
	wallBack.rotation.x = -0.4;
	wallBack.makeHelper();

	// wall front
	const wallFront = engine.physics.Box( 15, 8, 1 );
	wallFront.position.z = 15;
	wallFront.rotation.x = 0.4;
	wallFront.makeHelper();

	map.add( ground, wallBack, wallFront );

	// blade

	const bladeBox = engine.physics.Box( 5, 10, 1 );
	bladeBox.makeHelper();

	/*
	const bladeBody = engine.physics.Body( engine.KINEMATIC_BODY );
	bladeBody.rotation.x = Math.PI / 2;
	bladeBody.add( bladeBox );
	bladeBody.updateTransform = function ( time ) {

		this.position.y = Math.min( 0, Math.sin( time / 200 ) ) * 7;

	}
	*/

	const bladeBody = engine.physics.Body( engine.KINEMATIC_BODY );
	bladeBody.add( bladeBox );

	bladeBody.updateTransform = function ( time ) {

		// this.position.y = -2;
		// this.rotation.x = ( Math.sin( time / 500 ) * 0.3 ) + ( Math.PI / 2 );

		// this.position.set( 0, -3, -3 );
		// this.rotation.x = ( time / 700 ) % ( Math.PI * 2 );

		// this.rotation.x = Math.PI / 2;
		this.position.z = Math.min( 0, Math.sin( time / 300 ) ) * 7;

	}

	// sphere

	const sphere = engine.physics.Sphere();
	sphere.makeHelper();

	const sphereBody = engine.physics.Body( engine.DYNAMIC_BODY, 0.3 );
	sphereBody.position.y = 5;
	sphereBody.add( sphere );

	//

	world.add( map, sphereBody, bladeBody );

}

//

export default gamePage