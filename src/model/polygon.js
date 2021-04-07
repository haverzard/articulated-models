class Polygon extends GeoObject {
    constructor(vertices, color=[0, 0, 0], normal=[0,0,1], shininess=20, texCoord=Array(4).fill([0,0,0])) {
        super()
        this.vertices = vertices
        this.color = color
        this.normal = normal
        this.shininess = shininess
        this.texCoord = texCoord
    }

    applyTransformation() {
        this.vertices = to3D(matMult(to4D(this.vertices), transpose(this.TransformMatrix)))
        this.normal = to3D(matMult(to4D([this.normal]), transpose(this.TransformMatrix)))[0]
        this.resetTransformMatrix()
    }

    draw(gl, shaderProgram) {
        // create buffer for vertex, color, & depth - for shaders
        var vertex_buffer = createBuffer(gl, this.vertices.flat())
        var tex_buffer = createBuffer(gl, this.texCoord.flat())

        // bind buffer to attribute in shaders
        bindBuffer(gl, shaderProgram, vertex_buffer, 3, 'vPosition')
        bindBuffer(gl, shaderProgram, tex_buffer, 2, 'vTexCoord')
        setVector3D(gl, shaderProgram, "u_color", this.color)
        setVector3D(gl, shaderProgram, "u_normal", this.normal)
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "u_shininess"), this.shininess)

        /* Step5: Drawing the required object (triangle) */
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    
        // Enable the depth test
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearDepth(1.0);
    
        // Draw the triangles
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length)
    }
}