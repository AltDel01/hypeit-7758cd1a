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
  
  // Create smoother transitions between frequencies with more emphasis on audio input
  const smoothedData = new Float32Array(totalPoints);
  for (let i = 0; i < totalPoints; i++) {
    const dataIndex = i * frequencyStep;
    if (dataIndex >= dataArray.length) continue;
    
    // Enhanced smoothing by considering more neighboring values
    const prevIndex = Math.max(0, dataIndex - frequencyStep);
    const nextIndex = Math.min(dataArray.length - 1, dataIndex + frequencyStep);
    const prevValue = dataArray[prevIndex];
    const currentValue = dataArray[dataIndex];
    const nextValue = dataArray[nextIndex];
    
    // Increase audio reactivity by giving more weight to the current value
    smoothedData[i] = (prevValue + currentValue * 3 + nextValue) / 5 / 255;
  }
  
  for (let i = 0; i <= totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2;
    
    // Create evenly distributed wave patterns
    const waveTimeOffset = Math.sin(angle * 3 + time * 0.5) * 0.15;
    const secondaryWave = Math.cos(angle * 4 + time * 0.3) * 0.1;
    const tertiaryWave = Math.sin(angle * 2 + time * 0.4) * 0.08;
    
    // Get smoothed value with wraparound
    const dataIndex = i % totalPoints;
    const value = smoothedData[dataIndex];
    
    // Enhanced wave combination for more wobbliness
    const normalizedValue = Math.max(
      0.2,
      value * 0.8 + waveTimeOffset + secondaryWave + tertiaryWave
    );
    
    // Calculate wave height with increased responsiveness
    const waveHeight = minBarHeight + (maxBarHeight - minBarHeight) * normalizedValue;
    
    // More dynamic jitter based on audio input
    const jitter = Math.sin(time * 3 + angle * 4) * (1 + value * 2);
    
    const x = centerX + Math.cos(angle) * (baseRadius + waveHeight + jitter);
    const y = centerY + Math.sin(angle) * (baseRadius + waveHeight + jitter);
    
    wavePoints.push({ x, y });
  }
  
  // Ensure smooth closure of the wave
  if (wavePoints.length > 0) {
    wavePoints.push({ ...wavePoints[0] });
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
    
    // Use bezier curves for smoother wave rendering
    for (let i = 0; i < wavePoints.length - 2; i++) {
      const xc = (wavePoints[i].x + wavePoints[i + 1].x) / 2;
      const yc = (wavePoints[i].y + wavePoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(wavePoints[i].x, wavePoints[i].y, xc, yc);
    }
    
    // Complete the curve
    if (wavePoints.length > 2) {
      const last = wavePoints.length - 1;
      ctx.quadraticCurveTo(
        wavePoints[last - 1].x,
        wavePoints[last - 1].y,
        wavePoints[last].x,
        wavePoints[last].y
      );
    }
  }
  
  ctx.lineWidth = waveLineWidth;
  ctx.strokeStyle = waveGradient;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  
  // Enhanced glow effect
  ctx.shadowColor = 'rgba(254, 207, 205, 0.7)';
  ctx.shadowBlur = 25;
  ctx.stroke();
  ctx.shadowBlur = 0;
};
