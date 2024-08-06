import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const ShapeCanvas = ({ shapes }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const drawShapes = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach(shape => {
        context.fillStyle = shape.color;
        switch (shape.type) {
          case 'circle':
            context.beginPath();
            context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
            context.fill();
            break;
          case 'square':
            context.fillRect(shape.x, shape.y, shape.width, shape.height);
            break;
          case 'rectangle':
            context.fillRect(shape.x, shape.y, shape.width, shape.height);
            break;
          default:
            break;
        }
      });
    };

    const animate = () => {
      drawShapes();
      requestAnimationFrame(animate);
    };

    animate();
  }, [shapes]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};
