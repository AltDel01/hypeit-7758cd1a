
export const createWaveGradient = (ctx: CanvasRenderingContext2D, centerX: number, centerRadius: number) => {
  const waveGradient = ctx.createLinearGradient(
    centerX - centerRadius * 2, 
    centerX - centerRadius * 2,
    centerX + centerRadius * 2, 
    centerX + centerRadius * 2
  );
  
  waveGradient.addColorStop(0, 'rgba(254, 207, 205, 0.9)');
  waveGradient.addColorStop(0.33, 'rgba(140, 82, 255, 0.9)');
  waveGradient.addColorStop(0.66, 'rgba(30, 174, 219, 0.9)');
  waveGradient.addColorStop(1, 'rgba(254, 207, 205, 0.9)');
  
  return waveGradient;
};

export const createCircleGradients = (
  ctx: CanvasRenderingContext2D, 
  centerX: number, 
  centerY: number,
  width: number,
  height: number
) => {
  const gradients = [];
  
  for (let i = 0; i < 3; i++) {
    const radius = Math.min(width, height) * (0.35 + i * 0.15);
    const gradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.7,
      centerX, centerY, radius
    );
    
    gradient.addColorStop(0, `rgba(140, 82, 255, ${0.15 + i * 0.05})`);
    gradient.addColorStop(0.5, `rgba(30, 174, 219, ${0.12 + i * 0.04})`);
    gradient.addColorStop(1, 'rgba(30, 174, 219, 0)');
    
    gradients.push({ radius, gradient });
  }
  
  return gradients;
};

export const createInnerGradient = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  centerRadius: number
) => {
  const innerGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, centerRadius
  );
  
  innerGradient.addColorStop(0, 'rgba(234, 56, 76, 0.9)');  // Red shade
  innerGradient.addColorStop(0.4, 'rgba(140, 82, 255, 0.7)'); // Purple
  innerGradient.addColorStop(0.8, 'rgba(30, 174, 219, 0.5)'); // Blue shade
  
  return innerGradient;
};

export const createPulseGradient = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  pulseRadius: number
) => {
  const pulseGradient = ctx.createLinearGradient(
    centerX - pulseRadius, centerY, 
    centerX + pulseRadius, centerY
  );
  
  pulseGradient.addColorStop(0, 'rgba(254, 207, 205, 0.7)');
  pulseGradient.addColorStop(0.5, 'rgba(140, 82, 255, 0.7)');
  pulseGradient.addColorStop(1, 'rgba(30, 174, 219, 0.7)');
  
  return pulseGradient;
};
