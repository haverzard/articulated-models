function colorFrag() {
  return `
    precision mediump float;
    highp vec4 finalColor;

    uniform vec3 u_color;
    uniform highp vec3 u_ambient;
    uniform bool u_shading;
    uniform float u_shininess;

    varying highp vec3 fNormal;
    varying vec2 fTexCoord;
    uniform highp int u_texture;
    uniform highp int u_TextureMode;

    // tangent space
    varying vec3 ts_light_pos;
    varying vec3 ts_view_pos;
    varying vec3 ts_frag_pos;

    // textures
    uniform sampler2D tex_picture;
    uniform sampler2D tex_depth;
    uniform sampler2D tex_norm;

    void main() {
      if (u_shading) {
        highp vec3 Is = vec3(50000000, 5000000, 5000000);
        highp vec3 Id = vec3(50000, 50000, 50000);

        highp vec3 frag = gl_FragCoord.xyz;
        if (u_texture == 1 && (u_TextureMode == 2 || u_TextureMode == 4)) {
          frag = ts_frag_pos;
        }
        highp vec3 l = normalize(ts_light_pos - frag);
        highp vec3 v = normalize(ts_view_pos - frag);
        highp vec3 h = normalize(l + v);

        highp vec3 NN = fNormal;
        if (u_texture == 1 && (u_TextureMode == 2 || u_TextureMode == 4)) {
          NN = (10.0 * texture2D(tex_norm, fTexCoord).xyz - 5.0);
        }

        highp float dir = max(dot(NN, l), 0.0);
        highp float spec = pow(max(dot(NN, h), 0.0), u_shininess);
        highp float d = (length(ts_light_pos - frag));

        // TODO: FIX SPECULAR
        highp vec3 phong = u_ambient + (dir * Id + spec * Is * 0.0) / (0.2 * pow(d, 2.0) - 1.2 * d + 50.0);

        finalColor = vec4(u_color * phong, 1.0);
      } else {
        finalColor = vec4(u_color, 1.0);
      }
      if (u_texture == 1 && (u_TextureMode == 1 || u_TextureMode == 4)) {
        finalColor = finalColor * texture2D(tex_picture, fTexCoord);
      }
      gl_FragColor = finalColor;
  }
    `
}
