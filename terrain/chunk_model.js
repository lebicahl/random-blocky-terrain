export class ChunkModel {
    constructor(x, z, randomNumbers, heightsGenerator) {
        this.texture = new Array(1679616);
        this.bitMap = new Array(1679616);
        let counterT = 0;
        
        const heights = [];
        for (let i = -1; i < 161; i++) {
            heights.push([]);
        }
        
        for (let i = -1; i < 161; i++) {
            for (let j = -1; j < 161; j++) {
                heights[i+1][j+1] = heightsGenerator.generateHeight(i+x+500, j+z+500, randomNumbers);
            }
        }
        
        for (let i = -1; i < 161; i++) {
            for (let j = 0; j < 64; j++) {
                for (let k = -1; k < 161; k++) {
                    let height = heights[i+1][k+1];
                    const mountainHeight = height - 7;
                    if (height > 12) {
                        height += mountainHeight;
                    }
                    
                    if (height > 45) {
                        height = 45;
                    }
                    
                    if (height < -16) {
                        height = -16;
                    }
                    
                    if (j > height + 20) {
                        this.texture[counterT] = 0;
                    } else if (j > height + 17)  {
                        this.texture[counterT] = 0;
                    } else if (j > height + 16) {
                        this.texture[counterT] = 1;
                    } else if (j > height + 15) {
                        this.texture[counterT] = 5;
                    } else {
                        this.texture[counterT] = 2;
                    }
                    /*
                    if (j > 0) {
                        this.texture[counterT] = 0;
                    } else {
                        this.texture[counterT] = 1;
                    }
                    */
                    counterT++;
                }
            }
        }

        this.x = x;
        this.z = z;
    }
    
    async initBit() {
        let bitCounter = 0;
        for (let i = -1; i < 161; i++) {
            for (let j = 0; j < 64; j++) {
                for (let k = -1; k < 161; k++) {
                    this.bitMap[bitCounter] = false;
                    if (this.texture[bitCounter] != 0) {
                        this.bitMap[bitCounter] = true;
                    }
                    bitCounter++;
                }
            }
        }
    }
    
    async createChunk() {
        await this.initBit();
        
        let counterT = 0;
        
        const vertices = [];
        const indices = [];
        const textCoords = [];
        const normals = [];
        
        let counterIP = 0;
        
        let xPosBack = 0;
        let yPosBack = 0;
        let xPosFront = 0;
        let yPosFront = 0;
        let xPosRight = 0;
        let yPosRight = 0;
        let xPosLeft = 0;
        let yPosLeft = 0;
        let xPosTop = 0;
        let yPosTop = 0;
        let xPosBot = 0;
        let yPosBot = 0;
        
        let spriteR = 1.0/16.0;
        
        for (let i = -1; i < 161; i++) {
            for (let j = 0; j < 64; j++) {
                for (let k = -1; k < 161; k++) {
                    if (this.bitMap[counterT] == true) {
                        switch (this.texture[counterT]) {
                            case 1: {
                                xPosBack = 2;
                                yPosBack = 0;
                                xPosFront = 2;
                                yPosFront = 0;
                                xPosRight = 2;
                                yPosRight = 0;
                                xPosLeft = 2;
                                yPosLeft =0;
                                xPosTop = 1;
                                yPosTop = 0;
                                xPosBot = 3;
                                yPosBot = 0;
                                break;
                            }
                            case 2: {
                                xPosBack = 4;
                                yPosBack = 2;
                                xPosFront = 4;
                                yPosFront = 2;
                                xPosRight = 4;
                                yPosRight = 2;
                                xPosLeft = 4;
                                yPosLeft = 2;
                                xPosTop = 4;
                                yPosTop = 0;
                                xPosBot = 4;
                                yPosBot = 3;
                                break;
                            }
                            case 3: {
                                xPosBack = 5;
                                yPosBack = 2;
                                xPosFront = 5;
                                yPosFront = 2;
                                xPosRight = 5;
                                yPosRight = 2;
                                xPosLeft = 5;
                                yPosLeft = 2;
                                xPosTop = 5;
                                yPosTop = 0;
                                xPosBot = 5;
                                yPosBot = 3;
                                break;
                            }
                            case 4: {
                                xPosBack = 6;
                                yPosBack = 2;
                                xPosFront = 6;
                                yPosFront = 2;
                                xPosRight = 6;
                                yPosRight = 2;
                                xPosLeft = 6;
                                yPosLeft = 2;
                                xPosTop = 6;
                                yPosTop = 0;
                                xPosBot = 6;
                                yPosBot = 3;
                                break;
                            }
                            case 5: {
                                xPosBack = 7;
                                yPosBack = 0;
                                xPosFront = 7;
                                yPosFront = 0;
                                xPosRight = 7;
                                yPosRight = 0;
                                xPosLeft = 7;
                                yPosLeft = 0;
                                xPosTop = 7;
                                yPosTop = 0;
                                xPosBot = 7;
                                yPosBot = 0;
                                break;
                            }
                        }
                        
                        const epsilon = 0.005;
                        
                        if (k > -1 && k < 161) {
                            if (i < 161 && i > -1) {
                                if (this.bitMap[counterT-1] == false) {
                                    //back face
                                    vertices.push(i+0, j+1, k+0);
                                    vertices.push(i+0, j+0, k+0);
                                    vertices.push(i+1, j+0, k+0);
                                    vertices.push(i+1, j+1, k+0);
                                    
                                    textCoords.push(xPosBack * spriteR + spriteR - epsilon, yPosBack * spriteR + epsilon);
                                    textCoords.push(xPosBack * spriteR + spriteR - epsilon, yPosBack * spriteR + spriteR - epsilon);
                                    textCoords.push(xPosBack * spriteR + epsilon, yPosBack * spriteR + spriteR - epsilon);
                                    textCoords.push(xPosBack * spriteR + epsilon, yPosBack * spriteR + epsilon);
                                    
                                    normals.push(0,0,-1);
                                    normals.push(0,0,-1);
                                    normals.push(0,0,-1);
                                    normals.push(0,0,-1);
                                    
                                    indices.push(3 + counterIP);
                                    indices.push(1 + counterIP);
                                    indices.push(0 + counterIP);
                                    indices.push(2 + counterIP);
                                    indices.push(1 + counterIP);
                                    indices.push(3 + counterIP);
                                    counterIP += 4;
                                }
                            }
                        }
                        
                        if (k < 161 && k > -1) {
                            if (i < 161 && i > -1) {
                                if (this.bitMap[counterT+1] == false) {
                                    //front face
                                    vertices.push(i+0, j+1, k+1);
                                    vertices.push(i+0, j+0, k+1);
                                    vertices.push(i+1, j+0, k+1);
                                    vertices.push(i+1, j+1, k+1);
                                    
                                    textCoords.push(xPosFront * spriteR + epsilon, yPosFront * spriteR + epsilon);
                                    textCoords.push(xPosFront * spriteR + epsilon, yPosFront * spriteR + spriteR - epsilon);
                                    textCoords.push(xPosFront * spriteR + spriteR - epsilon, yPosFront * spriteR + spriteR - epsilon);
                                    textCoords.push(xPosFront * spriteR + spriteR - epsilon, yPosFront * spriteR + epsilon);
                                    
                                    normals.push(0,0,1);
                                    normals.push(0,0,1);
                                    normals.push(0,0,1);
                                    normals.push(0,0,1);
                                    
                                    indices.push(3 + counterIP);
                                    indices.push(1 + counterIP);
                                    indices.push(2 + counterIP);
                                    indices.push(0 + counterIP);
                                    indices.push(1 + counterIP);
                                    indices.push(3 + counterIP);
                                    counterIP+=4;
                                }
                            }
                        }
                            
                        if (i < 161 && i > -1) {
                            if (k < 161 && k > -1) {
                                if (this.bitMap[counterT+10368] == false) {
                                    //right face
                                    vertices.push(i+1, j+1, k+0);
                                    vertices.push(i+1, j+0, k+0);
                                    vertices.push(i+1, j+0, k+1);
                                    vertices.push(i+1, j+1, k+1);
                                    
                                    textCoords.push(xPosRight * spriteR + spriteR - epsilon, yPosRight * spriteR + epsilon);
                                    textCoords.push(xPosRight * spriteR + spriteR - epsilon, yPosRight * spriteR + spriteR - epsilon);
                                    textCoords.push(xPosRight * spriteR + epsilon, yPosRight * spriteR + spriteR - epsilon);
                                    textCoords.push(xPosRight * spriteR + epsilon, yPosRight * spriteR + epsilon);
                                    
                                    normals.push(1,0,0);
                                    normals.push(1,0,0);
                                    normals.push(1,0,0);
                                    normals.push(1,0,0);
                                    
                                    indices.push(3 + counterIP);
                                    indices.push(1 + counterIP);
                                    indices.push(0 + counterIP);
                                    indices.push(2 + counterIP);
                                    indices.push(1 + counterIP);
                                    indices.push(3 + counterIP);
                                    counterIP += 4;
                                }
                            }
                        }
                        
                        if (i > -1 && i < 161) {
                            if (k < 161 && k > -1) {
                                if (this.bitMap[counterT-10368] == false) {
                                    //left face
                                    vertices.push(i+0, j+1, k+0);
                                    vertices.push(i+0, j+0, k+0);
                                    vertices.push(i+0, j+0, k+1);
                                    vertices.push(i+0, j+1, k+1);
                                    
                                    textCoords.push(xPosLeft * spriteR + epsilon, yPosLeft * spriteR + epsilon);
                                    textCoords.push(xPosLeft * spriteR + epsilon, yPosLeft * spriteR + spriteR - epsilon);
                                    textCoords.push(xPosLeft * spriteR + spriteR - epsilon, yPosLeft * spriteR + spriteR - epsilon);
                                    textCoords.push(xPosLeft * spriteR + spriteR - epsilon, yPosLeft * spriteR + epsilon);
                                    
                                    normals.push(-1,0,0);
                                    normals.push(-1,0,0);
                                    normals.push(-1,0,0);
                                    normals.push(-1,0,0);
                                    
                                    indices.push(0 + counterIP);
                                    indices.push(1 + counterIP);
                                    indices.push(3 + counterIP);
                                    indices.push(3 + counterIP);
                                    indices.push(1 + counterIP);
                                    indices.push(2 + counterIP);
                                    counterIP += 4;
                                }
                            }
                        }
                        
                        if (j < 63) {
                            if (k < 161 && k > -1) {
                                if (i > -1 && i < 161) {
                                    if (this.bitMap[counterT+162] == false) {
                                        //top face
                                        vertices.push(i+0, j+1, k+1);
                                        vertices.push(i+0, j+1, k+0);
                                        vertices.push(i+1, j+1, k+0);
                                        vertices.push(i+1, j+1, k+1);
                                        
                                        textCoords.push(xPosTop * spriteR + spriteR - epsilon, yPosTop * spriteR + epsilon);
                                        textCoords.push(xPosTop * spriteR + spriteR - epsilon, yPosTop * spriteR + spriteR - epsilon);
                                        textCoords.push(xPosTop * spriteR + epsilon, yPosTop * spriteR + spriteR - epsilon);
                                        textCoords.push(xPosTop * spriteR + epsilon, yPosTop * spriteR + epsilon);
                                        
                                        normals.push(0,1,0);
                                        normals.push(0,1,0);
                                        normals.push(0,1,0);
                                        normals.push(0,1,0);
                                        
                                        indices.push(3 + counterIP);
                                        indices.push(1 + counterIP);
                                        indices.push(0 + counterIP);
                                        indices.push(2 + counterIP);
                                        indices.push(1 + counterIP);
                                        indices.push(3 + counterIP);
                                        counterIP +=4;
                                    }
                                }
                            }
                        }
                        
                        if (j > 0) {
                            if (k < 161 && k > -1) {
                                if (i > -1 && i < 161) {
                                    if (this.bitMap[counterT-162] == false) {
                                        //bottom face
                                        vertices.push(i+0, j+0, k+1);
                                        vertices.push(i+0, j+0, k+0);
                                        vertices.push(i+1, j+0, k+0);
                                        vertices.push(i+1, j+0, k+1);
                                        
                                        textCoords.push(xPosBot * spriteR + epsilon, yPosBot * spriteR + epsilon);
                                        textCoords.push(xPosBot * spriteR + epsilon, yPosBot * spriteR + spriteR - epsilon);
                                        textCoords.push(xPosBot * spriteR + spriteR - epsilon, yPosBot * spriteR + spriteR - epsilon);
                                        textCoords.push(xPosBot * spriteR + spriteR - epsilon, yPosBot * spriteR + epsilon);
                                        
                                        normals.push(0,-1,0);
                                        normals.push(0,-1,0);
                                        normals.push(0,-1,0);
                                        normals.push(0,-1,0);
                                        
                                        indices.push(0 + counterIP);
                                        indices.push(1 + counterIP);
                                        indices.push(3 + counterIP);
                                        indices.push(3 + counterIP);
                                        indices.push(1 + counterIP);
                                        indices.push(2 + counterIP);
                                    }
                                }
                            }
                        }
                        
                    }
                    counterT++;
                }
            }
        }
        const result = [];
        result.push(vertices, textCoords, normals, indices);
        /*
        console.log("this.bitMap:", this.bitMap.slice(0, 20)); // Check first 20 values
        console.log("this.texture:", this.texture.slice(0, 20)); // Check first 20 values

        console.log("Vertices Count:", vertices.length);
        console.log("Texture Coords Count:", textCoords.length);
        console.log("Normals Count:", normals.length);
        console.log("Indices Count:", indices.length);
        */
        return result;
    }
}