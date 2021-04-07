function colorFrag() {
  return `
    precision mediump float;
    highp vec4 finalColor;

    uniform vec3 u_color;
    uniform highp vec3 u_ambient;
    uniform highp vec3 u_viewer;
    uniform highp vec3 u_light;
    uniform bool u_shading;
    uniform float u_shininess;
    uniform int u_TextureMode;

    varying highp vec4 fNormal;
    varying vec2 fTexCoord;

    uniform sampler2D texture;

    void main() {
      if (u_shading) {
        highp vec3 Is = vec3(50000000, 5000000, 5000000);
        highp vec3 Id = vec3(50000, 50000, 50000);
        highp vec3 l = normalize(u_light - gl_FragCoord.xyz);
        highp vec3 v = normalize(u_viewer - gl_FragCoord.xyz);
        highp vec3 h = normalize(l + v);

        highp float dir = max(dot(fNormal.xyz, l), 0.0);
        highp float spec = pow(max(dot(fNormal.xyz, h), 0.0), u_shininess);
        highp float d = (length(u_light - gl_FragCoord.xyz));
        highp vec3 phong = u_ambient + (dir * Id + spec * Is) / (0.2 * pow(d, 2.0) - 1.2 * d + 50.0);

        finalColor = vec4(u_color * phong, 1.0);
        if (u_TextureMode == 1) {
          finalColor = finalColor * texture2D(texture, fTexCoord);
        }
        gl_FragColor = finalColor;
      } else {
        gl_FragColor = vec4(u_color, 1.0);
      }
    }
    `
}
