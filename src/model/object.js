class GeoObject {
    constructor() {
        this.PARTS = []
        this.main = ""
        this.id = ""
        this.TransformMatrix = getIdentityMat()
        this.sibling = null
        this.child = null
        this.shading = true
        this.texture = true
        // init model transformation state
        // indexing: [x, y, z]
        this.state = {
            translate: [0, 0, 0],
            rotate: [0, 0, 0],
        }
        // init boundary
        // indexing: [x, y, z]
        this.bound = {
            translate: {
                activation: [false, false, false], // set false to disable
                range: [], // init range for every axis [min, max, step]
            },
            rotate: {
                activation: [false, false, false],
                range: [],
            },
        }
    }

    setColor(color) {
        this.color = color
    }

    setTransformMatrix(mat) {
        this.TransformMatrix = mat
    }

    resetTransformMatrix() {
        this.TransformMatrix = getIdentityMat()
        return this
    }

    addSibling(sibling) {
        let obj = this
        while (obj.sibling) {
            obj = obj.sibling
        }
        obj.sibling = sibling
        return this
    }

    addChild(child) {
        let obj = this
        if (!obj.child) {
            obj.child = child
            return;
        }
        obj = obj.child
        while (obj.sibling) {
            obj = obj.sibling
        }
        obj.sibling = child
        return this
    }

    addScaling(scale) {
        this.TransformMatrix = matMult(getSMat(Array(3).fill(scale)), this.TransformMatrix)
        return this
    }

    addScaling3D(scale) {
        this.TransformMatrix = matMult(getSMat(scale), this.TransformMatrix)
        return this
    }

    addTranslation(translate) {
        this.TransformMatrix = matMult(getTMat(translate), this.TransformMatrix)
        return this
    }

    addRotateX(deg) {
        this.TransformMatrix = matMult(getRxMat(deg), this.TransformMatrix)
        return this
    }

    addRotateY(deg) {
        this.TransformMatrix = matMult(getRyMat(deg), this.TransformMatrix)
        return this
    }

    addRotateZ(deg) {
        this.TransformMatrix = matMult(getRzMat(deg), this.TransformMatrix)
        return this
    }

    addTransformMatrix(TransformMatrix) {
        this.TransformMatrix = matMult(TransformMatrix, this.TransformMatrix)
        return this
    }

    applyTransformation() {
        return
    }

    animate(gl, shaderProgram, frame) {
        this.PARTS.forEach((partIdx) => {
            let keyframes = this.keyframes[partIdx]
            if (keyframes) {
                let idx = null
                for (let j = 0; j < keyframes.length; j++) {
                    // if keyframe is not within frame
                    if (Math.ceil(keyframes[j][0] * FRAMES / 100) >= frame) {
                        idx = j
                        break
                    }
                }
                // if there is no keyframe or keyframe is first keyframe
                if (idx === null || idx == 0) {
                    
                } else {
                    // the frame where my before keyframe is started
                    let framesA = Math.ceil(FRAMES * keyframes[idx-1][0] / 100)
                    // the frame where my keyframe is started
                    let framesB = Math.ceil(FRAMES * keyframes[idx][0] / 100)
                    let delta = framesB - framesA
                    // init delta state
                    let deltaState = {
                        translate: [0, 0, 0],
                        rotate: [0, 0, 0],
                    }
                    const keys = ["translate", "rotate"]
                    // calculate delta state
                    for (let j = 0; j < 3; j++) {
                        keys.forEach((k) => {
                            deltaState[k][j] = keyframes[idx-1][1][k][j] + (keyframes[idx][1][k][j] - keyframes[idx-1][1][k][j]) * (frame - framesA) / delta
                        })
                    }
                    // translate to origin
                    this.parts[partIdx]
                        .resetTransformMatrix()
                        .addTranslation(neg(this.parts[partIdx].mid))
    
                    // apply transformation
                    this.parts[partIdx]
                        .addRotateX(deltaState["rotate"][0])
                        .addRotateY(deltaState["rotate"][1])
                        .addRotateZ(deltaState["rotate"][2])
                        .addTranslation(deltaState["translate"])
                    // translate back
                    this.parts[partIdx].addTranslation(this.parts[partIdx].mid)
                }    
            }
        })
        // draw after everything is set
        gl.clearColor(1.0, 1.0, 1.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        this.draw(gl, shaderProgram)
    }

    draw(gl, shaderProgram) {
        setMatTransform(gl, shaderProgram, "u_View", this.TransformMatrix)
        traverse(this.parts[this.main], I)
    }
}