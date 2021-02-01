/*
  Adapted from selective post processing example in
  thread: https://discourse.threejs.org/t/how-to-use-selective-postprocessing-with-any-pass-other-than-bloompass/17649/2
  code: https://codesandbox.io/s/threejs-selective-postprocessing-i3rkl

  Basic Concept:
  1. EffectComposer: https://threejs.org/docs/#examples/en/postprocessing/EffectComposer
  2. Pass: represents a unit of post-processing pass
  3. Layers: https://threejs.org/docs/#api/en/core/Layers

  Selective postprocessing involves
  1. applying a unique effectComposer to selected set of scene objects (by using layers) in an offline screen buffer.
  2. Once we collect the output of all intermediate effectComposers, pass it on to the final effectComposer
  3. which will use a custom shader to add all the offline screen buffers and render to the screen.

  Steps 1 to 3 above are done in each render cycle.

  Taking an example here, lets apply dot effect on cube1 and bloom+film effect on cube2.
  ###method: setupLayersForPostProcessing
  1. assign cube1 to layer1 (https://threejs.org/docs/#api/en/core/Layers)
  2. assign cube2 to layer2
  3. assign the lights to all layers (assuming light is being used to light up all objects irrespective of layers)

  ###method: setupPostProcessing
  4. create two intermediate effectComposers -> dotComposer, bloomComposer.
       - set each composer's renderToScreen = false;
       - add the relevant passes to each effect composer, making sure renderPass is added first in the chain
  5. create a final effectComposer -> finalComposer (###method: createFinalPass)
       - add renderPass as the first pass
       - create a passthrough vertex shader
       - create a fragment shader which will additively add the bloom and dot textures, with optionally the base texture
       - create a shaderPass called finalPass which combines these two shaders and takes renderTarget2.texture as an input from all
         intermediate effectComposers. something like: bloomTexture: { value: bloomComposer.renderTarget2.texture },

  ###method: composeRender
  6. In the render cycle,
      - for each intermediate effectComposers,
          - set the camera layer to one of the layers which contains the objects and lights on which effects will be applied
          - call swapBuffers() to swap read/write buffers
          - call render() on the composer
       - for final
          - set the camera layer to the default layer (0)
          - call swapBuffers() to swap read/write buffers
          - call render() on the composer



 */
var scene, camera, renderer, cube1, cube2,  ambient, directionalLight;
var dotComposer, bloomComposer, finalComposer;
const DEFAULT_LAYER_NUM = 0;
const BLOOM_LAYER_NUM = 1;
const DOT_LAYER_NUM = 2;

const localvertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const localfragmentShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform sampler2D dotTexture;
varying vec2 vUv;
void main() {
  vec4 base = texture2D(baseTexture, vUv);
  vec4 bloom = texture2D(bloomTexture, vUv);
  vec4 dot = texture2D(dotTexture, vUv);
  gl_FragColor = bloom + dot + base;
}
`;

const createFinalPass = (bloomComposer, dotComposer) => {
  const finalPass = new THREE.ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
        dotTexture: { value: dotComposer.renderTarget2.texture }
      },
      vertexShader : localvertexShader,
      fragmentShader : localfragmentShader,
      defines: {}
    }),
    "baseTexture"
  );
  return finalPass;
};


function setupPostProcessing() {
  const renderPass = new THREE.RenderPass(scene, camera);
  const dotPass = new THREE.DotScreenPass(undefined, undefined, 0.3);
  const bloomPass = new THREE.UnrealBloomPass(window.innerWidth / window.innerHeight, 10.5, .8, .3);
  const filmPass = new THREE.FilmPass(1, 0.3, 1024, true);

  dotComposer = new THREE.EffectComposer(renderer);
  dotComposer.setSize( window.innerWidth, window.innerHeight );
  dotComposer.renderToScreen = false;
  dotComposer.addPass(renderPass);
  dotComposer.addPass(dotPass);

  bloomComposer = new THREE.EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(bloomPass);
  bloomComposer.addPass(filmPass);

  // setup final composer
  finalComposer = new THREE.EffectComposer(renderer);
  finalComposer.addPass(renderPass);
  const finalPass = createFinalPass(
    bloomComposer,
    dotComposer
  );
  finalPass.renderToScreen = true;
  finalComposer.addPass(finalPass);

  //just setting the name, even though its not a property on composers.
  //Doing this will help in easier debugging later on, for example: when we resize the window and
  //print the composers name while being resized
  dotComposer.name = 'dotComposer';
  bloomComposer.name = 'bloomComposer';
  finalComposer.name = 'finalComposer';
}

function setupLayersForPostProcessing() {
  cube1.layers.set(DOT_LAYER_NUM);
  cube2.layers.set(BLOOM_LAYER_NUM);
  ambient.layers.enableAll();
  directionalLight.layers.enableAll();
}

function createMaterialForCube1() {
  let material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0x7fc5f9,
    emissive: 0x25673d,
    emissiveIntensity: 0.4,
    metalness: 0.5, //0 for wood, 1 for metal. Default0.5
    roughness: 0.3 // 0 for smooth mirror reflection, 1 for fully defuse
  })
  return material;
}

function createMaterialForCube2() {
  return new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0xff0000,
    emissive: 0x25673d,
    emissiveIntensity: 0.7,
    metalness: 0.5, //0 for wood, 1 for metal. Default0.5
    roughness: 0.3 // 0 for smooth mirror reflection, 1 for fully defuse
  });
}

function createBasicGeometryAndLights() {
  const geometry = new THREE.BoxGeometry();
  let material1 = createMaterialForCube1();
  let material2 = createMaterialForCube2()

  cube1 = new THREE.Mesh(geometry, material1);
  cube2 = new THREE.Mesh(geometry, material2);
  cube2.position.set(0.5, 0.5, -2);

  cube1.name = 'cube1';
  cube2.name = 'cube2';
  scene.add( cube1 );
  scene.add(cube2);

  //create some lights
  directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.target = cube1;
  scene.add( directionalLight );
  ambient = new THREE.AmbientLight(0xffffff, 0.3);  //color and intensity
  scene.add( ambient);
}

var init = function() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );

  //setup post processing
  setupPostProcessing();

  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false);
  createBasicGeometryAndLights();

  //setup post processing layers
  setupLayersForPostProcessing();

  camera.position.z = 5;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,0);
  controls.update();

}

var animate = function () {
  cube1.rotation.x += 0.01;
  cube1.rotation.y += 0.01;
  cube2.rotation.x -= 0.01;
  cube2.rotation.y -= 0.01;
  composeRender();
  requestAnimationFrame( animate );
};

function composeRender() {
  renderer.clear();
  camera.layers.set(DOT_LAYER_NUM);
  dotComposer.swapBuffers();
  dotComposer.render();

  camera.layers.set(BLOOM_LAYER_NUM);
  bloomComposer.swapBuffers();
  bloomComposer.render();

  camera.layers.set(DEFAULT_LAYER_NUM);
  finalComposer.swapBuffers();
  finalComposer.render();
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  [dotComposer, bloomComposer, finalComposer].forEach( composer => {
    composer.setSize( window.innerWidth, window.innerHeight );
    console.log('resized window for ' + composer.name);
  } )
  dotComposer.setSize( window.innerWidth, window.innerHeight );
  console.log(renderer.domElement.width, renderer.domElement.height);
}


init();
renderer.autoClear = false;
animate();

