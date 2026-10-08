import { WAVE_AMPLITUDE, WAVE_DECAY, WAVE_FREQUENCY, WAVE_SPEED, WAVE_WIDTH, type Ripple } from "@/domain/worlds/water";

const vertex = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() { vUv = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const fragment = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uArtwork;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform float uTime;
uniform float uBreath;
uniform float uOcean;
uniform float uStill;
uniform vec4 uWaves[8];

vec2 coverUv(vec2 uv) {
  float ratio = (uResolution.x / uResolution.y) / (uImageSize.x / uImageSize.y);
  if (ratio < 1.0) uv.x = (uv.x - 0.5) * ratio + 0.5;
  else uv.y = (uv.y - 0.5) / ratio + 0.5;
  return uv;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 point = vUv * vec2(aspect, 1.0);
  vec2 slope = vec2(0.0);
  vec2 artUv = coverUv(vUv);
  float waterMask = mix(1.0, 1.0 - smoothstep(0.59, 0.70, artUv.y), uOcean);
  float moving = 1.0 - uStill;
  float tide = uBreath * uOcean;
  slope.x += sin(point.x * 28.0 + point.y * 15.0 + uTime * 0.35) * 0.014 * moving;
  slope.y += cos(point.y * 55.0 - point.x * 8.0 - uTime * 0.55) * (0.018 + tide * 0.022) * moving;
  for (int i = 0; i < 8; i++) {
    vec4 wave = uWaves[i];
    float age = mix(max(0.0, uTime - wave.z), 0.7, uStill);
    vec2 delta = point - vec2(wave.x * aspect, 1.0 - wave.y);
    float radius = max(length(delta), 0.001);
    float distance = radius - ${WAVE_SPEED} * age;
    float envelope = exp(-distance * distance / ${WAVE_WIDTH * WAVE_WIDTH}) * exp(-age * ${WAVE_DECAY});
    float gradient = ${WAVE_AMPLITUDE} * envelope * (${WAVE_FREQUENCY}.0 * cos(distance * ${WAVE_FREQUENCY}.0) - 2.0 * distance / ${WAVE_WIDTH * WAVE_WIDTH} * sin(distance * ${WAVE_FREQUENCY}.0));
    slope += delta / radius * gradient * wave.w * (1.0 - step(12.0, age));
  }
  slope *= waterMask;
  vec2 distortion = slope * vec2(0.045 / aspect, 0.045);
  distortion.y += sin(artUv.y * 35.0 - uTime * 0.4) * 0.0015 * waterMask * moving * uOcean;
  vec3 color = texture2D(uArtwork, clamp(artUv + distortion, 0.001, 0.999)).rgb;
  float highlight = clamp((slope.x * -0.5 + slope.y * 0.7), -0.2, 0.2);
  color += vec3(0.67, 0.82, 0.78) * highlight * 0.55;
  color += vec3(0.12, 0.055, 0.018) * tide * waterMask * 0.2;
  gl_FragColor = vec4(color, 1.0);
}
`;

export function createWaterRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement, ocean: boolean) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  function dispose() {
    shaders.forEach((shader) => gl!.deleteShader(shader));
    gl!.deleteTexture(texture);
    gl!.deleteBuffer(buffer);
    gl!.deleteProgram(program);
  }
  try {
    if (!program || !buffer || !texture) throw new Error("Water resources unavailable");
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Water shader unavailable");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Water shader unsupported");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Water program unsupported");
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    const uniforms = Object.fromEntries(["uResolution", "uImageSize", "uTime", "uBreath", "uOcean", "uStill", "uWaves[0]"].map((name) => [name, gl.getUniformLocation(program, name)]));
    gl.uniform2f(uniforms.uImageSize, image.naturalWidth, image.naturalHeight);
    gl.uniform1f(uniforms.uOcean, ocean ? 1 : 0);
    const waves = new Float32Array(32);
    return {
      draw(time: number, breath: number, ripples: readonly Ripple[], still: boolean) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.uTime, time);
        gl.uniform1f(uniforms.uBreath, still ? 0 : breath);
        gl.uniform1f(uniforms.uStill, still ? 1 : 0);
        waves.fill(0);
        ripples.slice(-8).forEach((wave, index) => waves.set([wave.x, wave.y, wave.born, 1], index * 4));
        gl.uniform4fv(uniforms["uWaves[0]"], waves);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      dispose
    };
  } catch {
    dispose();
    return null;
  }
}
