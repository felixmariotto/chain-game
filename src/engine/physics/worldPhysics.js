
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

import threeCore from '../core/threeCore.js';

// Add the raycast function. Assumes the BVH is available on
// the `boundsTree` variable
THREE.Mesh.prototype.raycast = acceleratedRaycast;

//

// number of simulation steps per graphic frame
const TICKS_PER_FRAME = 5;
const MAX_TICKS_PER_FRAME = 15;

const GRAVITY = new THREE.Vector3( 0, -0.00005, 0 );

const playerVelocity = new THREE.Vector3();

let playerIsOnGround = false;
const _vec1 = new THREE.Vector3();
const _vec2 = new THREE.Vector3();
const _box = new THREE.Box3();
const _mat = new THREE.Matrix4();
const _line = new THREE.Line3();

let ticks, speedRatio;
let environment, playerCapsule;

//

function setEnvironmentGeom( geometry ) {

	geometry = geometry.clone();

	geometry.boundsTree = new MeshBVH( geometry );

	environment = new THREE.Mesh( geometry );

	/*
	const collider = new THREE.Mesh( environmentGeom, new THREE.MeshBasicMaterial() );
	collider.material.wireframe = true;
	threeCore.scene.add( collider );
	*/

}

function makePlayerCapsule( radius, height ) {

	const geometry = new RoundedBoxGeometry(
		radius * 2, // width
		height,
		radius * 2, // depth
		16, // segments
		radius
	)

	geometry.translate( 0, height * 0.5, 0 );

	geometry.boundsTree = new MeshBVH( geometry );

	playerCapsule = new THREE.Mesh( geometry );

	playerCapsule.capsuleInfo = {
		radius: radius,
		segment: new THREE.Line3( new THREE.Vector3(), new THREE.Vector3( 0, 1.0, 0.0 ) )
	};

	// helper

	playerCapsule.material = new THREE.MeshBasicMaterial({
		transparent: true,
		opacity: 0.5
	});

	threeCore.scene.add( playerCapsule );

	return playerCapsule

}

//

function updatePhysics( delta ) {

	speedRatio = delta / ( ( 1 / 60 ) / TICKS_PER_FRAME );
	speedRatio = Math.min( speedRatio, 2 );

	// add gravity to objects velocity

	playerVelocity.addScaledVector( GRAVITY, speedRatio );

	// update objects position

	if ( playerCapsule ) {

		playerCapsule.position.addScaledVector( playerVelocity, speedRatio );

		playerCapsule.updateMatrix();

		playerCapsule.updateMatrixWorld();

	}

	// collide objects
	// blind paste from https://github.com/gkjohnson/three-mesh-bvh/blob/master/example/characterMovement.js

	if ( playerCapsule && environment ) {

		// adjust player position based on collisions
		const capsuleInfo = playerCapsule.capsuleInfo;
		_box.makeEmpty();
		_mat.copy( environment.matrixWorld ).invert();
		_line.copy( capsuleInfo.segment );

		_line.start.applyMatrix4( playerCapsule.matrixWorld ).applyMatrix4( _mat );
		_line.end.applyMatrix4( playerCapsule.matrixWorld ).applyMatrix4( _mat );

		_box.expandByPoint( _line.start );
		_box.expandByPoint( _line.end );

		_box.min.addScalar( - capsuleInfo.radius );
		_box.max.addScalar( capsuleInfo.radius );

		environment.geometry.boundsTree.shapecast(
			environment,
			box => box.intersectsBox( _box ),
			tri => {

				const triPoint = _vec1;
				const capsulePoint = _vec2;

				const distance = tri.closestPointToSegment( _line, triPoint, capsulePoint );

				if ( distance < capsuleInfo.radius ) {

					const depth = capsuleInfo.radius - distance;
					const direction = capsulePoint.sub( triPoint ).normalize();

					_line.start.addScaledVector( direction, depth );
					_line.end.addScaledVector( direction, depth );

				}

			}
		);

		const newPosition = _vec1;
		newPosition.copy( _line.start ).applyMatrix4( environment.matrixWorld );

		const deltaVector = _vec2;
		deltaVector.subVectors( newPosition, playerCapsule.position );

		playerCapsule.position.copy( newPosition );

		playerIsOnGround = deltaVector.y > Math.abs( delta * playerVelocity.y * 0.25 );

		if ( ! playerIsOnGround ) {

			deltaVector.normalize();
			playerVelocity.addScaledVector( deltaVector, - deltaVector.dot( playerVelocity ) );

		} else {

			playerVelocity.set( 0, 0, 0 );

		}

	}

}

/*
Register the update function to the game loop.
The update function calls updatePhysics several times per frame, in order
to avoid tunneling.
*/

threeCore.callInLoop( function ( delta ) {

	ticks = Math.round( ( delta / ( 1 / 60 ) ) * TICKS_PER_FRAME );

	ticks = Math.min( ticks, MAX_TICKS_PER_FRAME );

	for ( let i = 0 ; i < ticks ; i++ ) {

		updatePhysics( delta / ticks );

	};

});

//

export default {
	setEnvironmentGeom,
	makePlayerCapsule
}
