#version 330 compatibility

uniform vec4 uColor;
uniform float uKa, uKd, uKs, uShininess;
uniform bool uUseChromaDepth;

uniform float uRedDepth, uBlueDepth;  // Extra Points

in vec3 gN, gL, gE;
in float gZ; // Extra points
out vec4 FragColor;

vec3
Rainbow( float t )
{
        t = clamp( t, 0., 1. );         // 0.00 is red, 0.33 is green, 0.67 is blue

        float r = 1.;
        float g = 0.0;
        float b = 1.  -  6. * ( t - (5./6.) );

        if( t <= (5./6.) )
        {
                r = 6. * ( t - (4./6.) );
                g = 0.;
                b = 1.;
        }

        if( t <= (4./6.) )
        {
                r = 0.;
                g = 1.  -  6. * ( t - (3./6.) );
                b = 1.;
        }

        if( t <= (3./6.) )
        {
                r = 0.;
                g = 1.;
                b = 6. * ( t - (2./6.) );
        }

        if( t <= (2./6.) )
        {
                r = 1.  -  6. * ( t - (1./6.) );
                g = 1.;
                b = 0.;
        }

        if( t <= (1./6.) )
        {
                r = 1.;
                g = 6. * t;
        }

        return vec3( r, g, b );
}

void main() {
    vec3 N = normalize(gN);
    vec3 L = normalize(gL);
    vec3 E = normalize(gE);
    vec3 R = reflect(-L, N);

    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(E, R), 0.0), uShininess);

    vec3 myColor = uKa * uColor.rgb + uKd * diff * uColor.rgb;
    vec3 mySpecularColor = vec3(1.0, 1.0, 1.0);

    if (uUseChromaDepth) {
        float t = (2. / 3.) * (abs(gZ) - uRedDepth) / (uBlueDepth - uRedDepth);
        t = clamp(t, 0., 2. / 3.);
        myColor = Rainbow(t);
    }

    FragColor = vec4(myColor + uKs * spec * mySpecularColor, 1.0);
}
