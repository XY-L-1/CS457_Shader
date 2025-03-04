#version 120 

uniform float uKa, uKd, uKs;
uniform vec4 uSpecularColor;
uniform float uShininess;

varying vec3 vNs;
varying vec3 vLs;
varying vec3 vEs;
varying vec3 vMC;

const vec3 BLUE  = vec3( 0.1, 0.1, 0.5 );
const vec3 GREEN = vec3( 0.0, 0.8, 0.0 );
const vec3 BROWN = vec3( 0.6, 0.3, 0.1 );
const vec3 WHITE = vec3( 1.0, 1.0, 1.0 );
const vec3 GRAY  = vec3( 0.5, 0.5, 0.5 );

void main() {
    vec3 Normal = normalize(vNs);
    vec3 color = BLUE;

    if (vMC.y > 0.0) {
        float t = smoothstep(0.1, 0.3, vMC.y);
        color = mix(GREEN, GRAY, t);
    }

    if (vMC.y > 0.3) {
        float t = smoothstep(0.3, 0.6, vMC.y);
        color = mix(GRAY, WHITE, t);
    }

    vec3 Light = normalize(vLs);
    vec3 Eye = normalize(vEs);

    vec3 ambient = uKa * color;
    float d = max(dot(Normal, Light), 0.0);
    vec3 diffuse = uKd * d * color;

    float s = 0.0;
    if (d > 0.0) {
        vec3 ref = normalize(reflect(-Light, Normal));
        s = pow(max(dot(Eye, ref), 0.0), uShininess);
    }

    vec3 specular = uKs * s * uSpecularColor.rgb;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);

    // gl_FragColor = vec4(vNs * 0.5 + 0.5, 1.0);

}
