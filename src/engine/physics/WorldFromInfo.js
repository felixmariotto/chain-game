
import * as THREE from 'three';

import core from '../core/core.js';
import constants from '../misc/constants.js';

import World from './workerObjects/World.js';
import Body from './workerObjects/Body.js';
import Box from './workerObjects/Box.js';
import Sphere from './workerObjects/Sphere.js';
import Cylinder from './workerObjects/Cylinder.js';
import Chain from './workerObjects/Chain.js';
import ChainPoint from './workerObjects/ChainPoint.js';
import Player from './workerObjects/Player.js';

import Entity from './Entity.js';

//

export default function WorldFromInfo( info ) {

	info.serialCounter = 0;

	// create a shallow world. In this main thread world we compute no physics,
	// but we update entities position and state every time the worker send a
	// message.

	const world = World();

	core.scene.add( world );

	// we create one entity for each body in the physical world

	const entities = info.bodies.map( (bodyInfo) => {

		bodyInfo.serial = info.serialCounter;
		info.serialCounter ++;

		const entity = Entity( bodyInfo );

		world.add( entity );

		entity.makeHelper();

		return entity

	} );




	const clock = new THREE.Clock();
	const targetDt = 1 / 60;
	let positions = new Float32Array( info.serialCounter * 3 );
	const worker = this.worker;

	postMessage();

	function postMessage() {

		worker.postMessage( { positions }, [ positions.buffer ] );

	}

	worker.onmessage = function (e) {

		positions = e.data.positions;

		const dt = clock.getDelta();

		const delay = Math.max( 0, ( targetDt - dt ) * 1000 );

		entities.forEach( entity => entity.updateFromArr( positions ) );

		setTimeout( postMessage, delay );

	}










	/*

	// bodies

	const bodies = info.bodies.map( (bodyInfo) => {

		let bodyType = constants.STATIC_BODY;
		const tags = bodyInfo.tags ? JSON.parse( bodyInfo.tags ) : undefined;

		if ( bodyInfo.trans && bodyInfo.trans.length > 0 ) {

			bodyType = constants.KINEMATIC_BODY;

		} else if ( tags && tags.isDynamic ) {

			bodyType = constants.DYNAMIC_BODY;

		}

		const body = Body(
			bodyType,
			( tags && tags.weight ) ? tags.weight : undefined,
			( tags && tags.mass ) ? tags.mass : undefined
		);

		if ( bodyInfo.trans ) {

			body.transformFunction = Function( 'time', bodyInfo.trans );

		}

		if ( tags && tags.constraint ) {

			tags.constraint = new THREE.Vector3().set(
				tags.constraint[0],
				tags.constraint[1],
				tags.constraint[2]
			);

		}

		// precompute the min and max vector according to the constraint
		
		if ( tags && tags.range ) {

			if ( !tags.constraint ) console.error('body must have a constraint to have a range')

			tags.range[0] = new THREE.Vector3()
			.copy( tags.constraint )
			.normalize()
			.multiplyScalar( tags.range[0] )

			tags.range[1] = new THREE.Vector3()
			.copy( tags.constraint )
			.normalize()
			.multiplyScalar( tags.range[1] )

		}

		// make a vector if the body must have a force

		if ( tags && tags.force ) {

			body.force = new THREE.Vector3(
				tags.force[0],
				tags.force[1],
				tags.force[2]
			);

		}

		// prepare the switch recorded position as "on" and "off"

		if (
			tags &&
			tags.range &&
			tags.force &&
			tags.isSwitch
		) {

			const arr = tags.range
			.slice(0)
			.sort( (a,b) => {
				return a.distanceTo( body.force ) - b.distanceTo( body.force )
			} );

			tags.switchPositions = {
				on: new THREE.Vector3().copy( arr[0] ),
				off: new THREE.Vector3().copy( arr[1] )
			};

		}

		//

		body.name = bodyInfo.name;

		if ( bodyInfo.tags ) body.tags = tags;

		//

		bodyInfo.shapes.forEach( (shapeInfo) => {

			let shape;

			switch ( shapeInfo.type ) {

				case 'box' :
					shape = Box( shapeInfo.width, shapeInfo.height, shapeInfo.depth );
					shape.makeHelper();
					break

				case 'sphere' :
					shape = Sphere( shapeInfo.radius );
					shape.makeHelper();
					break

				case 'cylinder' :
					shape = Cylinder( shapeInfo.radius, shapeInfo.height );
					shape.makeHelper();
					break

			}

			shape.position.copy( shapeInfo.pos );
			shape.rotation.copy( shapeInfo.rot );

			body.add( shape );

			// add only the static bodies in a spatial index to
			// speed up the collision detection with dynamic bodies.

			if ( bodyType === constants.STATIC_BODY ) {

				world.spatialIndex.addShape( shape );

			}

		} );

		//

		world.add( body );

		return body

	} );

	// when all the static bodies are added to the world,
	// we compute the spatial index nodes.

	world.spatialIndex.computeTree();

	// player

	const player = Player();

	player.position.set(
		Number( info.player.x ),
		Number( info.player.y ),
		Number( info.player.z )
	);

	world.add( player );

	// chain points

	info.chainPoints.forEach( (cpInfo) => {

		const chainPoint = ChainPoint();

		chainPoint.chainLength = Number( cpInfo.length );
		chainPoint.radius = Number( cpInfo.radius );

		chainPoint.makeHelper();

		chainPoint.position.set(
			Number( cpInfo.x ),
			Number( cpInfo.y ),
			Number( cpInfo.z )
		);

		world.chainPoints.push( chainPoint );

		if ( cpInfo.bodyName.length ) {

			world.getObjectByName( cpInfo.bodyName ).add( chainPoint )

		} else {

			world.add( chainPoint );

		}

		if ( cpInfo.init ) {

			const newChain = chainPoint.makeChain( player );

			world.chains.push( newChain );

			world.add( ...newChain.spheres );

		}

	} );

	*/

	//

	return {
		world
	}

}
