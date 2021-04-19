function norm2dVertex() {
  return `
    attribute vec3 vPosition;
    attribute vec2 vTexCoord;

    uniform mat4 u_Projection;
    uniform mat4 u_Model;
    uniform mat4 u_View;
    uniform vec3 u_normal;
    uniform vec3 u_tangent;
    uniform highp int u_texture;
    uniform highp int u_TextureMode;
    uniform highp vec3 u_viewer;
    uniform highp vec3 u_light;

    varying highp vec3 fNormal;
    varying vec2 fTexCoord;

    varying vec3 R;
    uniform mat4 viewModel;

    // tangent space
    varying vec3 ts_light_pos;
    varying vec3 ts_view_pos;
    varying vec3 ts_frag_pos;

    mat3 transpose(in mat3 inMatrix) {
      vec3 i0 = inMatrix[0];
      vec3 i1 = inMatrix[1];
      vec3 i2 = inMatrix[2];
  
      mat3 outMatrix = mat3(
          vec3(i0.x, i1.x, i2.x),
          vec3(i0.y, i1.y, i2.y),
          vec3(i0.z, i1.z, i2.z)
      );
  
      return outMatrix;
    }

    mat3 inverse(in mat3 mat) {
      mat3 dest = mat3(
        vec3(0,0,0),
        vec3(0,0,0),
        vec3(0,0,0)
      );
  
      float a00 = mat[0][0], a01 = mat[0][1], a02 = mat[0][2];
      float a10 = mat[1][0], a11 = mat[1][1], a12 = mat[1][2];
      float a20 = mat[2][0], a21 = mat[2][1], a22 = mat[2][2];
    
      float b01 =  a22 * a11 - a12 * a21;
      float b11 = -a22 * a10 + a12 * a20;
      float b21 =  a21 * a10 - a11 * a20;
    
      float d = a00 * b01 + a01 * b11 + a02 * b21;
      if (d == 0.0) return dest;
      float id = 1.0 / d;

      dest[0][0] = b01 * id;
      dest[0][1] = (-a22 * a01 + a02 * a21) * id;
      dest[0][2] = ( a12 * a01 - a02 * a11) * id;
      dest[1][0] = b11 * id;
      dest[1][1] = ( a22 * a00 - a02 * a20) * id;
      dest[1][2] = (-a12 * a00 + a02 * a10) * id;
      dest[2][0] = b21 * id;
      dest[2][1] = (-a21 * a00 + a01 * a20) * id;
      dest[2][2] = ( a11 * a00 - a01 * a10) * id;

      return dest;
    }

    void main() {
      gl_Position = u_Projection * u_Model * u_View * vec4(vPosition, 1.0);

      fTexCoord = vTexCoord;
      
      vec3 v_bitang = cross(u_tangent, u_normal);
      mat3 NormMat = transpose(inverse(mat3(u_Model * u_View)));

      if (u_texture == 1 && (u_TextureMode == 2 || u_TextureMode == 4)) {
        vec3 t = normalize(NormMat * u_tangent);
        vec3 b = normalize(NormMat * v_bitang);
        vec3 n = normalize(NormMat * u_normal);
        mat3 TBN = transpose(mat3(t, b, n));

        ts_light_pos = TBN * u_light;
        ts_view_pos = TBN * u_viewer;
        ts_frag_pos = TBN * vec3(u_Model * u_View * vec4(vPosition, 1.0));
      } else {
        ts_light_pos = u_light;
        ts_view_pos = u_viewer;
        ts_frag_pos = vec3(u_Model * u_View * vec4(vPosition, 1.0));
        fNormal = vec3(u_Model * u_View * vec4(u_normal, 1));
      }

      if (u_texture == 1 && u_TextureMode==3){
        // gl_Position = u_Projection * viewModel * u_View * vec4(vPosition, 1.0);
        // vec3 eyeToSurfaceDir = normalize(vPosition - vec3(0,0,2));
        // fNormal = vec3(u_Model * u_View * vec4(u_normal, 1));
        // R = reflect(eyeToSurfaceDir,fNormal);
      }

    }
    `
}
