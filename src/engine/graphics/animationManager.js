
import * as THREE from 'three';

import core from '../core/core.js';
import input from '../misc/input.js';

//

const FORWARD = new THREE.Vector3( 0, 0, -1 );

const _v0 = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const targetDirection = new THREE.Vector3();

const animationManager = {
	animateLevel,
	animate
};

core.callInLoop( ( delta ) => animationManager.animate( delta ) );

export default animationManager

//

function animateLevel( level ) {

	this.level = level;
	this.player = level.world.player;

}

//

function animate( delta ) {

	if ( this.level ) {

		_v0
		.copy( core.camera.position )
		.sub( this.player.position )
		.setY( 0 );

		let angle = _v0.angleTo( FORWARD );

		_v1.crossVectors( _v0, FORWARD );

		if ( _v1.dot( this.player.up ) < 0 ) angle = -angle;

		// get world direction

		targetDirection
		.set( -input.targetDirection.x, 0, -input.targetDirection.y )
		.applyAxisAngle( this.player.up, -angle )
		.add( this.player.position );

		this.player.lookAt( targetDirection );

	}

}