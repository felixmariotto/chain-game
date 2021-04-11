
import * as THREE from 'three';
import params from '../../../params.js';
import collisions from './collisions.js';

//

export default function Box( width=1, height=1, depth=1 ) {

	const vectors = [];

	for ( let i=0 ; i<8 ; i++ ) {

		vectors.push( new THREE.Vector3() );

	}

	vectors[ 0 ].set( width / 2, height / 2, depth / 2 );
	vectors[ 1 ].set( -width / 2, height / 2, depth / 2 );
	vectors[ 2 ].set( width / 2, height / 2, -depth / 2 );
	vectors[ 3 ].set( -width / 2, height / 2, -depth / 2 );
	vectors[ 4 ].set( width / 2, -height / 2, depth / 2 );
	vectors[ 5 ].set( -width / 2, -height / 2, depth / 2 );
	vectors[ 6 ].set( width / 2, -height / 2, -depth / 2 );
	vectors[ 7 ].set( -width / 2, -height / 2, -depth / 2 );

	//

	function makeHelper() {

		const mesh = new THREE.Mesh(
			new THREE.BoxGeometry( this.width, this.height, this.depth ),
			params.helpersMaterial
		);

		this.add( mesh );

		return mesh

	}

	//

	function collideWith( colliderShape, targetVec ) {

		if ( colliderShape.type === 'box' ) {

			return collisions.boxBox( this, colliderShape, targetVec );

		}

	}

	//

	return Object.assign(
		Object.create( new THREE.Object3D ),
		{
			width,
			height,
			depth,
			vectors,
			type: 'box',
			makeHelper,
			collideWith
		}
	);

}