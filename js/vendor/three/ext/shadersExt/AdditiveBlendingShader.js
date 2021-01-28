/**
 * https://codepen.io/peterhry/pen/egzjGR?editors=0010
 * @type {{vertexShader: string, fragmentShader: string, uniforms: {tDiffuse: {value: null}, tAdd: {value: null}}}}
 */
THREE.AdditiveBlendingShader = {
  uniforms: {
    tDiffuse: { value:null },
    tAdd: { value:null }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tAdd;",
    "varying vec2 vUv;",
    "void main() {",
    "vec4 color = texture2D(tDiffuse, vUv);",
    "vec4 add = texture2D(tAdd, vUv);",
    "gl_FragColor = color + add;",
    "}"
  ].join("\n")
};
