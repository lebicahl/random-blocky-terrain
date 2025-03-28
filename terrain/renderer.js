// Renderer class to handle individual WebGL contexts and rendering

import { Model } from './model.js';
import { randomNumbers } from '.././object_renderer_game.js';

import { heights_generator } from '.././object_renderer_game.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        // Enable WebGL features
        //this.gl.enable(this.gl.CULL_FACE);
        //this.gl.frontFace(this.gl.CCW);
        //this.gl.cullFace(this.gl.BACK);
        this.gl.enable(this.gl.DEPTH_TEST);
        
        // Enable unsigned int extension
        const ext = this.gl.getExtension('OES_element_index_uint');
        if (!ext) {
            throw new Error('OES_element_index_uint extension not supported');
        }
        
        this.spinSpeed = 0;
        
        this.moveSpeed = 0;
        
        this.cameraPos = vec3.create();
        this.cameraRot = vec3.create();

        // Matrix storage
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.mvMatrix = mat4.create();
        this.mvpMatrix = mat4.create();
        this.normalMatrix = mat4.create();
        this.inverseViewMatrix = mat4.create();
        
        // Set up matrices
        this.setupProjectionMatrix();
        this.setupViewMatrix();
        
        // Compile shaders
        this.program = this.initShaders();
        
        // Storage for models
        this.models = [];
    }
    
    setupProjectionMatrix() {
        /*
        // Set up orthographic projection
        const aspect = this.canvas.width / this.canvas.height;
        const orthoSize = 4;
        mat4.ortho(
            this.projectionMatrix,
            -orthoSize * aspect,  // Left
            orthoSize * aspect,   // Right
            -orthoSize,           // Bottom
            orthoSize,            // Top
            1,                  // Near
            20                   // Far
        );
        */
        
        mat4.perspective(
            this.projectionMatrix,
            70 * Math.PI / 180,
            this.canvas.width / this.canvas.height,
            0.5,
            500
        );
    }
    
    reProjectionMatrix(width, height) {
        /*
        const aspect = width / height;
        const orthoSize = height/500;
        mat4.ortho(
            this.projectionMatrix,
            -orthoSize * aspect,  // Left
            orthoSize * aspect,   // Right
            -orthoSize,           // Bottom
            orthoSize,            // Top
            1,                  // Near
            20                   // Far
        );
        */
        
        mat4.perspective(
            this.projectionMatrix,
            70 * Math.PI / 180,
            width / height,
            0.5,
            500
        );
    }
    
    setupViewMatrix() {
        // Set up view matrix - position camera
        mat4.identity(this.viewMatrix);
        mat4.rotateY(this.viewMatrix, this.viewMatrix, this.cameraRot[1]);
        mat4.rotateX(this.viewMatrix, this.viewMatrix, this.cameraRot[0]);
        mat4.translate(this.viewMatrix, this.viewMatrix, this.cameraPos);
        //mat4.invert(this.viewMatrix, this.viewMatrix);
        
        // Compute the inverse view matrix for lighting calculations
        mat4.invert(this.inverseViewMatrix, this.viewMatrix);
    }
    
    updateViewMatrix(mouseX, mouseY) {
        if (typeof mouseY !== "undefined" && typeof mouseX !== "undefined") {
            this.cameraRot[1] += - mouseX/100;
            //this.cameraRot[0] += mouseY/100;
            this.setupViewMatrix();
            //mat4.rotateY(this.viewMatrix, this.viewMatrix, -mouseX/100);
            //mat4.rotateX(this.viewMatrix, this.viewMatrix, -mouseY/100);
            //mat4.invert(this.inverseViewMatrix, this.viewMatrix);
        }
    }
    
    moveForwardViewMatrix() {
        const yaw = this.cameraRot[1] + Math.PI/2;
        const speed = 0.2;
        vec3.add(this.cameraPos, this.cameraPos, [speed*Math.cos(yaw), 0, speed*Math.sin(yaw)]);
        this.setupViewMatrix();
        //mat4.translate(this.viewMatrix, this.viewMatrix, [x, y, z]);
        //mat4.invert(this.inverseViewMatrix, this.viewMatrix);
    }
    
    moveBackwardViewMatrix() {
        const yaw = this.cameraRot[1] + Math.PI/2;
        const speed = -0.2;
        vec3.add(this.cameraPos, this.cameraPos, [speed*Math.cos(yaw), 0, speed*Math.sin(yaw)]);
        this.setupViewMatrix();
    }
    
    moveUpwardViewMatrix() {
        vec3.add(this.cameraPos, this.cameraPos, [0,-25,0]);
        this.setupViewMatrix();
    }
    
    startViewMatrix() {
        vec3.add(this.cameraPos, this.cameraPos, [0-160,0,0-160]);
        this.setupViewMatrix();
    }
    
    setCameraHeight(y) {
        this.cameraPos[1] = -y;
        this.setupViewMatrix();
    }

    initShaders() {
        const gl = this.gl;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, `
            precision mediump float;

            attribute vec3 position;
            attribute vec2 uv;
            attribute vec3 normal;

            varying vec2 vUV;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;

            uniform mat4 matrix;
            uniform mat4 normalMatrix;
            uniform mat4 modelMatrix;

            void main() {   
                vUV = uv;
                
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                
                vWorldNormal = normalize((normalMatrix * vec4(normal, 0.0)).xyz);

                gl_Position = matrix * vec4(position, 1);
            }
        `);
        gl.compileShader(vertexShader);
        
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vertexShader));
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, `
            precision mediump float;

            varying vec2 vUV;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;

            uniform sampler2D textureID;
            uniform mat4 inverseViewMatrix;
            
            const vec3 lightDirection = normalize(vec3(0, 1.0, 1.0));
            const float ambient = 0.3;
            const float shininess = 30.0;
            const vec3 specularColor = vec3(1.0,1.0,1.0);

            void main() {
                // Normalize the interpolated normal
                vec3 normal = normalize(vWorldNormal);
                
                // Compute diffuse lighting
                float diffuse = max(dot(normal, lightDirection), 0.0);
                
                // Compute view direction (camera position is at (0,0,0) in view space)
                vec3 cameraPosition = (inverseViewMatrix * vec4(0, 0, 0, 1)).xyz;
                vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                
                // Compute specular lighting using Blinn-Phong reflection model
                vec3 halfVector = normalize(lightDirection + viewDir);
                float specular = pow(max(dot(normal, halfVector), 0.0), shininess);

                vec2 newT = vec2(vUV.x, -vUV.y);

                // Get texture color
                vec4 texel = texture2D(textureID, newT);
                
                // Apply lighting
                vec3 color = texel.xyz * (ambient + diffuse) + specular * specularColor;

                gl_FragColor = vec4(color, texel.a);
            }
        `);
        gl.compileShader(fragmentShader);
        
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragmentShader));
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
        }

        gl.useProgram(program);

        // Store uniform locations
        this.uniformLocations = {
            matrix: gl.getUniformLocation(program, 'matrix'),
            normalMatrix: gl.getUniformLocation(program, 'normalMatrix'),
            modelMatrix: gl.getUniformLocation(program, 'modelMatrix'),
            textureID: gl.getUniformLocation(program, 'textureID'),
            inverseViewMatrix: gl.getUniformLocation(program, 'inverseViewMatrix'),
        };

        gl.uniform1i(this.uniformLocations.textureID, 0);
        
        return program;
    }

    loadTexture(url) {
        const gl = this.gl;
        const texture = gl.createTexture();
        const image = new Image();

        image.onload = e => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            
            /*
            var ext = gl.getExtension('EXT_texture_filter_anisotropic');
            if (ext) {
                gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 16);
            }
            */
            
            // Set texture parameters
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);  // Repeat in X
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);  // Repeat in Y
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            
        };

        image.src = url;
        return texture;
    }
    
    async addModel(objUrl, textureUrl, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
        // Load and set up object
        const objLoader = new OBJLoader();
        const objText = await (await fetch(objUrl)).text();
        await objLoader.loadOBJ(objText);
        
        // Load texture
        const texture = this.loadTexture(textureUrl);
        
        // Create model
        const model = new Model(
            this.gl, 
            objLoader.vertices,
            objLoader.textureCoords,
            objLoader.normals,
            objLoader.indices,
            texture
        );
        
        // Set position, rotation, and scale
        model.setPosition(position[0], position[1], position[2])
             .setRotation(rotation[0], rotation[1], rotation[2])
             .setScale(scale[0], scale[1], scale[2]);
        
        // Add to models array
        this.models.push(model);
        
        return model;
    }
    
    async addModel2(objLoader, texture, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
        
        // Create model
        const model = new Model(
            this.gl, 
            objLoader.vertices,
            objLoader.textureCoords,
            objLoader.normals,
            objLoader.indices,
            texture
        );
        
        // Set position, rotation, and scale
        model.setPosition(position[0], position[1], position[2])
             .setRotation(rotation[0], rotation[1], rotation[2])
             .setScale(scale[0], scale[1], scale[2]);
        
        // Add to models array
        this.models.push(model);
        
        return model;
    }
    
    async addModelChunk(vertices, textCoords, normals, indices, texture, x, z) {
        
        const model = new Model(
            this.gl,
            vertices,
            textCoords,
            normals,
            indices,
            texture
        )
        
        model.setPosition(x, 0, z)
             .setRotation(Math.PI/6, 0, 0)
             .setScale(1, 1, 1);
             
        this.models.push(model);
        
        return model;
    }
    
    setCamera() {
        let height = heights_generator.generateHeight(-this.cameraPos[0]+500,-this.cameraPos[2]+500, randomNumbers);
        if (height > 12) {
            height = 2*height - 7;
        }
        height += 20;
        this.setCameraHeight(height);
    }
    
    render(spinSpeed, moveSpeed, mouseX, mouseY) {
        const gl = this.gl;
        
        // Clear the canvas
        //gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Update all models (e.g., rotation)
        this.models.forEach(model => {
            model.rotateY(Math.PI * spinSpeed); // Rotate at a constant speed or use deltaTime
        });
        
        this.models.forEach(model => {
            if (model.position[1] < -10) {
                model.position[1] = 10
            }
            //model.setPosition(model.position[0], model.position[1] - moveSpeed, model.position[2]);
            if (typeof mouseY !== "undefined" && typeof mouseX !== "undefined") {
                model.rotation[1] += mouseX/100;
                model.rotation[0] += mouseY/100;
            }
        });
        
        //this.updateViewMatrix(mouseX, mouseY);
        //console.log(mouseY);

        // Set the inverse view matrix once for all models
        gl.uniformMatrix4fv(this.uniformLocations.inverseViewMatrix, false, this.inverseViewMatrix);
        
        // Render each model
        this.models.forEach(model => {
            // Bind the model's buffers
            model.bindBuffers(this.program);
            
            // Bind the model's texture
            model.bindTexture();
            
            // Compute the model-view-projection matrix
            mat4.multiply(this.mvMatrix, this.viewMatrix, model.modelMatrix);
            mat4.multiply(this.mvpMatrix, this.projectionMatrix, this.mvMatrix);
            
            // Compute the normal matrix
            mat4.invert(this.normalMatrix, this.mvMatrix);
            mat4.transpose(this.normalMatrix, this.normalMatrix);
            
            // Set uniforms for this model
            gl.uniformMatrix4fv(this.uniformLocations.normalMatrix, false, this.normalMatrix);
            gl.uniformMatrix4fv(this.uniformLocations.matrix, false, this.mvpMatrix);
            gl.uniformMatrix4fv(this.uniformLocations.modelMatrix, false, model.modelMatrix);
            
            // Draw the model
            gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_INT, 0);
        });
    }
}

//let isButtonPressed = false;

/*
const button = document.getElementById('button1');

let isButtonPressed = false;

button.addEventListener("mousedown", () => {
    isButtonPressed = true;
    console.log("Button is being pressed!");
});

button.addEventListener("mouseup", () => {
    isButtonPressed = false;
    console.log("Button released!");
});
*/
