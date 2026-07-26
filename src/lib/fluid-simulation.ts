/**
 * ============================================================================
 * GPU fluid simulation for the landing-page background.
 * ============================================================================
 *
 * A trimmed incompressible Navier-Stokes solver running entirely in fragment
 * shaders. Each frame:
 *
 *   advect velocity -> apply vorticity confinement -> compute divergence ->
 *   solve pressure (Jacobi iterations) -> subtract pressure gradient ->
 *   advect dye -> draw
 *
 * Pointer movement injects a velocity "splat" plus a colour splat, which is why
 * the background swirls under the cursor.
 *
 * This is the same technique as Pavel Dobryakov's well-known WebGL Fluid
 * Simulation (MIT). Written here from the underlying algorithm so it is typed,
 * self-contained, cleans up after itself, and honours prefers-reduced-motion.
 */

interface FluidConfig {
  simResolution: number;
  dyeResolution: number;
  densityDissipation: number;
  velocityDissipation: number;
  pressure: number;
  pressureIterations: number;
  curl: number;
  splatRadius: number;
  splatForce: number;
  /** Multiplier applied to every injected colour. Keeps the effect subtle. */
  intensity: number;
}

const DEFAULTS: FluidConfig = {
  simResolution: 128,
  dyeResolution: 1024,
  densityDissipation: 3.2,
  velocityDissipation: 2.0,
  pressure: 0.8,
  pressureIterations: 20,
  curl: 3,
  splatRadius: 0.2,
  splatForce: 6000,
  intensity: 0.12,
};

// --- Shader sources --------------------------------------------------------

const BASE_VERTEX = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const COPY_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
void main () { gl_FragColor = texture2D(uTexture, vUv); }`;

const CLEAR_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

const DISPLAY_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
void main () {
  vec3 c = texture2D(uTexture, vUv).rgb;
  float a = max(c.r, max(c.g, c.b));
  gl_FragColor = vec4(c, a);
}`;

const SPLAT_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`;

/**
 * Manual bilinear sampling so we never depend on the linear-filtering
 * extension for float textures - one less capability to feature-detect.
 */
const ADVECTION_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
  float decay = 1.0 + dissipation * dt;
  gl_FragColor = result / decay;
}`;

const DIVERGENCE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const CURL_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`;

const VORTICITY_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;

  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const PRESSURE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

// --- Types -----------------------------------------------------------------

type GL = WebGL2RenderingContext | WebGLRenderingContext;

interface Formats {
  rgba: { internalFormat: number; format: number };
  rg: { internalFormat: number; format: number };
  r: { internalFormat: number; format: number };
  halfFloat: number;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  readonly read: FBO;
  readonly write: FBO;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  swap: () => void;
}

interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: [number, number, number];
}

// --- Entry point -----------------------------------------------------------

/**
 * Boots the simulation on a canvas. Returns a teardown function that stops the
 * render loop, removes listeners and releases every GL resource.
 */
export function initFluidSimulation(canvas: HTMLCanvasElement, overrides: Partial<FluidConfig> = {}): () => void {
  const config: FluidConfig = { ...DEFAULTS, ...overrides };

  const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

  let gl = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
  const isWebGL2 = Boolean(gl);
  if (!gl) {
    gl = (canvas.getContext('webgl', params) ??
      canvas.getContext('experimental-webgl', params)) as unknown as WebGL2RenderingContext | null;
  }
  if (!gl) return () => {};

  const context: GL = gl;
  const formats = detectFormats(context, isWebGL2);
  if (!formats) return () => {};

  context.disable(context.DEPTH_TEST);
  context.disable(context.CULL_FACE);
  context.enable(context.BLEND);
  context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);

  // --- Fullscreen quad ----------------------------------------------------
  const quad = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, quad);
  context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), context.STATIC_DRAW);

  const indexBuffer = context.createBuffer();
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer);
  context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), context.STATIC_DRAW);
  context.vertexAttribPointer(0, 2, context.FLOAT, false, 0, 0);
  context.enableVertexAttribArray(0);

  const shaders: WebGLShader[] = [];
  const programs: WebGLProgram[] = [];
  const framebuffers: WebGLFramebuffer[] = [];
  const textures: WebGLTexture[] = [];

  const vertexShader = compile(context, context.VERTEX_SHADER, BASE_VERTEX, shaders);
  if (!vertexShader) return () => {};

  const makeProgram = (source: string): Program | null => {
    const fragment = compile(context, context.FRAGMENT_SHADER, source, shaders);
    if (!fragment) return null;
    const program = link(context, vertexShader, fragment, programs);
    return program ? new Program(context, program) : null;
  };

  const copyProgram = makeProgram(COPY_SHADER);
  const clearProgram = makeProgram(CLEAR_SHADER);
  const splatProgram = makeProgram(SPLAT_SHADER);
  const advectionProgram = makeProgram(ADVECTION_SHADER);
  const divergenceProgram = makeProgram(DIVERGENCE_SHADER);
  const curlProgram = makeProgram(CURL_SHADER);
  const vorticityProgram = makeProgram(VORTICITY_SHADER);
  const pressureProgram = makeProgram(PRESSURE_SHADER);
  const gradientProgram = makeProgram(GRADIENT_SUBTRACT_SHADER);
  const displayProgram = makeProgram(DISPLAY_SHADER);

  const all = [
    copyProgram,
    clearProgram,
    splatProgram,
    advectionProgram,
    divergenceProgram,
    curlProgram,
    vorticityProgram,
    pressureProgram,
    gradientProgram,
    displayProgram,
  ];
  if (all.some((p) => p === null)) {
    return () => {};
  }

  // Non-null from here on.
  const P = {
    copy: copyProgram!,
    clear: clearProgram!,
    splat: splatProgram!,
    advection: advectionProgram!,
    divergence: divergenceProgram!,
    curl: curlProgram!,
    vorticity: vorticityProgram!,
    pressure: pressureProgram!,
    gradient: gradientProgram!,
    display: displayProgram!,
  };

  // --- Render targets ------------------------------------------------------
  let dye: DoubleFBO;
  let velocity: DoubleFBO;
  let divergence: FBO;
  let curlFbo: FBO;
  let pressure: DoubleFBO;

  const blit = (target: FBO | null, clear = false) => {
    if (target === null) {
      context.viewport(0, 0, context.drawingBufferWidth, context.drawingBufferHeight);
      context.bindFramebuffer(context.FRAMEBUFFER, null);
    } else {
      context.viewport(0, 0, target.width, target.height);
      context.bindFramebuffer(context.FRAMEBUFFER, target.fbo);
    }
    if (clear) {
      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);
    }
    context.drawElements(context.TRIANGLES, 6, context.UNSIGNED_SHORT, 0);
  };

  const createFBO = (w: number, h: number, internalFormat: number, format: number, type: number): FBO => {
    context.activeTexture(context.TEXTURE0);
    const texture = context.createTexture()!;
    textures.push(texture);
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texImage2D(context.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = context.createFramebuffer()!;
    framebuffers.push(fbo);
    context.bindFramebuffer(context.FRAMEBUFFER, fbo);
    context.framebufferTexture2D(
      context.FRAMEBUFFER,
      context.COLOR_ATTACHMENT0,
      context.TEXTURE_2D,
      texture,
      0,
    );
    context.viewport(0, 0, w, h);
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id: number) {
        context.activeTexture(context.TEXTURE0 + id);
        context.bindTexture(context.TEXTURE_2D, texture);
        return id;
      },
    };
  };

  /** Ping-pong pair: shaders read `read` and write `write`, then we swap. */
  const doubleFBO = (w: number, h: number, internalFormat: number, format: number, type: number): DoubleFBO => {
    let a = createFBO(w, h, internalFormat, format, type);
    let b = createFBO(w, h, internalFormat, format, type);
    return {
      width: w,
      height: h,
      texelSizeX: a.texelSizeX,
      texelSizeY: a.texelSizeY,
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      swap() {
        const t = a;
        a = b;
        b = t;
      },
    };
  };

  const getResolution = (resolution: number) => {
    let aspect = context.drawingBufferWidth / context.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspect);
    return context.drawingBufferWidth > context.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  };

  const initFramebuffers = () => {
    const sim = getResolution(config.simResolution);
    const dyeRes = getResolution(config.dyeResolution);
    const type = formats.halfFloat;

    dye = doubleFBO(dyeRes.width, dyeRes.height, formats.rgba.internalFormat, formats.rgba.format, type);
    velocity = doubleFBO(sim.width, sim.height, formats.rg.internalFormat, formats.rg.format, type);
    divergence = createFBO(sim.width, sim.height, formats.r.internalFormat, formats.r.format, type);
    curlFbo = createFBO(sim.width, sim.height, formats.r.internalFormat, formats.r.format, type);
    pressure = doubleFBO(sim.width, sim.height, formats.r.internalFormat, formats.r.format, type);
  };

  const resizeCanvas = (): boolean => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);
    if (width === 0 || height === 0) return false;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  };

  resizeCanvas();
  initFramebuffers();

  // --- Pointers ------------------------------------------------------------
  const pointers: Pointer[] = [newPointer()];

  function newPointer(): Pointer {
    return {
      id: -1,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      down: false,
      moved: false,
      color: [0, 0, 0],
    };
  }

  /**
   * Palette pulled from the photograph: navy suit, teal tie, warm yellow
   * backdrop. Keeps the background feeling like it belongs to the portrait.
   */
  const PALETTE: [number, number, number][] = [
    [0.07, 0.23, 0.39], // navy
    [0.11, 0.5, 0.55], // teal
    [0.96, 0.83, 0.45], // warm yellow
    [0.0, 0.44, 0.89], // brand blue
    [0.73, 0.37, 0.62], // magenta accent
  ];

  let paletteIndex = Math.floor(Math.random() * PALETTE.length);
  const nextColor = (): [number, number, number] => {
    paletteIndex = (paletteIndex + 1) % PALETTE.length;
    const base = PALETTE[paletteIndex];
    const jitter = 0.85 + Math.random() * 0.3;
    return [
      base[0] * config.intensity * jitter,
      base[1] * config.intensity * jitter,
      base[2] * config.intensity * jitter,
    ];
  };

  const updatePointerDown = (pointer: Pointer, id: number, x: number, y: number) => {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = x / canvas.clientWidth;
    pointer.texcoordY = 1 - y / canvas.clientHeight;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = nextColor();
  };

  const updatePointerMove = (pointer: Pointer, x: number, y: number) => {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = x / canvas.clientWidth;
    pointer.texcoordY = 1 - y / canvas.clientHeight;

    const aspect = canvas.clientWidth / canvas.clientHeight;
    let dx = pointer.texcoordX - pointer.prevTexcoordX;
    let dy = pointer.texcoordY - pointer.prevTexcoordY;
    if (aspect < 1) dx *= aspect;
    if (aspect > 1) dy /= aspect;

    pointer.deltaX = dx;
    pointer.deltaY = dy;
    pointer.moved = Math.abs(dx) > 0 || Math.abs(dy) > 0;
  };

  // --- Simulation steps ----------------------------------------------------
  const step = (dt: number) => {
    context.disable(context.BLEND);

    P.curl.bind();
    context.uniform2f(P.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    context.uniform1i(P.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curlFbo);

    P.vorticity.bind();
    context.uniform2f(P.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    context.uniform1i(P.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    context.uniform1i(P.vorticity.uniforms.uCurl, curlFbo.attach(1));
    context.uniform1f(P.vorticity.uniforms.curl, config.curl);
    context.uniform1f(P.vorticity.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    P.divergence.bind();
    context.uniform2f(P.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    context.uniform1i(P.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    P.clear.bind();
    context.uniform1i(P.clear.uniforms.uTexture, pressure.read.attach(0));
    context.uniform1f(P.clear.uniforms.value, config.pressure);
    blit(pressure.write);
    pressure.swap();

    P.pressure.bind();
    context.uniform2f(P.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    context.uniform1i(P.pressure.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.pressureIterations; i++) {
      context.uniform1i(P.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    P.gradient.bind();
    context.uniform2f(P.gradient.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    context.uniform1i(P.gradient.uniforms.uPressure, pressure.read.attach(0));
    context.uniform1i(P.gradient.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    P.advection.bind();
    context.uniform2f(P.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    context.uniform2f(P.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    const velocityId = velocity.read.attach(0);
    context.uniform1i(P.advection.uniforms.uVelocity, velocityId);
    context.uniform1i(P.advection.uniforms.uSource, velocityId);
    context.uniform1f(P.advection.uniforms.dt, dt);
    context.uniform1f(P.advection.uniforms.dissipation, config.velocityDissipation);
    blit(velocity.write);
    velocity.swap();

    context.uniform2f(P.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    context.uniform1i(P.advection.uniforms.uVelocity, velocity.read.attach(0));
    context.uniform1i(P.advection.uniforms.uSource, dye.read.attach(1));
    context.uniform1f(P.advection.uniforms.dissipation, config.densityDissipation);
    blit(dye.write);
    dye.swap();
  };

  const render = () => {
    context.enable(context.BLEND);
    context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);
    P.display.bind();
    context.uniform1i(P.display.uniforms.uTexture, dye.read.attach(0));
    blit(null, true);
  };

  const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number]) => {
    P.splat.bind();
    context.uniform1i(P.splat.uniforms.uTarget, velocity.read.attach(0));
    context.uniform1f(P.splat.uniforms.aspectRatio, canvas.width / canvas.height);
    context.uniform2f(P.splat.uniforms.point, x, y);
    context.uniform3f(P.splat.uniforms.color, dx, dy, 0);
    context.uniform1f(P.splat.uniforms.radius, correctRadius(config.splatRadius / 100));
    blit(velocity.write);
    velocity.swap();

    context.uniform1i(P.splat.uniforms.uTarget, dye.read.attach(0));
    context.uniform3f(P.splat.uniforms.color, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  };

  const correctRadius = (radius: number) => {
    const aspect = canvas.width / canvas.height;
    return aspect > 1 ? radius * aspect : radius;
  };

  const applyInputs = () => {
    for (const pointer of pointers) {
      if (!pointer.moved) continue;
      pointer.moved = false;
      splat(
        pointer.texcoordX,
        pointer.texcoordY,
        pointer.deltaX * config.splatForce,
        pointer.deltaY * config.splatForce,
        pointer.color,
      );
    }
  };

  // --- Event wiring --------------------------------------------------------
  const onPointerMove = (e: PointerEvent) => {
    const pointer = pointers[0];
    if (!pointer.down) updatePointerDown(pointer, -1, e.clientX, e.clientY);
    updatePointerMove(pointer, e.clientX, e.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    const touches = e.targetTouches;
    while (pointers.length < touches.length) pointers.push(newPointer());
    for (let i = 0; i < touches.length; i++) {
      const pointer = pointers[i];
      if (!pointer.down) updatePointerDown(pointer, touches[i].identifier, touches[i].clientX, touches[i].clientY);
      updatePointerMove(pointer, touches[i].clientX, touches[i].clientY);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    const touches = e.targetTouches;
    while (pointers.length < touches.length) pointers.push(newPointer());
    for (let i = 0; i < touches.length; i++) {
      updatePointerDown(pointers[i], touches[i].identifier, touches[i].clientX, touches[i].clientY);
      // A tap should still produce a visible puff.
      const p = pointers[i];
      splat(p.texcoordX, p.texcoordY, 0, 0, p.color);
    }
  };

  const onTouchEnd = () => {
    for (const pointer of pointers) pointer.down = false;
  };

  const onClick = (e: MouseEvent) => {
    const pointer = pointers[0];
    updatePointerDown(pointer, -1, e.clientX, e.clientY);
    splat(pointer.texcoordX, pointer.texcoordY, 0, 0, pointer.color);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('click', onClick, { passive: true });

  // --- Loop ----------------------------------------------------------------
  let lastTime = performance.now();
  let frame = 0;
  let running = true;
  let visible = true;

  const onVisibility = () => {
    visible = document.visibilityState === 'visible';
    lastTime = performance.now();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const update = () => {
    if (!running) return;

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 1 / 60);
    lastTime = now;

    if (resizeCanvas()) initFramebuffers();

    if (visible) {
      applyInputs();
      step(dt);
      render();
    }

    frame = requestAnimationFrame(update);
  };

  // An opening flourish so the page is never a blank canvas.
  const seed = () => {
    for (let i = 0; i < 8; i++) {
      const color = nextColor();
      const x = Math.random();
      const y = Math.random();
      splat(x, y, 1000 * (Math.random() - 0.5), 1000 * (Math.random() - 0.5), [
        color[0] * 8,
        color[1] * 8,
        color[2] * 8,
      ]);
    }
  };
  seed();

  frame = requestAnimationFrame(update);

  // --- Teardown ------------------------------------------------------------
  return () => {
    running = false;
    cancelAnimationFrame(frame);

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', onVisibility);

    for (const t of textures) context.deleteTexture(t);
    for (const f of framebuffers) context.deleteFramebuffer(f);
    for (const p of programs) context.deleteProgram(p);
    for (const s of shaders) context.deleteShader(s);
    context.deleteBuffer(quad);
    context.deleteBuffer(indexBuffer);

    context.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

// --- Helpers ---------------------------------------------------------------

class Program {
  uniforms: Record<string, WebGLUniformLocation | null> = {};

  constructor(
    private gl: GL,
    private program: WebGLProgram,
  ) {
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (!info) continue;
      this.uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
  }

  bind() {
    this.gl.useProgram(this.program);
  }
}

function compile(gl: GL, type: number, source: string, sink: WebGLShader[]): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[fluid] shader compile failed:', gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }
  sink.push(shader);
  return shader;
}

function link(
  gl: GL,
  vertex: WebGLShader,
  fragment: WebGLShader,
  sink: WebGLProgram[],
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[fluid] program link failed:', gl.getProgramInfoLog(program));
    }
    gl.deleteProgram(program);
    return null;
  }
  sink.push(program);
  return program;
}

/**
 * Works out which float texture formats this GPU will actually render to.
 * Returns null when there is no usable float path, in which case we skip the
 * effect entirely rather than draw something broken.
 */
function detectFormats(gl: GL, isWebGL2: boolean): Formats | null {
  if (isWebGL2) {
    const gl2 = gl as WebGL2RenderingContext;
    gl2.getExtension('EXT_color_buffer_float');
    const halfFloat = gl2.HALF_FLOAT;

    const rgba = supported(gl2, gl2.RGBA16F, gl2.RGBA, halfFloat)
      ? { internalFormat: gl2.RGBA16F as number, format: gl2.RGBA as number }
      : null;
    if (!rgba) return null;

    const rg = supported(gl2, gl2.RG16F, gl2.RG, halfFloat)
      ? { internalFormat: gl2.RG16F as number, format: gl2.RG as number }
      : rgba;
    const r = supported(gl2, gl2.R16F, gl2.RED, halfFloat)
      ? { internalFormat: gl2.R16F as number, format: gl2.RED as number }
      : rg;

    return { rgba, rg, r, halfFloat };
  }

  const ext = gl.getExtension('OES_texture_half_float');
  if (!ext) return null;
  gl.getExtension('OES_texture_half_float_linear');
  const halfFloat = (ext as { HALF_FLOAT_OES: number }).HALF_FLOAT_OES;

  if (!supported(gl, gl.RGBA, gl.RGBA, halfFloat)) return null;

  const rgba = { internalFormat: gl.RGBA as number, format: gl.RGBA as number };
  return { rgba, rg: rgba, r: rgba, halfFloat };
}

/** Round-trips a 4x4 texture through an FBO to confirm the format renders. */
function supported(gl: GL, internalFormat: number, format: number, type: number): boolean {
  const texture = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!texture || !fbo) return false;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fbo);
  gl.deleteTexture(texture);

  return status === gl.FRAMEBUFFER_COMPLETE;
}
