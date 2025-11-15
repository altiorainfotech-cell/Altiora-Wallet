import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';

interface MiniChartProps {
  data: number[];
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
}

export default function MiniChart({
  data,
  width,
  height,
  color = colors.primary,
  strokeWidth = 2
}: MiniChartProps) {
  if (!data || data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const generatePath = () => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    return points;
  };

  return (
    <Svg width={width} height={height}>
      {/* Gradient fill */}
      <Path
        d={`${generatePath()} L ${width} ${height} L 0 ${height} Z`}
        fill={color + '15'}
      />
      {/* Line */}
      <Path
        d={generatePath()}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </Svg>
  );
}
