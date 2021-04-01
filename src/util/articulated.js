
function traverse(obj, TransformMatrix, stack=[]) {
    if (!obj) return;
    stack.push(TransformMatrix)
    TransformMatrix = matMult(TransformMatrix, obj.TransformMatrix)
    obj.render()
    if (obj.child) traverse(obj, TransformMatrix, stack)
    TransformMatrix = stack.pop()
    if (obj.sibling) traverse(obj, TransformMatrix, stack)
}