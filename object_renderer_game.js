import { OBJLoader } from './terrain/OBJLoader.js';

import { Model } from './terrain/model.js';

import { Renderer } from './terrain/renderer.js';

import { ChunkModel } from './terrain/chunk_model.js';

import { HeightsGenerator } from './terrain/heights_generator.js';

// Main application code
const renderers = new Map();

// Create a renderer for a canvas
async function createRenderer(canvasId) {
    const canvas = document.getElementById(canvasId);
    const renderer = new Renderer(canvas);
    renderers.set(canvasId, renderer);
    return renderer;
}

async function getRenderer(canvasId) {
    if (!renderers.has(canvasId)) {
        console.warn(`Renderer for canvasId "${canvasId}" does not exist.`);
        return null;
    }
    return renderers.get(canvasId);
}



//const canvas = document.getElementById("canvas_game");

let isMouseDown = false;
let lastX = 0, lastY = 0;
let deltaX = 0, deltaY = 0;
let lastMoveTime = 0;
const MOVEMENT_TIMEOUT = 50; // milliseconds to wait before considering mouse as "not moving"

// Get mouse or touch position
function getPosition(event) {
    if (event.touches) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else {
        return { x: event.clientX, y: event.clientY };
    }
}

// Start tracking (Mouse & Touch)
function startTracking(event) {
    event.preventDefault();
    isMouseDown = true;
    const pos = getPosition(event);
    lastX = pos.x;
    lastY = pos.y;
}

// Stop tracking (Mouse & Touch)
function stopTracking() {
    isMouseDown = false;
    deltaX = 0;
    deltaY = 0;
}

// Track movement (Mouse & Touch)
function trackMovement(event) {
    if (!isMouseDown) return;
    
    const pos = getPosition(event);
    deltaX = pos.x - lastX;
    deltaY = pos.y - lastY;
    
    lastX = pos.x;
    lastY = pos.y;
    lastMoveTime = Date.now(); // Update the last movement time
}

// Check for inactive mouse and reset deltas
function update() {
    // If mouse is down but hasn't moved for MOVEMENT_TIMEOUT ms, reset deltas
    if (isMouseDown && (Date.now() - lastMoveTime > MOVEMENT_TIMEOUT)) {
        deltaX = 0;
        deltaY = 0;
    }
    
    // Use deltaX and deltaY values for your animations/calculations here
    
    // Continue the update loop
    requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("canvas_game");
    if (canvas) {
    // Event listeners for Mouse
    canvas.addEventListener("mousedown", startTracking);
    canvas.addEventListener("mouseup", stopTracking);
    canvas.addEventListener("mouseleave", stopTracking);
    canvas.addEventListener("mousemove", trackMovement);

    // Event listeners for Touch
    canvas.addEventListener("touchstart", startTracking);
    canvas.addEventListener("touchend", stopTracking);
    canvas.addEventListener("touchcancel", stopTracking);
    canvas.addEventListener("touchmove", trackMovement);
    }
});

update();



function animate(mouseX, mouseY, dx, dy) {
  
    requestAnimationFrame(() => animate(mouseX, mouseY, deltaX, deltaY));
    
    // Render all scenes
    for (const renderer of renderers.values()) {
        renderer.render(renderer.spinSpeed, renderer.moveSpeed, dx, dy);
    }
}

export async function update_projection(width, height) {
    const renderer2 = await getRenderer('canvas_game');
    
    renderer2.reProjectionMatrix(width, height);
    
    renderer2.gl.viewport(0,0,width, height);
}

export async function update_projection_game(width, height) {
    const renderer2 = await getRenderer('canvas_game');
    
    renderer2.reProjectionMatrix(width, height);
    
    renderer2.gl.viewport(0,0,width, height);
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export const heights_generator = new HeightsGenerator(12345678);
    
export const randomNumbers = [];

export async function draw_game() {
    const renderer1 = await createRenderer('canvas_game');
    
    const texture = renderer1.loadTexture('/terrain/textures/eranorSpriteMapV5.png');

    for (let i = 0; i < 100; i++) {
        randomNumbers[i] = [];
        for (let j = 0; j < 100; j++) {
            randomNumbers[i][j] = 0;
        }
    }
    
    heights_generator.generateRandomNumbers(randomNumbers);
    
    const chunks = [];
    for (let i = 0; i < 1; i++) {
        for (let j = 0; j < 1; j++) {
            const chunk_model = new ChunkModel(i*16, j*16, randomNumbers, heights_generator);
            const chunk = await chunk_model.createChunk();
            
            await renderer1.addModelChunk(chunk[0], chunk[1], chunk[2], chunk[3], texture, i*16+160, j*16);
        }
    }
    
    renderer1.startViewMatrix();
    renderer1.setCamera();
    
    animate(0, 0, 0, 0);
}