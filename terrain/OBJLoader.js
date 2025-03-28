export class OBJLoader {
    constructor() {
        this.vertices = [];
        this.textureCoords = [];
        this.normals = [];
        this.indices = [];
    }

    loadOBJ(objText) {
        const vertexTemp = [];
        const texCoordTemp = [];
        const normalTemp = [];

        const lines = objText.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('#') || line.length === 0) continue;

            const parts = line.split(/\s+/);
            const type = parts[0];

            switch (type) {
                case 'v': // Vertex position
                    vertexTemp.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    );
                    break;
                case 'vt': // Texture coordinate
                    texCoordTemp.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2])
                    );
                    break;
                case 'vn': // Vertex normal
                    normalTemp.push(
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    );
                    break;
                case 'f': // Face
                    for (let i = 1; i <= 3; i++) {
                        const indices = parts[i].split('/');
                        const vIndex = parseInt(indices[0]) - 1;
                        const vtIndex = indices[1] ? parseInt(indices[1]) - 1 : -1;
                        const vnIndex = indices[2] ? parseInt(indices[2]) - 1 : -1;

                        // Store the actual indices
                        this.indices.push(this.vertices.length / 3);
                        
                        // Store the vertex data
                        this.vertices.push(
                            vertexTemp[vIndex * 3],
                            vertexTemp[vIndex * 3 + 1],
                            vertexTemp[vIndex * 3 + 2]
                        );

                        if (vtIndex >= 0) {
                            this.textureCoords.push(
                                texCoordTemp[vtIndex * 2],
                                texCoordTemp[vtIndex * 2 + 1]
                            );
                        }

                        if (vnIndex >= 0) {
                            this.normals.push(
                                normalTemp[vnIndex * 3],
                                normalTemp[vnIndex * 3 + 1],
                                normalTemp[vnIndex * 3 + 2]
                            );
                        }
                    }
                    break;
            }
        }
        return this;
    }
}