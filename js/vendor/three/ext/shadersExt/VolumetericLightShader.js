/**
 * https://codepen.io/peterhry/pen/egzjGR?editors=0010
 * @type {{vertexShader: string, fragmentShader: string, uniforms: {lightPosition: {value: Vector2}, tDiffuse: {value: null}, exposure: {value: number}, density: {value: number}, weight: {value: number}, decay: {value: number}, samples: {value: number}}}}
 */
THREE.VolumetericLightShader = {
  uniforms: {
    tDiffuse: {value:null},
    lightPosition: {value: new THREE.Vector2(0.5, 0.5)},
    exposure: {value: 1},
    decay: {value: 1},
    density: {value: 6},
    weight: {value: 0.57},
    samples: {value: 30}
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n"),

  fragmentShader: [
    "varying vec2 vUv;",
    "uniform sampler2D tDiffuse;",
    "uniform vec2 lightPosition;",
    "uniform float exposure;",
    "uniform float decay;",
    "uniform float density;",
    "uniform float weight;",
    "uniform int samples;",
    "const int MAX_SAMPLES = 100;",
    "void main()",
    "{",
    "vec2 texCoord = vUv;",
    "vec2 deltaTextCoord = texCoord - lightPosition;",
    "deltaTextCoord *= 1.0 / float(samples) * density;",
    "vec4 color = texture2D(tDiffuse, texCoord);",
    "float illuminationDecay = 1.0;",
    "for(int i=0; i < MAX_SAMPLES; i++)",
    "{",
    "if(i == samples) {",
    "break;",
    "}",
    "texCoord += deltaTextCoord;",
    "vec4 samplet = texture2D(tDiffuse, texCoord);",
    "samplet *= illuminationDecay * weight;",
    "color += samplet;",
    "illuminationDecay *= decay;",
    "}",
    "gl_FragColor = color * exposure;",
    "}"
  ].join("\n")
};
