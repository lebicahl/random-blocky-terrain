export class HeightsGenerator {
    constructor(seed) {
        this.seed = seed;
        
        this.xOffset = 100000;
        this.zOffset = 100000;
        
        this.AMPLITUDE = 20;
        
    }
    
    mulberry32(seed) {
        return function() {
            seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    
    getNoise(x, z) {
        const random = this.mulberry32(x * 3458763 + z * 4738576 + this.seed);
        const result = Math.random() * 2 - 1;
        return result;
    }
    
    getSmoothNoise(x, z, randomNumbers) {
        const offset = 1;
        x += offset;
        z += offset;
        const corners = (randomNumbers[x-1][z-1] +
            randomNumbers[x+1][z-1] +
            randomNumbers[x-1][z+1] +
            randomNumbers[x+1][z+1])/4;
        const sides = (randomNumbers[x-1][z] +
            randomNumbers[x+1][z] +
            randomNumbers[x][z-1] +
            randomNumbers[x][z+1])/4;
        const center = randomNumbers[x][z]/1;
        return corners + sides + center;
    }
    
    interpolate(a, b, blend) {
        const theta = blend * Math.PI;
        const f = (1 - Math.cos(theta)) * 0.5;
        return a * (1 - f) + b * f;
    }
    
    getInterpolatedNoise(x, z, randomNumbers) {
        const intX = Math.floor(x);
        const intZ = Math.floor(z);
        const fracX = x - intX;
        const fracZ = z - intZ;
        
        const v1 = this.getSmoothNoise(intX, intZ, randomNumbers);
        const v2 = this.getSmoothNoise(intX + 1, intZ, randomNumbers);
        const v3 = this.getSmoothNoise(intX, intZ + 1, randomNumbers);
        const v4 = this.getSmoothNoise(intX + 1, intZ + 1, randomNumbers);
        const i1 = this.interpolate(v1, v2, fracX);
        const i2 = this.interpolate(v3, v4, fracX);
        return this.interpolate(i1, i2, fracZ);
    }
    
    generateHeight(x, z, randomNumbers) {
        let height = this.getInterpolatedNoise(x/29, z/29, randomNumbers) * this.AMPLITUDE;
        height += this.getInterpolatedNoise(x/13, z/13, randomNumbers) * this.AMPLITUDE/2;
        height += this.getInterpolatedNoise(x/17, z/17, randomNumbers) * this.AMPLITUDE/3;
        return height
    }
    
    generateRandomNumbers(randomNumbers) {
        for (let i = 0; i < randomNumbers.length; i++) {
            for (let j = 0; j < randomNumbers[0].length; j++) {
                randomNumbers[i][j] = this.getNoise(i, j);
            }
        }
    }
    
}