class Cube extends GeoObject {
    constructor(data = null, size = 1, color=[0,1,0], shininess=20) {
        super()
        this.FACES = ["front", "behind", "left", "right", "top", "bottom"]
        this.mid = [0, 0, 0]
        // load from ext file
        if (data) {
            this._toShape(data)
            return
        } else {
            this._generate(size, color, shininess)
        }
    }

    _generate(size, color, shininess) {
        this.faces = {}
        this.FACES.forEach((v) => {
            this.faces[v] = new Polygon([
                [ size / 2, -size / 2, size / 2],
                [ size / 2,  size / 2, size / 2],
                [-size / 2,  size / 2, size / 2],
                [-size / 2, -size / 2, size / 2]
            ], color, [0, 0, 1], shininess)
        })

        this.faces["top"].addRotateX(90)
        this.faces["bottom"].addRotateX(-90)
        this.faces["behind"].addRotateX(180)
        this.faces["left"].addRotateY(-90)
        this.faces["right"].addRotateY(90)

        this.FACES.forEach((v) => {
            this.faces[v].applyTransformation()
        })
    }

    draw(gl, shaderProgram) { // still placeholder
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "u_shading"), this.shading)
        setMatTransform(gl, shaderProgram, "u_View", this.TransformMatrix)
        this.FACES.forEach((k) => {
            this.faces[k].draw(gl, shaderProgram)
        })
    }


    _toShape(data) {
        this.faces = []
        this.FACES.forEach((k) => {
            let part = data[k]
            this.faces[k] = new Polygon(part["vertices"], part["color"], part["normal"], part["shininess"])
        })
        this.id = data["id"]
        this.bound = data["bound"]
        this.mid = data["mid"]
    }

    parse() {
        let parsed = {}
        this.FACES.forEach((k) => {
            parsed[k] = new Polygon(
                to3D(matMult(to4D(this.faces[k].vertices), transpose(this.TransformMatrix))),
                this.faces[k].color,
                to3D(matMult(to4D([this.faces[k].normal]), transpose(this.TransformMatrix)))[0],
                this.faces[k].shininess,
            )
        })
        parsed["mid"] = this.mid
        parsed["id"] = this.id
        parsed["bound"] = this.bound
        return parsed
    }

    applyTransformation() {
        this.mid = to3D(matMult(to4D([this.mid]), transpose(this.TransformMatrix)))[0]
        this.FACES.forEach((k) => {
            this.faces[k].vertices = to3D(matMult(to4D(this.faces[k].vertices), transpose(this.TransformMatrix)))
            this.faces[k].normal = to3D(matMult(to4D([this.faces[k].normal]), transpose(this.TransformMatrix)))[0]
        })
        this.resetTransformMatrix()
    }
}