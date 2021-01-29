var scene, camera, renderer, cube, cube2, cube3, ambient, composer;

function setupPostProcessing() {
  const renderPass = new POSTPROCESSING.RenderPass(scene, camera);
  composer.addPass(renderPass);

  // //LuminosityShader to add a grayscale rendering
  // const effectGrayScale = new POSTPROCESSING.ShaderPass( THREE.LuminosityShader );
  // composer.addPass( effectGrayScale );

  let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, cube, {
    resolutionScale: 1,
    density: 0.8,
    decay: 1,
    weight: 0.9,
    samples: 30
  });

  let scanlineEffect = new POSTPROCESSING.ScanlineEffect({
    blendFunction: POSTPROCESSING.BlendFunction.MULTIPLY,
    density: 2.0
  });
  scanlineEffect.blendMode.opacity.value = 0.025;

  //TODO: play with effects here
  let effectPass = new POSTPROCESSING.EffectPass(camera,godraysEffect, scanlineEffect);
  // let effectPass = new POSTPROCESSING.EffectPass(camera,godraysEffect);
  effectPass.renderToScreen = true;
  composer.addPass( effectPass );


}


function createBasicGeometryAndLights() {
  const geometry = new THREE.BoxGeometry();
  let material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0x7fc5f9,
    emissive: 0x25067,
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
  cube2.position.set(0.12, 0.68, -0.4);
  cube2.scale.set (1.5, 3, 1.62);

  cube3 = new THREE.Mesh(geometry, material2);
  cube3.position.set(0.12, 0.68, 1.7);
  cube3.scale.set (3, 3, 0.2);

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( directionalLight );
  directionalLight.target = cube;

  cube.name = 'cube';
  cube2.name = 'cube2';
  cube3.name = 'cube3';
  scene.add( cube );
  scene.add(cube2);
  scene.add(cube3);
  ambient = new THREE.AmbientLight(0xffffff, 0.3);  //color and intensity
  scene.add( ambient);
}

var init = function() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  composer = new POSTPROCESSING.EffectComposer(renderer);
  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );



  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false);
  createBasicGeometryAndLights();

  //setup post processing
  setupPostProcessing();

  camera.position.x = 0;
  camera.position.y = -5;
  camera.position.z = 1;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,0);
  controls.update();

}

var animate = function () {
  requestAnimationFrame( animate );

  cube.rotation.z += 0.01;


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

