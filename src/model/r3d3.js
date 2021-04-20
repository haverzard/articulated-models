class R3D3 extends GeoObject {
    constructor(data = null, size = 1) {
        super()
        this.useTangent = false;
        this.id = "r3d3"
        this.PARTS = ["body", "right-arm", "left-arm", "right-leg", "left-leg", "head"]
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

        var z = 0

        this.parts["head"].addScaling3D([0.4, 0.3, 0.4])
        this.parts["head"].addTranslation([0, 0.65, z])
        this.parts["head"].applyTransformation()
        this.parts["head"].id = "head"
        this.parts["head"].mid = [0, 0.1, -0.3]
        this.parts["head"].bound = {
            ...this.parts["head"].bound,
            rotate: {
                activation: [true, false, false],
                range: [[-45,45, 1], [], []]
            }
        }
        
        this.parts["head"].FACES.forEach((f) => {
            this.parts["head"].faces[f].texCoord = texCoordR3D3["head"][f]
            this.parts["left-arm"].faces[f].texCoord = texCoordR3D3["leg"][f]
            this.parts["right-arm"].faces[f].texCoord = texCoordR3D3["leg"][f]
            this.parts["left-leg"].faces[f].texCoord = texCoordR3D3["leg"][f]
            this.parts["right-leg"].faces[f].texCoord = texCoordR3D3["leg"][f]
            this.parts["body"].faces[f].texCoord = texCoordR3D3["body"][f]
        })

        const arms = ["right-arm", "left-arm",]
        arms.forEach((k, i) => {
            let x = 0.3
            let z = 0
            if (i % 2) x = -x
            this.parts[k].addScaling3D([0.2, 0.5, 0.2])
            this.parts[k].addTranslation([x, 0.25, z])
            this.parts[k].applyTransformation()
            this.parts[k].id = k
            this.parts[k].mid = [0, 0.5, z]
            this.parts[k].bound = {
                ...this.parts[k].bound,
                rotate: {
                    activation: [true, false, false],
                    range: [[-90, 90, 1], [], []]
                }
            }
            console.log(this.parts[k])
        })


        const keys = ["right-leg", "left-leg"]
        keys.forEach((k, i) => {
            let x = 0.17
            let z = 0
            if (i % 2) x = -x
            this.parts[k].addScaling3D([0.15, 0.5, 0.2])
            this.parts[k].addTranslation([x, -0.65, z])
            this.parts[k].applyTransformation()
            this.parts[k].id = k
            this.parts[k].mid = [0, -0.4, z]
            this.parts[k].bound = {
                ...this.parts[k].bound,
                rotate: {
                    activation: [true, false, false],
                    range: [[-90, 90, 1], [], []]
                }
            }
        })



    
        this.parts["body"].addScaling3D([0.5, 1, 0.8])
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
        console.log(this.parts)
    }

    genKeyFrames() {
        this.keyframes = {
            "body": [
                [0, {
                    translate: [1.5, 0, -2],
                    rotate: [0, -180, 0],
                }],
                [2.5, {
                    translate: [1.5, 0, -2],
                    rotate: [0, -180, 0],
                }],
                [22.5, {
                    translate: [1.5, 0, 2],
                    rotate: [0, -180, 0],
                }],
                [27.5, {
                    translate: [1.5, 0, 2],
                    rotate: [0, -270, 0],
                }],
                [47.5, {
                    translate: [-1.5, 0, 2],
                    rotate: [0, -270, 0],
                }],
                [52.5, {
                    translate: [-1.5, 0, 2],
                    rotate: [0, 0, 0],
                }],
                [72.5, {
                    translate: [-1.5, 0, -2],
                    rotate: [0, 0, 0],
                }],
                [77.5, {
                    translate: [-1.5, 0, -2],
                    rotate: [0, -90, 0],
                }],
                [90, {
                    translate: [1.5, 0, -2],
                    rotate: [0, -180, 0],
                }],
                [92.5, {
                    translate: [1.5, 0, -2],
                    rotate: [0, -270, 0],
                }],
                [95, {
                    translate: [1.5, 0, -2],
                    rotate: [0, -0, 0],
                }],
                [97.5, {
                    translate: [1.5, 0, -2],
                    rotate: [0, -90, 0],
                }],
                [100, {
                    translate: [1.5, 0, -2],
                    rotate: [0, -135, 0],
                }]
            
            ],
            "head": [
                [0, {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                },
                ]
            ]
        }
        let frames = 5
        while (frames <= 100) {
            for (let i = 0; i < 3; i++) {
                this.keyframes["head"].push(
                    [frames, {
                        translate: [0, 0, 0],
                        rotate: [-5 * (1 - (i % 2) * 2), 0, 0],
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
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_TextureMode"), 3);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textures["wallpaper"]);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "texMap"), 1);

        super.draw(gl, shaderProgram)
    }

    animate(gl, shaderProgram, frame) {
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
        this.PARTS.forEach((k) => {
            this.parts[k].setTransformMatrix(this.TransformMatrix)
            this.parts[k].applyTransformation()
        })

        this.resetTransformMatrix()
    }
}