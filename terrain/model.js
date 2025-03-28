// Model class to represent a 3D object
export class Model {
    constructor(gl, vertexData, uvData, normalData, indexData, texture) {
        this.gl = gl;
        this.texture = texture;
        this.indexCount = indexData.length;
        
        // Position transform properties
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.modelMatrix = mat4.create();
        this.updateModelMatrix();
        
        // Create buffers
        this.buffers = {};
        
        // Create and populate the position buffer
        this.buffers.position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

        // Create and populate the UV buffer
        this.buffers.uv = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

        // Create and populate the normal buffer
        this.buffers.normal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

        // Create and populate the index buffer
        this.buffers.index = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indexData), gl.STATIC_DRAW);
    }
    
    setPosition(x, y, z) {
        this.position = [x, y, z];
        this.updateModelMatrix();
        return this;
    }
    
    setRotation(x, y, z) {
        this.rotation = [x, y, z];
        this.updateModelMatrix();
        return this;
    }
    
    setScale(x, y, z) {
        this.scale = [x, y, z];
        this.updateModelMatrix();
        return this;
    }
    
    updateModelMatrix() {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
        mat4.translate(this.modelMatrix, this.modelMatrix, [-80,0,-80]);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
    }
    
    rotateY(angle) {
        this.rotation[1] += angle;
        this.updateModelMatrix();
    }
    
    bindBuffers(program) {
        const gl = this.gl;
        
        // Set up attributes
        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const uvLocation = gl.getAttribLocation(program, 'uv');
        gl.enableVertexAttribArray(uvLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

        const normalLocation = gl.getAttribLocation(program, 'normal');
        gl.enableVertexAttribArray(normalLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
    }
    
    bindTexture() {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
}