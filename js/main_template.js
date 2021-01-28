var scene, camera, renderer, cube;

function createGeometry() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial();
  cube = new THREE.Mesh(geometry, material);
}

var init = function() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false);
  createGeometry();
  scene.add( cube );
  camera.position.z = 5;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,0);
  controls.update();

}

var animate = function () {
  requestAnimationFrame( animate );

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render( scene, camera );
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  console.log(renderer.domElement.width, renderer.domElement.height);
}


init();
animate();

