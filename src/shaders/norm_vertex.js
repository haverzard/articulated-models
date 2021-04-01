function norm2dVertex() {
  return `
    attribute vec3 position;

    uniform mat4 u_Projection;
    uniform mat4 u_Model;
    uniform mat4 u_View;
    uniform vec3 u_normal;

    varying highp vec4 v_Normal;

    void main() {
      gl_Position = u_Projection * u_Model * u_View * vec4(position, 1.0);
      v_Normal = u_Projection * u_Model * u_View * vec4(u_normal, 1.0);
    }
    `
}
