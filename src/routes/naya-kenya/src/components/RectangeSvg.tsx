import React from "react";

export default function RectangeSvg({
  className,
  fill,
  day,
}: {
  className?: string;
  fill?: string;
  day?: number;
}) {
  return (
    <svg
      width='43'
      height='43'
      viewBox='0 0 43 43'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <rect
        width='42.7486'
        height='42.7486'
        fill={fill || "black"}
        // fill-opacity='0.25'
      />
      <rect
        x='0.5'
        y='0.5'
        width='41.7486'
        height='41.7486'
        stroke='black'
        stroke-opacity='0.25'
      />
      {day !== undefined && (
        <text
          x='50%'
          y='50%'
          textAnchor='middle'
          dominantBaseline='central'
          fill='black'
          fontSize='8'
        >
          {day}
        </text>
      )}
    </svg>
  );
}
