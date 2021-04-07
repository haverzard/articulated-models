function norm2dVertex() {
  return `
    attribute vec3 vPosition;
    attribute vec2 vTexCoord;

    uniform mat4 u_Projection;
    uniform mat4 u_Model;
    uniform mat4 u_View;
    uniform vec3 u_normal;

    varying highp vec4 fNormal;
    varying vec2 fTexCoord;

    void main() {
      gl_Position = u_Projection * u_Model * u_View * vec4(vPosition, 1.0);

      fNormal = u_Model * u_View * vec4(u_normal, 1.0);
      fTexCoord = vTexCoord;
    }
    `
}
