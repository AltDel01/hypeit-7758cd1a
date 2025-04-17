
interface WavePoint {
  x: number;
  y: number;
}

export const calculateWavePoints = (
  dataArray: Uint8Array,
  totalPoints: number,
  centerX: number,
  centerY: number,
  baseRadius: number,
  maxBarHeight: number,
  minBarHeight: number
): WavePoint[] => {
  const frequencyStep = Math.floor(dataArray.length / totalPoints);
  const wavePoints: WavePoint[] = [];
  const time = Date.now() / 1000;
  
  for (let i = 0; i <= totalPoints; i++) {
    const dataIndex = (i % totalPoints) * frequencyStep;
    if (dataIndex >= dataArray.length) continue;
    
    const value = dataArray[dataIndex] / 255;
    const angle = (i / totalPoints) * Math.PI * 2;
    const waveOffset = Math.sin(angle * 3 + time * 1.5) * 0.1;
    
    const normalizedValue = Math.max(0.15, value * 0.8 + waveOffset);
    const waveHeight = minBarHeight + (maxBarHeight - minBarHeight) * normalizedValue;
    
    const x = centerX + Math.cos(angle) * (baseRadius + waveHeight);
    const y = centerY + Math.sin(angle) * (baseRadius + waveHeight);
    
    wavePoints.push({ x, y });
  }
  
  if (wavePoints.length > 0 && wavePoints[0].x !== wavePoints[wavePoints.length - 1].x) {
    wavePoints.push(wavePoints[0]);
  }
  
  return wavePoints;
};

export const drawWave = (
  ctx: CanvasRenderingContext2D,
  wavePoints: WavePoint[],
  waveGradient: CanvasGradient
) => {
  const waveLineWidth = 15;
  
  ctx.beginPath();
  
  if (wavePoints.length > 0) {
    ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
    
    for (let i = 1; i < wavePoints.length; i++) {
      ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
    }
  }
  
  ctx.lineWidth = waveLineWidth;
  ctx.strokeStyle = waveGradient;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  ctx.shadowColor = 'rgba(254, 207, 205, 0.7)';
  ctx.shadowBlur = 25;
  ctx.stroke();
  ctx.shadowBlur = 0;
};
