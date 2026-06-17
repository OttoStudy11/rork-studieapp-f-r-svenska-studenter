import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';

interface RadarDataPoint {
  label: string;
  value: number; // 0-100
  color: string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  levels?: number;
  labelColor?: string;
  gridColor?: string;
}

export const RadarChart = memo(function RadarChart({
  data,
  size = 280,
  levels = 5,
  labelColor = '#94A3B8',
  gridColor = '#E5E7EB',
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 30;
  const angleSlice = (2 * Math.PI) / data.length;

  if (data.length < 3) return null;

  const getPoint = (index: number, value: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid polygons
  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const points = data
      .map((_, i) => {
        const pt = getPoint(i, ((level + 1) / levels) * 100);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
    return (
      <Polygon
        key={`grid-${level}`}
        points={points}
        fill="none"
        stroke={gridColor}
        strokeWidth={1}
        opacity={0.6}
      />
    );
  });

  // Axis lines
  const axisLines = data.map((_, i) => {
    const pt = getPoint(i, 100);
    return (
      <Line
        key={`axis-${i}`}
        x1={cx}
        y1={cy}
        x2={pt.x}
        y2={pt.y}
        stroke={gridColor}
        strokeWidth={1}
        opacity={0.5}
      />
    );
  });

  // Data polygon
  const dataPoints = data
    .map((d, i) => {
      const pt = getPoint(i, d.value);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');
  const dataPolygon = (
    <Polygon
      points={dataPoints}
      fill={data[0]?.color ? `${data[0].color}25` : 'rgba(99,102,241,0.15)'}
      stroke={data[0]?.color || '#6366F1'}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );

  // Data dots
  const dots = data.map((d, i) => {
    const pt = getPoint(i, d.value);
    return (
      <Circle
        key={`dot-${i}`}
        cx={pt.x}
        cy={pt.y}
        r={4}
        fill={d.color || '#6366F1'}
      />
    );
  });

  // Labels
  const labels = data.map((d, i) => {
    const pt = getPoint(i, 120);
    return (
      <SvgText
        key={`label-${i}`}
        x={pt.x}
        y={pt.y}
        fontSize={11}
        fontWeight="600"
        fill={labelColor}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {d.label}
      </SvgText>
    );
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {gridPolygons}
        {axisLines}
        {dataPolygon}
        {dots}
        {labels}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
