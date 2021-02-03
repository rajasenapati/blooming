var scene, camera, renderer, pyramid,  ambient, composer;

function setupPostProcessing() {
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);



  //add an OPTIONAL film pass to add scanlines
  const filmPass = new THREE.FilmPass(3.3, 0.7, 1024, false);
  composer.addPass(filmPass);

  //add a bloompass
  const bloomPass = new THREE.UnrealBloomPass(window.innerWidth / window.innerHeight, 1.8, .8, .3);
  composer.addPass(bloomPass);

  // const fxaaPass = new THREE.ShaderPass( THREE.FXAAShader );
  // composer.addPass(fxaaPass);
  // const shiftShaderPass = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
  // composer.addPass(shiftShaderPass);


  //add badTVshader to add distortions
  // const badTVPass = new THREE.ShaderPass(THREE.BadTVShader);
  // badTVPass.uniforms.distortion.value = 1.9;
  // badTVPass.uniforms.distortion2.value = 1.2;
  // badTVPass.uniforms.speed.value = 0.1;
  // badTVPass.uniforms.rollSpeed.value = 0;
  // badTVPass.renderToScreen = true;
  // composer.addPass(badTVPass);
}


function generateTexture() {
  const canvas = document.createElement( 'canvas' );
  canvas.width = 2;
  canvas.height = 4; //control intensity of the pyramid rays try something like 2, 4 or 12
  const context = canvas.getContext( '2d' );
  context.fillStyle = 'white';
  context.fillRect( 0, 1, 2, 1 );
  // context.fillRect( 0, 1, 1, 1 );
  // context.fillRect( 1, 0, 1, 1 );
  return canvas;
}

function generateText(txt) {
  var canvasTxt = window.canvasTxt.default;
  const canvas = document.createElement( 'canvas' );
  canvas.width = 300;
  canvas.height = 300;
  const context = canvas.getContext( '2d' );
  context.fillStyle = 'white';
  canvasTxt.fontSize = 20;
  canvasTxt.drawText(context,txt,50,60,200,200);
  return canvas;
}

var plane;
function createBasicGeometryAndLights() {

  const planeGeometry = new THREE.PlaneGeometry( 1, 1, 32 );
  let texture1 = new THREE.CanvasTexture( generateText("Hello World") );
  texture1.magFilter = THREE.NearestFilter;
  texture1.wrapT = THREE.ClampToEdgeWrapping;
  texture1.wrapS = THREE.ClampToEdgeWrapping;
  texture1.repeat.set( 1, 1 );
  const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    color:  0x7fc5f9,
    emissive: 0x25673d,
    emissiveIntensity: 0.85,
    alphaMap: texture1,
    alphaTest: 0.9,
    // map: texture1
  });
  plane = new THREE.Mesh( planeGeometry, planeMaterial );
  scene.add( plane );
  plane.scale.set(3, 3, 3);
  plane.position.set(3, 2, 0.5);

  const pyramidGeometry = new THREE.ConeGeometry( 5, 20, 6,1,true);

  let texture = new THREE.CanvasTexture( generateTexture() );
  texture.magFilter = THREE.NearestFilter;
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set( 1, 30 );

  let material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    color: 0x7fc5f9,
    emissive: 0x25673d,
    emissiveIntensity: 0.85,
    alphaMap: texture,
    alphaTest: 0.9
  })

  let material2 = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0x00ff00,
    emissive: 0x006700,
    emissiveIntensity: 0.2, //more value, more bloom.
    metalness: 1, //0 for wood, 1 for metal. Default0.5. more metalness, less bloom.
    roughness: 1 // 0 for smooth mirror reflection, 1 for fully defuse
  })

  pyramid = new THREE.Mesh(pyramidGeometry, material);
  pyramid.position.set(0.76, 0.46, -2.08);
  pyramid.scale.set(0.30, 0.30, 0.30);
  pyramid.rotation.set(2.84, 0.12, 1.24);
  pyramid.name = 'pyramid';
  // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  // scene.add( directionalLight );
  // directionalLight.target = pyramid;

  scene.add(pyramid);
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

  //setup post processing
  setupPostProcessing();

  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false);
  createBasicGeometryAndLights();

  camera.position.z = 5;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,0);
  controls.update();

}

var x=0;
var animate = function () {
  requestAnimationFrame( animate );

  // renderer.render( scene, camera );
  composer.render();
  pyramid.material.alphaMap.repeat.set(1, Math.sin(x)*30);
  x += 0.003;

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

