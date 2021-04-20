class MinecraftTurtleModel extends GeoObject {
  constructor(data = null, size = 1) {
    super();
    this.useTangent = true;
    this.id = "Turtle";
    this.PARTS = [
      "body",
      "right-arm",
      "left-arm",
      "right-leg",
      "left-leg",
      "head",
      "shell",
      "left-eye",
      "right-eye",
    ];
    this.main = "body";
    // load from ext file
    if (data) {
      this._toShape(data);
      return;
    }
    this._generate();
    this.genKeyFrames();
  }

  _generate() {
    this.parts = {};
    this.PARTS.forEach((k) => {
      this.parts[k] = new Cube(null, 1, [1, 0.8, 0.9]);
    });

    this.parts["head"].addScaling3D([0.27, 0.2, 0.2]);
    this.parts["head"].addTranslation([0, 0.1, -0.5]);
    this.parts["head"].applyTransformation();
    this.parts["head"].id = "head";
    this.parts["head"].mid = [0, 0.1, -0.3];
    this.parts["head"].bound = {
      ...this.parts["head"].bound,
      translate: {
        activation: [false, false, true],
        range: [[], [], [0, 0.3, 0.001]],
      },
    };

    this.parts["shell"].addScaling3D([0.6, 0.1, 0.6]);
    this.parts["shell"].addTranslation([0, 0.1, 0.05]);
    this.parts["shell"].applyTransformation();
    this.parts["shell"].id = "shell";
    this.parts["shell"].bound = {
      ...this.parts["shell"].bound,
      rotate: {
        activation: [true, false, true],
        range: [[-10, 10, 1], [], [-10, 10, 1]],
      },
    };

    this.parts["head"].FACES.forEach((f) => {
      this.parts["head"].faces[f].texCoord = texCoordTurtle["all"][f];
      this.parts["left-eye"].faces[f].texCoord = texCoordTurtle["all"][f];
      this.parts["right-eye"].faces[f].texCoord = texCoordTurtle["all"][f];
      this.parts["left-arm"].faces[f].texCoord = texCoordTurtle["all"][f];
      this.parts["right-arm"].faces[f].texCoord = texCoordTurtle["all"][f];
      this.parts["left-leg"].faces[f].texCoord = texCoordTurtle["all"][f];
      this.parts["right-leg"].faces[f].texCoord = texCoordTurtle["all"][f];
      this.parts["body"].faces[f].texCoord = texCoordTurtle["all"][f];
      this.parts["shell"].faces[f].texCoord = texCoordTurtle["all"][f];
    });

    const eyes = ["right-eye", "left-eye"];
    eyes.forEach((k, i) => {
      let x = -0.135;
      let z = -0.56;
      if (Math.floor(i / 2)) z = 0.35;
      if (i % 2) x = -x;
      this.parts[k].addScaling3D([0.015, 0.04, 0.02]);
      this.parts[k].addTranslation([x, 0.15, z]);
      this.parts[k].applyTransformation();
      this.parts[k].id = k;
      this.parts[k].mid = [0, -0.2, z];
      this.parts[k].bound = {
        ...this.parts[k].bound,
        rotate: {
          activation: [true, false, false],
          range: [[-4, 4, 1], [], []],
        },
      };
    });

    const arms = ["right-arm", "left-arm"];
    arms.forEach((k, i) => {
      let x = -0.45;
      let z = -0.25;
      if (Math.floor(i / 2)) z = 0.35;
      if (i % 2) x = -x;
      this.parts[k].addScaling3D([0.4, 0.05, 0.15]);
      this.parts[k].addTranslation([x, 0, z]);
      this.parts[k].applyTransformation();
      this.parts[k].id = k;
      this.parts[k].mid = [0, -0.2, z];
      this.parts[k].bound = {
        ...this.parts[k].bound,
        rotate: {
          activation: [false, true, false],
          range: [[], [-10, 10, 1], []],
        },
      };
    });

    const legs = ["right-leg", "left-leg"];
    legs.forEach((k, i) => {
      let x = -0.245;
      let z = 0.48;
      let y_degree = 60;
      if (i % 2) x = -x;
      if (i % 2) y_degree = -y_degree;
      this.parts[k].addScaling3D([0.3, 0.05, 0.15]);
      this.parts[k].addRotateY(y_degree);
      this.parts[k].addTranslation([x, 0, z]);
      this.parts[k].applyTransformation();
      this.parts[k].id = k;
      this.parts[k].mid = [0, -0.2, z];
      this.parts[k].bound = {
        ...this.parts[k].bound,
        rotate: {
          activation: [false, true, false],
          range: [[], [-10, 10, 1], []],
        },
      };
    });

    this.parts["body"].addScaling3D([0.7, 0.15, 0.8]);
    this.parts["body"].applyTransformation();
    this.parts["body"].id = "body";
    this.parts["body"].bound = {
      translate: {
        activation: [true, true, true],
        range: [
          [-5, 5, 0.01],
          [-5, 5, 0.01],
          [-5, 5, 0.01],
        ],
      },
      rotate: {
        activation: [true, true, true],
        range: [
          [-180, 180, 1],
          [-180, 180, 1],
          [-180, 180, 1],
        ],
      },
    };

    this.parts["body"].addChild(this.parts["head"]);
    this.parts["body"].addChild(this.parts["right-arm"]);
    this.parts["body"].addChild(this.parts["left-arm"]);
    this.parts["body"].addChild(this.parts["right-leg"]);
    this.parts["body"].addChild(this.parts["left-leg"]);
    this.parts["body"].addChild(this.parts["shell"]);
    this.parts["head"].addChild(this.parts["left-eye"]);
    this.parts["head"].addChild(this.parts["right-eye"]);
  }

  genKeyFrames() {
    this.keyframes = {
      body: [
        [
          0,
          {
            translate: [0, 0, -1],
            rotate: [0, -180, 0],
          },
        ],
        [
          50,
          {
            translate: [0, 0, 1],
            rotate: [0, -180, 0],
          },
        ],
        [
          100,
          {
            translate: [0, 0, -1],
            rotate: [0, -180, 0],
          },
        ],
      ],
      head: [
        [
          0,
          {
            translate: [0, 0, 0],
            rotate: [0, 0, 0],
          },
        ],
      ],
      [`left-eye`]: [
        [
          0,
          {
            translate: [0, 0, 0],
            rotate: [0, 0, 0],
          },
        ],
      ],
      [`right-eye`]: [
        [
          0,
          {
            translate: [0, 0, 0],
            rotate: [0, 0, 0],
          },
        ],
      ],
    };
    let frames = 5;
    while (frames <= 100) {
      for (let i = 0; i < 2; i++) {
        this.keyframes["head"].push([
          frames,
          {
            translate: [0, 0, (i + 1) / 5.1],
            rotate: [0, 0, 0],
          },
        ]);
        this.keyframes["left-eye"].push([
          frames,
          {
            translate: [0, 0, 0],
            rotate: [-10 * (1 - (i % 2) * 2), 0, 0],
          },
        ]);
        this.keyframes["right-eye"].push([
          frames,
          {
            translate: [0, 0, 0],
            rotate: [-10 * (1 - (i % 2) * 2), 0, 0],
          },
        ]);
        frames += 7.5;
      }
      this.keyframes["head"].push([
        frames,
        {
          translate: [0, 0, 0],
          rotate: [0, 0, 0],
        },
      ]);
      this.keyframes["left-eye"].push([
        frames,
        {
          translate: [0, 0, 0],
          rotate: [0, 0, 0],
        },
      ]);
      this.keyframes["left-eye"].push([
        frames + 5,
        {
          translate: [0, 0, 0],
          rotate: [0, 0, 0],
        },
      ]);
      this.keyframes["right-eye"].push([
        frames,
        {
          translate: [0, 0, 0],
          rotate: [0, 0, 0],
        },
      ]);
      this.keyframes["right-eye"].push([
        frames + 5,
        {
          translate: [0, 0, 0],
          rotate: [0, 0, 0],
        },
      ]);
      frames += 10;
    }

    const keys = ["right-arm", "left-arm", "right-leg", "left-leg"];
    keys.forEach((k, mod) => {
      mod = mod % 2;
      frames = 0.5;
      this.keyframes[k] = [
        [
          0,
          {
            translate: [0, 0, 0],
            rotate: [0, 10 * (1 - mod * 2), 0],
          },
        ],
        [
          2.5,
          {
            translate: [0, 0, 0],
            rotate: [0, 10 * (1 - mod * 2), 0],
          },
        ],
      ];
      while (frames <= 100) {
        frames += 5;
        for (let i = 0; i < 2; i++) {
          this.keyframes[k].push([
            frames,
            {
              translate: [0, 0, 0],
              rotate: [0, -10 * (1 - mod * 2) * (1 - (i % 2) * 2), 0],
            },
          ]);
          frames += 5;
        }
        this.keyframes[k].push([
          frames,
          {
            translate: [0, 0, 0],
            rotate: [0, 10 * (1 - mod * 2), 0],
          },
        ]);
        this.keyframes[k].push([
          Math.min(frames + 5, 100),
          {
            translate: [0, 0, 0],
            rotate: [0, 10 * (1 - mod * 2), 0],
          },
        ]);
        frames += 5;
      }
    });
  }

  draw(gl, shaderProgram) {
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_TextureMode"), 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures["turtle_skin"]);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "tex_norm"), 0);

    super.draw(gl, shaderProgram);
  }

  animate(gl, shaderProgram, frame) {
    super.animate(gl, shaderProgram, frame);
  }

  reset() {
    this.PARTS.forEach((k) => {
      this.parts[k].resetTransformMatrix();
    });
  }

  _toShape(data) {
    this.parts = {};
    this.PARTS.forEach((k) => {
      this.parts[k] = new Cube(data["parts"][k]);
    });
    this.id = data["id"];
    this.keyframes = data["keyframes"];

    this.PARTS.forEach((k) => {
      var parent = data["connections"][k]
      if (parent) {
          this.parts[parent].addChild(this.parts[k])
      }
  })
  }

  parse() {
    let parsed = { parts: {} };
    this.PARTS.forEach((k) => {
      parsed["parts"][k] = this.parts[k].parse(this.useTangent);
    });
    parsed["id"] = this.id;
    parsed["keyframes"] = this.keyframes;
    parsed["main"] = this.main
    // child-parent lines
    parsed["connections"] = {
        "body": null,
        "head": "body",
        "shell": "body",
        "right-arm": "body",
        "left-arm": "body",
        "right-leg": "body",
        "left-leg": "body",
        "right-eye": "head",
        "left-eye": "head",
    }
    return parsed;
  }

  applyTransformation() {
    this.PARTS.forEach((k) => {
      this.parts[k].setTransformMatrix(this.TransformMatrix)
      this.parts[k].applyTransformation()
    })
    this.resetTransformMatrix()
  }
}
