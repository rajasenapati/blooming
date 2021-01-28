var scene, camera, renderer, cube, cube2,  ambient, composer;

function createBasicGeometryAndLights() {
  const geometry = new THREE.BoxGeometry();
  let material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0x7fc5f9,
    emissive: 0x25673d,
    emissiveIntensity: 0.4,
    metalness: 0.5, //0 for wood, 1 for metal. Default0.5
    roughness: 0.3 // 0 for smooth mirror reflection, 1 for fully defuse
  })

  let material2 = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0xff0000,
    emissive: 0x25673d,
    emissiveIntensity: 0.4,
    metalness: 0.5, //0 for wood, 1 for metal. Default0.5
    roughness: 0.3 // 0 for smooth mirror reflection, 1 for fully defuse
  })

  cube = new THREE.Mesh(geometry, material);
  cube2 = new THREE.Mesh(geometry, material2);
  cube2.position.set(0.5, 0.5, -2);
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( directionalLight );
  directionalLight.target = cube;

  cube.name = 'cube';
  cube2.name = 'cube2';
  scene.add( cube );
  scene.add(cube2);
  ambient = new THREE.AmbientLight(0xffffff, 0.3);  //color and intensity
  scene.add( ambient);
}

var init = function() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  composer = new THREE.EffectComposer(renderer);
  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );

  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  //add an OPTIONAL film pass to add scanlines
  const filmPass = new THREE.FilmPass(1, 0.3, 1024, false);
  composer.addPass(filmPass);

  //add badTVshader to add distortions
  const badTVPass = new THREE.ShaderPass(THREE.BadTVShader);
  badTVPass.uniforms.distortion.value = 1.9;
  badTVPass.uniforms.distortion2.value = 1.2;
  badTVPass.uniforms.speed.value = 0.1;
  badTVPass.uniforms.rollSpeed.value = 0;
  badTVPass.renderToScreen = true;
  composer.addPass(badTVPass);

  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false);
  createBasicGeometryAndLights();

  camera.position.z = 5;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,0);
  controls.update();

}

var animate = function () {
  requestAnimationFrame( animate );

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  cube2.rotation.x -= 0.01;
  cube2.rotation.y -= 0.01;

  // renderer.render( scene, camera );
  composer.render();
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );
  console.log(renderer.domElement.width, renderer.domElement.height);
}


init();
animate();

