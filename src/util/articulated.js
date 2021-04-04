
function traverse(obj, TransformMatrix, stack=[]) {
    if (!obj) return;

    stack.push(TransformMatrix)

    TransformMatrix = matMult(TransformMatrix, obj.TransformMatrix)
    let temp = obj.TransformMatrix
    obj.TransformMatrix = TransformMatrix
    obj.draw(observer.main.gl, observer.main.shaderProgram)
    obj.TransformMatrix = temp
    // recursively goes to child
    if (obj.child) traverse(obj.child, TransformMatrix, stack)

    TransformMatrix = stack.pop()

    if (obj.sibling) traverse(obj.sibling, TransformMatrix, stack)
}