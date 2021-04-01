class MainView {
    constructor(observer) {
        this.onclick = false
        this.observer = observer

        // init canvas
        this.canvas = document.getElementById('main-view')
        this.canvas.addEventListener('mousedown', (e) => this.onClick(e))
        this.canvas.addEventListener('mouseup', () => this.onUnclick())
        this.canvas.addEventListener('mousemove', (e) => this.rotateMouseMove(e))
        this.canvas.width = window.innerHeight * 0.90
        this.canvas.height = window.innerHeight * 0.90
    
        // attributes
        this.gl = getGL(this.canvas)
        // init GL
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)

        // load shader
        this.shaderProgram = loadShader(this.gl, norm2dVertex, colorFrag)


        // init matrix transform
        this.ProjectionMatrix = getIdentityMat()
        this.ModelMatrix = getIdentityMat()
        setMatTransform(this.gl, this.shaderProgram, "u_Projection", this.ProjectionMatrix)
        setMatTransform(this.gl, this.shaderProgram, "u_Model", this.ModelMatrix)
        setVector3D(this.gl, this.shaderProgram, "u_ambient", [0.4, 0.4, 0.4])
        setVector3D(this.gl, this.shaderProgram, "u_viewer", [-1, -1, 1])
        setVector3D(this.gl, this.shaderProgram, "u_light", [-1, -1, 1])
        this.gl.uniform1f(this.gl.getUniformLocation(this.shaderProgram, "u_shading"), true)

        this.observer.drawObjects(this.gl, this.shaderProgram)
    }

    onClick(e) {
        this.onclick = true
        this.lastPoint = getPosition(this.canvas, e)
    }

    onUnclick() {
        this.onclick = false
    }

    rotateMouseMove(e) {
        if (this.onclick) {
            const position = getPosition(this.canvas, e)
            const dy = (position[0] - this.lastPoint[0]) * 0.5
            const dx = (position[1] - this.lastPoint[1]) * 0.5

            this.ModelMatrix = matMult(matMult(getRxMat(-dx), getRyMat(-dy)), this.ModelMatrix)
            setMatTransform(this.gl, this.shaderProgram, "u_Model", this.ModelMatrix)
            this.observer.drawObjects(this.gl, this.shaderProgram)

            this.lastPoint = position
        }
    }
}
  