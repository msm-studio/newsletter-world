'use client';

import { useEffect, useRef, useState } from 'react';

type Animal = 'turtle' | 'pig' | 'lemur' | 'axolotl';

export default function CharacterTest() {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal>('turtle');

  const canvasRefs = [
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
  ];

  useEffect(() => {
    canvasRefs.forEach((ref, index) => {
      const canvas = ref.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Light background
      ctx.fillStyle = '#E8C3A0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the character option
      if (selectedAnimal === 'turtle') {
        drawTurtleOption(ctx, index, 40, 60, 80, 120);
      } else if (selectedAnimal === 'pig') {
        drawPigOption(ctx, index, 40, 60, 80, 120);
      } else if (selectedAnimal === 'lemur') {
        drawLemurOption(ctx, index, 40, 60, 80, 120);
      } else if (selectedAnimal === 'axolotl') {
        drawAxolotlOption(ctx, index, 40, 60, 80, 120);
      }
    });
  }, [selectedAnimal]);

  const animals: { id: Animal; emoji: string; name: string }[] = [
    { id: 'turtle', emoji: '🐢', name: 'Turtle' },
    { id: 'pig', emoji: '🐷', name: 'Pig' },
    { id: 'lemur', emoji: '🐒', name: 'Lemur' },
    { id: 'axolotl', emoji: '🦎', name: 'Axolotl' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Character Style Options</h1>

      {/* Animal selector tabs */}
      <div className="flex gap-2 mb-8">
        {animals.map((animal) => (
          <button
            key={animal.id}
            onClick={() => setSelectedAnimal(animal.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedAnimal === animal.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {animal.emoji} {animal.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        {canvasRefs.map((ref, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Option {index + 1}</h2>
            <canvas
              ref={ref}
              width={160}
              height={200}
              className="border-2 border-gray-300 rounded"
            />
            <p className="mt-2 text-sm text-gray-600">
              {getOptionDescription(selectedAnimal, index)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm">
          These are facing RIGHT (walking direction). The horizontal flip will happen automatically when walking left.
        </p>
      </div>
    </div>
  );
}

function getOptionDescription(animal: Animal, option: number): string {
  const descriptions = {
    turtle: [
      'Chibi style - big head, tiny body, huge eyes',
      'Classic cartoon - balanced proportions, friendly',
      'Realistic cute - natural turtle shape but simplified',
      'Minimalist - simple shapes, iconic silhouette'
    ],
    pig: [
      'Chibi style - round body, huge snout, tiny legs',
      'Classic cartoon - chubby and friendly, curly tail',
      'Realistic cute - natural pig shape, floppy ears',
      'Minimalist - simple pink circles, iconic snout'
    ],
    lemur: [
      'Chibi style - huge eyes, fluffy tail bigger than body',
      'Classic cartoon - striped tail, friendly expression',
      'Realistic cute - natural lemur posture, alert eyes',
      'Minimalist - simple silhouette with striped tail'
    ],
    axolotl: [
      'Chibi style - huge head, big eyes, frilly gills',
      'Classic cartoon - smooth body, cute gill fronds',
      'Realistic cute - natural axolotl shape, spots',
      'Minimalist - simple pink shape, minimal gills'
    ]
  };
  return descriptions[animal][option];
}

// TURTLE OPTIONS
function drawTurtleOption(
  ctx: CanvasRenderingContext2D,
  option: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  switch(option) {
    case 0:
      drawTurtleChibi(ctx, x, y, width, height);
      break;
    case 1:
      drawTurtleClassic(ctx, x, y, width, height);
      break;
    case 2:
      drawTurtleRealistic(ctx, x, y, width, height);
      break;
    case 3:
      drawTurtleMinimal(ctx, x, y, width, height);
      break;
  }
}

// Option 1: Chibi style - super cute, big head
function drawTurtleChibi(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Shell (main body - large and round)
  const shellGradient = ctx.createRadialGradient(x + width/2, y + height*0.55, 0, x + width/2, y + height*0.55, width*0.5);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.arc(x + width/2, y + height*0.55, width*0.45, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern
  ctx.strokeStyle = '#1a5c1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + width/2, y + height*0.55, 8 + i*6, 0, Math.PI * 2);
    ctx.stroke();
  }

  // HUGE head (chibi style - head is disproportionately large)
  const headGradient = ctx.createRadialGradient(x + width*0.8, y + height*0.25, 0, x + width*0.8, y + height*0.25, 18);
  headGradient.addColorStop(0, '#4DAF4D');
  headGradient.addColorStop(1, '#3D9B3D');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width*0.8, y + height*0.25, 16, 0, Math.PI * 2);
  ctx.fill();

  // HUGE sparkly eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.82, y + height*0.23, 5, 0, Math.PI * 2);
  ctx.fill();

  // Big white highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.84, y + height*0.21, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Tiny smile
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + width*0.8, y + height*0.3, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Stubby little legs
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.arc(x + width*0.7, y + height*0.85, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.35, y + height*0.88, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Option 2: Classic cartoon style - balanced, friendly
function drawTurtleClassic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Shell (dome shape)
  const shellGradient = ctx.createLinearGradient(x, y + height*0.4, x, y + height*0.8);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.5, y + height*0.6, width*0.4, height*0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern (hexagons)
  ctx.strokeStyle = '#1a5c1a';
  ctx.lineWidth = 2;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.beginPath();
      ctx.arc(x + width*0.35 + col*15, y + height*0.55 + row*12, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Head (oval, sticking out)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, y + height*0.35, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (on sides of head)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.85, y + height*0.32, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.85, y + height*0.32, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.86, y + height*0.31, 1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + width*0.78, y + height*0.4);
  ctx.quadraticCurveTo(x + width*0.82, y + height*0.42, x + width*0.86, y + height*0.4);
  ctx.stroke();

  // Legs (flipper-like)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.82, 7, 11, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, y + height*0.85, 7, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Option 3: Realistic cute - more natural proportions
function drawTurtleRealistic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Shell (more oval, realistic)
  const shellGradient = ctx.createRadialGradient(x + width*0.45, y + height*0.55, 0, x + width*0.45, y + height*0.55, width*0.45);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(0.5, '#3D9B3D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.45, y + height*0.55, width*0.42, height*0.38, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Scutes (shell plates)
  ctx.fillStyle = '#2D7B2D';
  ctx.globalAlpha = 0.3;
  const scutes = [
    {x: 0.35, y: 0.5}, {x: 0.5, y: 0.5},
    {x: 0.35, y: 0.65}, {x: 0.5, y: 0.65}
  ];
  scutes.forEach(s => {
    ctx.beginPath();
    ctx.arc(x + width*s.x, y + height*s.y, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;

  // Smaller head (realistic proportions)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.85, y + height*0.38, 9, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.87, y + height*0.36, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.88, y + height*0.35, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Wrinkly neck
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + width*0.7, y + height*0.42 + i*3);
    ctx.lineTo(x + width*0.77, y + height*0.42 + i*3);
    ctx.stroke();
  }

  // Realistic legs
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.7, y + height*0.8, 5, 10, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.3, y + height*0.83, 5, 9, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Claws
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + width*0.7 + i*3, y + height*0.88);
    ctx.lineTo(x + width*0.7 + i*3, y + height*0.92);
    ctx.stroke();
  }

  ctx.restore();
}

// Option 4: Minimalist - simple iconic shapes
function drawTurtleMinimal(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Shell (simple circle)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.arc(x + width*0.5, y + height*0.58, width*0.4, 0, Math.PI * 2);
  ctx.fill();

  // Simple shell pattern (one circle)
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + width*0.5, y + height*0.58, width*0.25, 0, Math.PI * 2);
  ctx.stroke();

  // Head (simple circle)
  ctx.fillStyle = '#4DAF4D';
  ctx.beginPath();
  ctx.arc(x + width*0.82, y + height*0.32, 12, 0, Math.PI * 2);
  ctx.fill();

  // Simple dot eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.84, y + height*0.3, 3, 0, Math.PI * 2);
  ctx.fill();

  // Simple curved smile
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + width*0.82, y + height*0.35, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Simple nubs for legs (circles)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.arc(x + width*0.68, y + height*0.82, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.32, y + height*0.85, 8, 0, Math.PI * 2);
  ctx.fill();

  // Tiny tail
  ctx.beginPath();
  ctx.arc(x + width*0.15, y + height*0.6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ==================== PIG OPTIONS ====================

function drawPigOption(
  ctx: CanvasRenderingContext2D,
  option: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  switch(option) {
    case 0:
      drawPigChibi(ctx, x, y, width, height);
      break;
    case 1:
      drawPigClassic(ctx, x, y, width, height);
      break;
    case 2:
      drawPigRealistic(ctx, x, y, width, height);
      break;
    case 3:
      drawPigMinimal(ctx, x, y, width, height);
      break;
  }
}

function drawPigChibi(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Round body (HUGE)
  const bodyGradient = ctx.createRadialGradient(x + width/2, y + height*0.55, 0, x + width/2, y + height*0.55, width*0.5);
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(1, '#FF9BAE');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(x + width/2, y + height*0.55, width*0.45, 0, Math.PI * 2);
  ctx.fill();

  // HUGE snout sticking out
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.85, y + height*0.45, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#D4909E';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, y + height*0.43, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, y + height*0.48, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // HUGE eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.62, y + height*0.35, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.64, y + height*0.33, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Tiny floppy ear
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, y + height*0.3, 10, 15, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Stubby little legs
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.88, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, y + height*0.88, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curly tail
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + width*0.05, y + height*0.5, 8, 0, Math.PI * 1.5);
  ctx.stroke();

  ctx.restore();
}

function drawPigClassic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Oval body
  const bodyGradient = ctx.createLinearGradient(x, y + height*0.4, x, y + height*0.8);
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(1, '#FF9BAE');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.5, y + height*0.6, width*0.38, height*0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head/snout area
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.8, y + height*0.38, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout detail
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.88, y + height*0.4, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#D4909E';
  ctx.beginPath();
  ctx.arc(x + width*0.86, y + height*0.38, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.86, y + height*0.42, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.78, y + height*0.32, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.79, y + height*0.31, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Floppy ear
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.62, y + height*0.3, 8, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.85, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, y + height*0.85, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curly tail
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + width*0.1, y + height*0.55, 10, -0.5, Math.PI);
  ctx.stroke();

  ctx.restore();
}

function drawPigRealistic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // More natural pig body shape
  const bodyGradient = ctx.createRadialGradient(x + width*0.45, y + height*0.58, 0, x + width*0.45, y + height*0.58, width*0.4);
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(0.6, '#FF9BAE');
  bodyGradient.addColorStop(1, '#D4909E');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.45, y + height*0.58, width*0.4, height*0.35, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Head/snout
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, y + height*0.4, 12, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Snout plate
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.9, y + height*0.42, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostril details
  ctx.fillStyle = '#8B6B7A';
  ctx.beginPath();
  ctx.ellipse(x + width*0.88, y + height*0.4, 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.88, y + height*0.44, 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.8, y + height*0.35, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.81, y + height*0.34, 1, 0, Math.PI * 2);
  ctx.fill();

  // Large floppy ear
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.35, 7, 14, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Realistic legs
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.85, 6, 13, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.32, y + height*0.87, 6, 12, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Hoof marks
  ctx.strokeStyle = '#D4909E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + width*0.65, y + height*0.95);
  ctx.lineTo(x + width*0.65, y + height*0.98);
  ctx.stroke();

  // Curly tail (more realistic spiral)
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI;
    const radius = 6 + i * 1.5;
    const px = x + width*0.08 + Math.cos(angle) * radius;
    const py = y + height*0.6 + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.restore();
}

function drawPigMinimal(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Simple oval body
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.5, y + height*0.6, width*0.38, height*0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Simple snout circle
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.arc(x + width*0.85, y + height*0.45, 12, 0, Math.PI * 2);
  ctx.fill();

  // Two nostril dots
  ctx.fillStyle = '#D4909E';
  ctx.beginPath();
  ctx.arc(x + width*0.83, y + height*0.43, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.83, y + height*0.48, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Simple dot eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.7, y + height*0.4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Simple triangle ear
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.moveTo(x + width*0.42, y + height*0.4);
  ctx.lineTo(x + width*0.38, y + height*0.32);
  ctx.lineTo(x + width*0.48, y + height*0.38);
  ctx.closePath();
  ctx.fill();

  // Simple leg circles
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.arc(x + width*0.65, y + height*0.85, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.35, y + height*0.85, 8, 0, Math.PI * 2);
  ctx.fill();

  // Simple curved tail
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + width*0.12, y + height*0.58, 8, 0, Math.PI * 1.2);
  ctx.stroke();

  ctx.restore();
}

// ==================== LEMUR OPTIONS ====================

function drawLemurOption(
  ctx: CanvasRenderingContext2D,
  option: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  switch(option) {
    case 0:
      drawLemurChibi(ctx, x, y, width, height);
      break;
    case 1:
      drawLemurClassic(ctx, x, y, width, height);
      break;
    case 2:
      drawLemurRealistic(ctx, x, y, width, height);
      break;
    case 3:
      drawLemurMinimal(ctx, x, y, width, height);
      break;
  }
}

function drawLemurChibi(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Small body
  const bodyGradient = ctx.createRadialGradient(x + width*0.55, y + height*0.5, 0, x + width*0.55, y + height*0.5, width*0.3);
  bodyGradient.addColorStop(0, '#A0522D');
  bodyGradient.addColorStop(1, '#8B4513');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.55, y + height*0.5, width*0.25, height*0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // HUGE head
  const headGradient = ctx.createRadialGradient(x + width*0.7, y + height*0.25, 0, x + width*0.7, y + height*0.25, 22);
  headGradient.addColorStop(0, '#A0522D');
  headGradient.addColorStop(1, '#8B4513');
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width*0.7, y + height*0.25, 18, 0, Math.PI * 2);
  ctx.fill();

  // ENORMOUS eyes (chibi style)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.75, y + height*0.24, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.75, y + height*0.24, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.77, y + height*0.22, 3, 0, Math.PI * 2);
  ctx.fill();

  // MASSIVE striped tail (bigger than body)
  const tailSegments = 6;
  for (let i = 0; i < tailSegments; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#DEB887';
    const segmentWidth = 10;
    const segmentHeight = 15;
    ctx.beginPath();
    ctx.ellipse(
      x + width*0.2,
      y + height*0.25 + i * segmentHeight,
      segmentWidth,
      segmentHeight,
      0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Tiny legs
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.6, y + height*0.72, 5, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.48, y + height*0.72, 5, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawLemurClassic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Body
  const bodyGradient = ctx.createLinearGradient(x + width*0.5, y + height*0.4, x + width*0.5, y + height*0.7);
  bodyGradient.addColorStop(0, '#A0522D');
  bodyGradient.addColorStop(1, '#8B4513');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.55, y + height*0.55, width*0.22, height*0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.75, y + height*0.3, 13, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // White face patch
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.ellipse(x + width*0.78, y + height*0.32, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Large eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.8, y + height*0.28, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.8, y + height*0.28, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.81, y + height*0.27, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Ear tuft
  ctx.fillStyle = '#6B3410';
  ctx.beginPath();
  ctx.arc(x + width*0.7, y + height*0.2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Striped tail
  const tailSegments = 8;
  for (let i = 0; i < tailSegments; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#DEB887';
    ctx.beginPath();
    ctx.ellipse(
      x + width*0.25,
      y + height*0.35 + i * 10,
      8,
      12,
      0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Legs
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.62, y + height*0.82, 6, 14, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.48, y + height*0.82, 6, 14, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawLemurRealistic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Natural lemur body (more vertical)
  const bodyGradient = ctx.createRadialGradient(x + width*0.5, y + height*0.55, 0, x + width*0.5, y + height*0.55, width*0.25);
  bodyGradient.addColorStop(0, '#A0522D');
  bodyGradient.addColorStop(0.5, '#8B4513');
  bodyGradient.addColorStop(1, '#6B3410');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.5, y + height*0.55, width*0.2, height*0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly patch
  ctx.fillStyle = 'rgba(222, 184, 135, 0.6)';
  ctx.beginPath();
  ctx.ellipse(x + width*0.55, y + height*0.58, width*0.12, height*0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.78, y + height*0.32, 11, 13, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Face markings
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, y + height*0.34, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Alert eyes
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(x + width*0.83, y + height*0.3, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.83, y + height*0.3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.84, y + height*0.29, 1, 0, Math.PI * 2);
  ctx.fill();

  // Ear
  ctx.fillStyle = '#6B3410';
  ctx.beginPath();
  ctx.ellipse(x + width*0.72, y + height*0.24, 5, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Realistic ringed tail
  const tailSegments = 10;
  for (let i = 0; i < tailSegments; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#F5DEB3';
    ctx.beginPath();
    ctx.ellipse(
      x + width*0.22,
      y + height*0.38 + i * 8,
      7,
      10,
      0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Realistic legs (longer)
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.58, y + height*0.85, 5, 16, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.42, y + height*0.85, 5, 16, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Paws
  ctx.fillStyle = '#6B3410';
  ctx.beginPath();
  ctx.ellipse(x + width*0.58, y + height*0.98, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.42, y + height*0.98, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawLemurMinimal(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Simple oval body
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(x + width*0.55, y + height*0.58, width*0.2, height*0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Simple circle head
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.arc(x + width*0.75, y + height*0.32, 13, 0, Math.PI * 2);
  ctx.fill();

  // Large simple eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.78, y + height*0.3, 4, 0, Math.PI * 2);
  ctx.fill();

  // Simple striped tail (alternating circles)
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#DEB887';
    ctx.beginPath();
    ctx.arc(x + width*0.25, y + height*0.4 + i * 12, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Simple leg ovals
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.6, y + height*0.85, 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.48, y + height*0.85, 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ==================== AXOLOTL OPTIONS ====================

function drawAxolotlOption(
  ctx: CanvasRenderingContext2D,
  option: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  switch(option) {
    case 0:
      drawAxolotlChibi(ctx, x, y, width, height);
      break;
    case 1:
      drawAxolotlClassic(ctx, x, y, width, height);
      break;
    case 2:
      drawAxolotlRealistic(ctx, x, y, width, height);
      break;
    case 3:
      drawAxolotlMinimal(ctx, x, y, width, height);
      break;
  }
}

function drawAxolotlChibi(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // HUGE round head (chibi style)
  const headGradient = ctx.createRadialGradient(x + width*0.65, y + height*0.4, 0, x + width*0.65, y + height*0.4, width*0.35);
  headGradient.addColorStop(0, '#FFB6D9');
  headGradient.addColorStop(1, '#FF69B4');
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width*0.65, y + height*0.4, width*0.32, 0, Math.PI * 2);
  ctx.fill();

  // Tiny body
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.45, y + height*0.65, width*0.25, height*0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // HUGE kawaii eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.72, y + height*0.36, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.74, y + height*0.34, 3, 0, Math.PI * 2);
  ctx.fill();

  // Big smile
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + width*0.72, y + height*0.45, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // HUGE frilly gills (3 on each side)
  ctx.fillStyle = '#FF1493';
  for (let i = 0; i < 3; i++) {
    // Right side gills
    ctx.beginPath();
    ctx.moveTo(x + width*0.82, y + height*0.32 + i*6);
    for (let j = 0; j < 4; j++) {
      ctx.lineTo(x + width*0.82 + j*4, y + height*0.32 + i*6 + (j % 2) * 3);
    }
    ctx.stroke();
  }

  // Spots/freckles
  ctx.fillStyle = 'rgba(255, 20, 147, 0.4)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(x + width*(0.55 + Math.random()*0.2), y + height*(0.35 + Math.random()*0.15), 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stubby legs
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.52, y + height*0.82, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.38, y + height*0.82, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail fin
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.moveTo(x + width*0.2, y + height*0.65);
  ctx.quadraticCurveTo(x + width*0.05, y + height*0.55, x + width*0.15, y + height*0.7);
  ctx.quadraticCurveTo(x + width*0.05, y + height*0.75, x + width*0.2, y + height*0.65);
  ctx.fill();

  ctx.restore();
}

function drawAxolotlClassic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Smooth body
  const bodyGradient = ctx.createLinearGradient(x + width*0.2, y + height*0.5, x + width*0.8, y + height*0.5);
  bodyGradient.addColorStop(0, '#FF69B4');
  bodyGradient.addColorStop(0.5, '#FFB6D9');
  bodyGradient.addColorStop(1, '#FF69B4');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.5, y + height*0.55, width*0.38, height*0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head bump
  ctx.fillStyle = '#FFB6D9';
  ctx.beginPath();
  ctx.ellipse(x + width*0.75, y + height*0.42, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Friendly eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.78, y + height*0.4, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.79, y + height*0.39, 2, 0, Math.PI * 2);
  ctx.fill();

  // Happy smile
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + width*0.78, y + height*0.46, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Cute gill fronds (wavy)
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + width*0.88, y + height*0.38 + i*5);
    ctx.quadraticCurveTo(x + width*0.92, y + height*0.36 + i*5, x + width*0.95, y + height*0.38 + i*5);
    ctx.stroke();
  }

  // Legs
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.75, 6, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, y + height*0.75, 6, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Tail with fin
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.moveTo(x + width*0.12, y + height*0.55);
  ctx.quadraticCurveTo(x, y + height*0.45, x + width*0.08, y + height*0.6);
  ctx.quadraticCurveTo(x, y + height*0.65, x + width*0.12, y + height*0.55);
  ctx.fill();

  ctx.restore();
}

function drawAxolotlRealistic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Natural axolotl body shape
  const bodyGradient = ctx.createRadialGradient(x + width*0.5, y + height*0.52, 0, x + width*0.5, y + height*0.52, width*0.4);
  bodyGradient.addColorStop(0, '#FFB6D9');
  bodyGradient.addColorStop(0.5, '#FF69B4');
  bodyGradient.addColorStop(1, '#E75480');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.5, y + height*0.52, width*0.38, height*0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#FFB6D9';
  ctx.beginPath();
  ctx.ellipse(x + width*0.8, y + height*0.42, 13, 11, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Realistic eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.82, y + height*0.4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.83, y + height*0.39, 1, 0, Math.PI * 2);
  ctx.fill();

  // Realistic branching gills
  ctx.strokeStyle = '#E75480';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const baseY = y + height*0.36 + i*4;
    ctx.beginPath();
    ctx.moveTo(x + width*0.9, baseY);
    ctx.lineTo(x + width*0.95, baseY - 2);
    ctx.moveTo(x + width*0.9, baseY);
    ctx.lineTo(x + width*0.95, baseY);
    ctx.moveTo(x + width*0.9, baseY);
    ctx.lineTo(x + width*0.95, baseY + 2);
    ctx.stroke();
  }

  // Spots (natural pigmentation)
  ctx.fillStyle = 'rgba(199, 21, 133, 0.5)';
  const spots = [
    {x: 0.55, y: 0.48}, {x: 0.65, y: 0.5}, {x: 0.45, y: 0.52},
    {x: 0.7, y: 0.46}, {x: 0.38, y: 0.54}
  ];
  spots.forEach(spot => {
    ctx.beginPath();
    ctx.arc(x + width*spot.x, y + height*spot.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Four legs (realistic)
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.68, 5, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, y + height*0.68, 5, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Toes
  ctx.strokeStyle = '#E75480';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x + width*0.65 + i*2, y + height*0.78);
    ctx.lineTo(x + width*0.65 + i*2, y + height*0.8);
    ctx.stroke();
  }

  // Natural tail with crest
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.moveTo(x + width*0.12, y + height*0.52);
  ctx.quadraticCurveTo(x + width*0.02, y + height*0.4, x + width*0.08, y + height*0.56);
  ctx.quadraticCurveTo(x + width*0.02, y + height*0.64, x + width*0.12, y + height*0.52);
  ctx.fill();

  ctx.restore();
}

function drawAxolotlMinimal(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Simple oval body
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.5, y + height*0.55, width*0.38, height*0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Simple circle head
  ctx.fillStyle = '#FFB6D9';
  ctx.beginPath();
  ctx.arc(x + width*0.78, y + height*0.42, 14, 0, Math.PI * 2);
  ctx.fill();

  // Simple dot eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.8, y + height*0.4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Simple smile
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + width*0.78, y + height*0.46, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Simple gill lines (3 on side)
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + width*0.88, y + height*0.38 + i*5);
    ctx.lineTo(x + width*0.95, y + height*0.38 + i*5);
    ctx.stroke();
  }

  // Simple leg ovals
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.62, y + height*0.75, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.38, y + height*0.75, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Simple triangle tail
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.moveTo(x + width*0.12, y + height*0.55);
  ctx.lineTo(x, y + height*0.5);
  ctx.lineTo(x, y + height*0.6);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
