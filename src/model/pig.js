class MinecraftPigModel extends GeoObject {
    constructor(data = null, size = 1) {
        super()
        this.id = "Minecraft Pig"
        this.PARTS = ["body", "right-arm", "left-arm", "right-leg", "left-leg", "head", "nose"]
        this.main = "body"
        // load from ext file
        if (data) {
            this._toShape(data)
            return
        }
        this._generate()
        this.genKeyFrames()
    }

    _generate() {
        this.parts = {}
        this.PARTS.forEach((k) => {
            this.parts[k] = new Cube(null, 1, [1,0.8,0.9])
        })

        this.parts["nose"].addScaling3D([0.2, 0.15, 0.1])
        this.parts["nose"].addTranslation([0, 0.05, -0.7])
        this.parts["nose"].applyTransformation()
        this.parts["nose"].id = "nose"
        this.parts["nose"].mid = [0, 0.05, -0.7]
        this.parts["nose"].bound = {
            translate: {
                activation: [true, true, false],
                range: [[-0.02, 0.02, 0.001], [-0.02, 0.02, 0.001], []]
            },
            rotate: {
                activation: [true, false, false],
                range: [[-10, 10, 1], [], []]
            }
        }

        this.parts["head"].addScaling3D([0.4, 0.4, 0.4])
        this.parts["head"].addTranslation([0, 0.1, -0.5])
        this.parts["head"].applyTransformation()
        this.parts["head"].id = "head"
        this.parts["head"].mid = [0, 0.1, -0.3]
        this.parts["head"].bound = {
            ...this.parts["head"].bound,
            rotate: {
                activation: [true, false, false],
                range: [[-90, 90, 1], [], []]
            }
        }
        this.parts["head"].FACES.forEach((f) => {
            this.parts["head"].faces[f].texCoord = texCoordPig["head"][f]
            this.parts["nose"].faces[f].texCoord = texCoordPig["nose"][f]
            this.parts["left-arm"].faces[f].texCoord = texCoordPig["leg"][f]
            this.parts["right-arm"].faces[f].texCoord = texCoordPig["leg"][f]
            this.parts["left-leg"].faces[f].texCoord = texCoordPig["leg"][f]
            this.parts["right-leg"].faces[f].texCoord = texCoordPig["leg"][f]
            this.parts["body"].faces[f].texCoord = texCoordPig["body"][f]
        })

        const keys = ["right-arm", "left-arm", "right-leg", "left-leg"]
        keys.forEach((k, i) => {
            let x = -0.149
            let z = -0.25
            if (Math.floor(i / 2)) z = 0.35
            if (i % 2) x = -x
            this.parts[k].addScaling3D([0.2, 0.3, 0.2])
            this.parts[k].addTranslation([x, -0.35, z])
            this.parts[k].applyTransformation()
            this.parts[k].id = k
            this.parts[k].mid = [0, -0.2, z]
            this.parts[k].bound = {
                ...this.parts[k].bound,
                rotate: {
                    activation: [true, false, false],
                    range: [[-90, 90, 1], [], []]
                }
            }    
        })

        this.parts["body"].addScaling3D([0.5, 0.4, 0.8])
        this.parts["body"].applyTransformation()
        this.parts["body"].id = "body"
        this.parts["body"].bound = {
            translate: {
                activation: [true, true, true],
                range: [[-5, 5, 0.01], [-5, 5, 0.01], [-5, 5, 0.01]]
            },
            rotate: {
                activation: [true, true, true],
                range: [[-180, 180, 1], [-180, 180, 1], [-180, 180, 1]]
            }
        }

        this.parts["body"].addChild(this.parts["head"])
        this.parts["body"].addChild(this.parts["right-arm"])
        this.parts["body"].addChild(this.parts["left-arm"])
        this.parts["body"].addChild(this.parts["right-leg"])
        this.parts["body"].addChild(this.parts["left-leg"])
        this.parts["head"].addChild(this.parts["nose"])
    }

    genKeyFrames() {
        this.keyframes = {
            "body": [
                [0, {
                    translate: [-1.5, 0, -1.5],
                    rotate: [0, -225, 0],
                }],
                [2.5, {
                    translate: [-1.5, 0, -1.5],
                    rotate: [0, -180, 0],
                }],
                [22.5, {
                    translate: [-1.5, 0, 1.5],
                    rotate: [0, -180, 0],
                }],
                [27.5, {
                    translate: [-1.5, 0, 1.5],
                    rotate: [0, -90, 0],
                }],
                [47.5, {
                    translate: [1.5, 0, 1.5],
                    rotate: [0, -90, 0],
                }],
                [52.5, {
                    translate: [1.5, 0, 1.5],
                    rotate: [0, 0, 0],
                }],
                [72.5, {
                    translate: [1.5, 0, -1.5],
                    rotate: [0, 0, 0],
                }],
                [77.5, {
                    translate: [1.5, 0, -1.5],
                    rotate: [0, 90, 0],
                }],
                [97.5, {
                    translate: [-1.5, 0, -1.5],
                    rotate: [0, 90, 0],
                }],
                [100, {
                    translate: [-1.5, 0, -1.5],
                    rotate: [0, 135, 0],
                }]
            ],
            "head": [
                [0, {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                }]
            ]
        }
        let frames = 5
        while (frames <= 100) {
            for (let i = 0; i < 3; i++) {
                this.keyframes["head"].push(
                    [frames, {
                        translate: [0, 0, 0],
                        rotate: [-30 * (1 - (i % 2) * 2), 0, 0],
                    }]
                )
                frames += 5
            }
            this.keyframes["head"].push(
                [frames, {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                }]
            )
            this.keyframes["head"].push(
                [frames+5, {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                }]
            )
            frames += 10
        }
        
        const keys = ["right-arm", "left-arm", "right-leg", "left-leg"]
        keys.forEach((k, mod) => {
            mod = mod % 2
            frames = 2.5
            this.keyframes[k] = [
                [0, {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                }],
                [2.5, {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                }]
            ]
            while (frames <= 100) {
                frames += 2.5
                for (let i = 0; i < 7; i++) {
                    this.keyframes[k].push(
                        [frames, {
                            translate: [0, 0, 0],
                            rotate: [60 * (1 - mod * 2) * (1 - (i % 2) * 2), 0, 0],
                        }]
                    )
                    frames += 2.5
                }
                this.keyframes[k].push(
                    [frames, {
                        translate: [0, 0, 0],
                        rotate: [0, 0, 0],
                    }]
                )
                this.keyframes[k].push(
                    [Math.min(frames+5, 100), {
                        translate: [0, 0, 0],
                        rotate: [0, 0, 0],
                    }]
                )
                frames += 5
            }
        })
    }

    draw(gl, shaderProgram) {
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_TextureMode"), 1)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures["pig_skin"])
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "tex_picture"), 0);

        // gl.activeTexture(gl.TEXTURE1);
        // gl.bindTexture(gl.TEXTURE_2D, textures["normal"])
        // gl.uniform1i(gl.getUniformLocation(shaderProgram, "tex_norm"), 1);

        super.draw(gl, shaderProgram)
    }

    animate(gl, shaderProgram, frame) {
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_TextureMode"), 1)
        gl.bindTexture(gl.TEXTURE_2D, textures["pig_skin"])
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "texture"), 0);
        super.animate(gl, shaderProgram, frame)
    }

    reset() {
        this.PARTS.forEach((k) => {
            this.parts[k].resetTransformMatrix()
        })
    }

    _toShape(data) {
        this.parts = {}
        this.PARTS.forEach((k) => {
            this.parts[k] = new Cube(data["parts"][k])
        })
        this.id = data["id"]
        this.keyframes = data["keyframes"]

        this.parts["body"].addChild(this.parts["head"])
        this.parts["body"].addChild(this.parts["right-arm"])
        this.parts["body"].addChild(this.parts["left-arm"])
        this.parts["body"].addChild(this.parts["right-leg"])
        this.parts["body"].addChild(this.parts["left-leg"])
        this.parts["head"].addChild(this.parts["nose"])
    }

    parse() {
        let parsed = {"parts": {}}
        this.PARTS.forEach((k) => {
            parsed["parts"][k] = this.parts[k].parse()
        })
        parsed["id"] = this.id
        parsed["keyframes"] = this.keyframes
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