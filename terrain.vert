#version 120

uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uDelta;

varying vec3 vNs;
varying vec3 vLs;
varying vec3 vEs;
varying vec3 vMC;

vec2 randomGradient(vec2 pos) {
    float angle = fract(sin(dot(pos, vec2(12.9898, 78.233))) * 43758.5453) * 6.28318530718;
    return vec2(cos(angle), sin(angle));
}

float perlinNoise(vec2 pos) {
    vec2 i = floor(pos);
    vec2 f = fract(pos);
    
    vec2 g00 = randomGradient(i);
    vec2 g10 = randomGradient(i + vec2(1.0, 0.0));
    vec2 g01 = randomGradient(i + vec2(0.0, 1.0));
    vec2 g11 = randomGradient(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    float nx0 = mix(dot(g00, f - vec2(0.0, 0.0)), dot(g10, f - vec2(1.0, 0.0)), u.x);
    float nx1 = mix(dot(g01, f - vec2(0.0, 1.0)), dot(g11, f - vec2(1.0, 1.0)), u.x);
    return mix(nx0, nx1, u.y);
}

float fractalNoise(vec2 pos) {
    float value = 0.0, amplitude = 1.0, frequency = 1.0;
    float maxValue = 0.0;
    const int OCTAVES = 3;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * perlinNoise(pos * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value / maxValue;
}

void main() {
    vec2 pos = gl_Vertex.xz;

    float h00 = fractalNoise(pos * uNoiseFreq) * uNoiseAmp;
    float hx = fractalNoise((pos + vec2(uDelta, 0.0)) * uNoiseFreq) * uNoiseAmp;
    float hz = fractalNoise((pos + vec2(0.0, uDelta)) * uNoiseFreq) * uNoiseAmp;

    vec3 newPos = gl_Vertex.xyz;
    newPos.y = h00;
    vMC = newPos;

    // Compute normals properly in the x-z plane
    vec3 dX = vec3(uDelta, hx - h00, 0.0);
    vec3 dZ = vec3(0.0, hz - h00, uDelta);
    vec3 normal = normalize(cross(dZ, dX));
    vNs = normalize(gl_NormalMatrix * normal);

    if (dot(vNs, vEs) < 0.0) {  // Flip normals if facing away
        vNs = -vNs;
    }

    vec4 ECposition = gl_ModelViewMatrix * vec4(newPos, 1.0);
    vLs = normalize(gl_LightSource[0].position.xyz - ECposition.xyz);
    vEs = normalize(-ECposition.xyz);

    gl_Position = gl_ModelViewProjectionMatrix * vec4(newPos, 1.0);
}
