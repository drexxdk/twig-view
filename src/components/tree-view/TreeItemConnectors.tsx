import type { CSSProperties, SVGProps } from "react";
import React from "react";
import styles from "./tree-view.module.css";
import type { TreeViewLineStyle } from "./TreeView.types";

type Point = {
  x: number;
  y: number;
};

type TreeItemConnectorsProps = {
  depth: number;
  ancestorContinuation: boolean[];
  hasVisibleChildren: boolean;
  hasNextSibling: boolean;
  itemLeft: number;
  itemTop: number;
  isFirstSibling: boolean;
  lineRadius: number;
  lineStyle: TreeViewLineStyle;
  lineWidth: number;
  itemHeight: number;
  rowGap: number;
  rowHeight: number;
  showParentLines: boolean;
  sharesContinuingAxis: boolean;
  toggleSize: number;
  indent: number;
};

type StrokeProps = Pick<
  SVGProps<SVGPathElement>,
  "strokeDasharray" | "strokeDashoffset" | "strokeLinecap" | "strokeLinejoin"
>;

function getStrokeProps(
  lineStyle: TreeViewLineStyle,
  lineWidth: number,
  dashOffset = 0,
): StrokeProps {
  const safeDashOffset = Number.isFinite(dashOffset) ? dashOffset : 0;

  if (lineStyle === "dashed") {
    return {
      strokeDasharray: `${Math.max(lineWidth * 3, 4)} ${Math.max(
        lineWidth * 2,
        3,
      )}`,
      strokeDashoffset: safeDashOffset,
      strokeLinecap: "butt",
      strokeLinejoin: "round",
    };
  }

  if (lineStyle === "dotted") {
    return {
      strokeDasharray: `${Math.max(lineWidth * 0.01, 0.01)} ${Math.max(
        lineWidth * 2.4,
        3,
      )}`,
      strokeDashoffset: safeDashOffset,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    };
  }

  return {
    strokeLinecap: "square",
    strokeLinejoin: "round",
  };
}

function getDashPeriod(lineStyle: TreeViewLineStyle, lineWidth: number) {
  if (lineStyle === "dashed") {
    return Math.max(lineWidth * 3, 4) + Math.max(lineWidth * 2, 3);
  }

  if (lineStyle === "dotted") {
    return Math.max(lineWidth * 0.01, 0.01) + Math.max(lineWidth * 2.4, 3);
  }

  return null;
}

function getDotSpacing(lineWidth: number) {
  return Math.max(lineWidth * 0.01, 0.01) + Math.max(lineWidth * 2.4, 3);
}

function getDashOffset(period: number | null, absoluteStart: number) {
  if (!period || !Number.isFinite(period) || !Number.isFinite(absoluteStart)) {
    return 0;
  }

  const offset = absoluteStart % period;

  return offset < 0 ? offset + period : offset;
}

function getConnectorStyle(style: CSSProperties = {}): CSSProperties {
  return {
    ...style,
    overflow: "visible",
  };
}

function getQuadraticPoint(
  start: Point,
  control: Point,
  end: Point,
  t: number,
) {
  const inverseT = 1 - t;

  return {
    x:
      inverseT * inverseT * start.x +
      2 * inverseT * t * control.x +
      t * t * end.x,
    y:
      inverseT * inverseT * start.y +
      2 * inverseT * t * control.y +
      t * t * end.y,
  };
}

function buildRoundedElbowPolyline(
  incomingAxisX: number,
  rowCenterY: number,
  roundedIncomingRadius: number,
  toggleCenterX: number,
) {
  const verticalEndY = Math.max(rowCenterY - roundedIncomingRadius, 0);
  const curveStart = { x: incomingAxisX, y: verticalEndY };
  const curveControl = { x: incomingAxisX, y: rowCenterY };
  const curveEnd = {
    x: incomingAxisX + roundedIncomingRadius,
    y: rowCenterY,
  };
  const points: Point[] = [{ x: incomingAxisX, y: 0 }, curveStart];

  for (let index = 1; index <= 8; index += 1) {
    points.push(
      getQuadraticPoint(curveStart, curveControl, curveEnd, index / 8),
    );
  }

  if (toggleCenterX > curveEnd.x) {
    points.push({ x: toggleCenterX, y: rowCenterY });
  }

  return points;
}

function renderDottedPolyline({
  absoluteStart,
  lineWidth,
  minimumStartDistance = 0,
  points,
  startDistance,
  slot,
  skipEndDot = false,
  skipStartDot = false,
}: {
  absoluteStart: number;
  lineWidth: number;
  minimumStartDistance?: number;
  points: Point[];
  startDistance?: number;
  slot: string;
  skipEndDot?: boolean;
  skipStartDot?: boolean;
}) {
  const spacing = getDotSpacing(lineWidth);
  const radius = lineWidth / 2;
  const epsilon = 0.01;
  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index].x - points[index - 1].x;
    const dy = points[index].y - points[index - 1].y;
    const length = Math.hypot(dx, dy);

    segmentLengths.push(length);
    totalLength += length;
  }

  if (!Number.isFinite(totalLength) || totalLength <= epsilon) {
    return null;
  }

  const phase = getDashOffset(spacing, absoluteStart);
  let distance = startDistance ?? (spacing - phase) % spacing;

  if (skipStartDot && distance < epsilon) {
    distance += spacing;
  }

  while (distance + epsilon < minimumStartDistance) {
    distance += spacing;
  }

  const dots: React.ReactElement[] = [];
  let dotIndex = 0;

  while (distance <= totalLength + epsilon) {
    if (skipEndDot && totalLength - distance < epsilon) {
      break;
    }

    let traversed = 0;

    for (let index = 0; index < segmentLengths.length; index += 1) {
      const segmentLength = segmentLengths[index];

      if (distance <= traversed + segmentLength + epsilon) {
        const start = points[index];
        const end = points[index + 1];
        const localDistance = Math.min(
          Math.max(distance - traversed, 0),
          segmentLength,
        );
        const progress =
          segmentLength <= epsilon ? 0 : localDistance / segmentLength;

        dots.push(
          <circle
            key={`${slot}-${dotIndex}`}
            cx={start.x + (end.x - start.x) * progress}
            cy={start.y + (end.y - start.y) * progress}
            fill="var(--tree-line-color)"
            r={radius}
          />,
        );
        dotIndex += 1;
        break;
      }

      traversed += segmentLength;
    }

    distance += spacing;
  }

  return <g data-slot={slot}>{dots}</g>;
}

export default function TreeItemConnectors({
  depth,
  ancestorContinuation,
  hasVisibleChildren,
  hasNextSibling,
  itemLeft,
  itemTop,
  isFirstSibling,
  lineRadius,
  lineStyle,
  lineWidth,
  itemHeight,
  rowGap,
  rowHeight,
  showParentLines,
  sharesContinuingAxis,
  toggleSize,
  indent,
}: TreeItemConnectorsProps) {
  const isRoot = depth === 1;
  const center = toggleSize / 2;
  const effectiveRowHeight = Math.max(rowHeight, toggleSize);
  const effectiveItemHeight = Math.max(
    itemHeight,
    effectiveRowHeight + (hasVisibleChildren ? rowGap : 0),
  );
  const dashPeriod = getDashPeriod(lineStyle, lineWidth);
  const continueIncomingAxis =
    !isRoot && (hasNextSibling || (showParentLines && sharesContinuingAxis));
  const ancestorRailCount = showParentLines ? ancestorContinuation.length : 0;
  const activeAncestorCount = showParentLines
    ? ancestorContinuation.filter(Boolean).length
    : 0;
  const ancestorTopExtension = isFirstSibling ? 0 : rowGap;
  const ancestorBottomExtension = activeAncestorCount > 0 ? rowGap : 0;
  const ancestorHeight =
    effectiveItemHeight + ancestorTopExtension + ancestorBottomExtension;
  const branchTopExtension = isRoot
    ? showParentLines && !isFirstSibling
      ? rowGap
      : 0
    : isFirstSibling
      ? 0
      : rowGap;
  const rowBottomExtension = hasVisibleChildren
    ? rowGap
    : isRoot && showParentLines && hasNextSibling
      ? rowGap
      : 0;
  const rowCanvasHeight =
    effectiveRowHeight + branchTopExtension + rowBottomExtension;
  const rowCenterY = branchTopExtension + effectiveRowHeight / 2;
  const toggleCenterX = isRoot ? center : indent + center;
  const incomingAxisX = center;
  const horizontalStartInset =
    lineStyle === "dashed"
      ? Math.min(
          Math.max(lineWidth * 2, 3),
          Math.max(toggleCenterX - incomingAxisX - lineWidth, 0),
        )
      : 0;
  const horizontalStartX = incomingAxisX + horizontalStartInset;
  const rowCanvasWidth = isRoot
    ? Math.max(toggleCenterX + lineWidth, lineWidth + 1)
    : Math.max(toggleCenterX + lineWidth, indent + lineWidth + 1);
  const roundedIncomingRadius = Math.min(
    lineRadius,
    indent / 2,
    Math.max(rowCenterY - lineWidth, 0),
  );
  const renderRootGuide =
    isRoot &&
    (hasVisibleChildren ||
      (showParentLines && (!isFirstSibling || hasNextSibling)));
  const rootGuideStartY = showParentLines && !isFirstSibling ? 0 : rowCenterY;
  const rootGuideEndY = hasVisibleChildren
    ? rowCanvasHeight
    : showParentLines && hasNextSibling
      ? rowCanvasHeight
      : rowCenterY;
  const branchRailHeight =
    hasVisibleChildren && showParentLines && sharesContinuingAxis
      ? rowCanvasHeight
      : effectiveItemHeight + (isFirstSibling ? 0 : rowGap) + rowGap;
  const ancestorCanvasTop = itemTop - ancestorTopExtension;
  const branchCanvasTop = itemTop - (isFirstSibling ? 0 : rowGap);
  const rowCanvasTop = itemTop - branchTopExtension;
  const rowCanvasLeft = itemLeft;
  const isDotted = lineStyle === "dotted";

  return (
    <>
      {ancestorRailCount > 0 && activeAncestorCount > 0 ? (
        <span
          aria-hidden="true"
          className={styles.treeConnectorCanvas}
          data-slot="tree-ancestor-connectors"
          style={getConnectorStyle({
            left: `${ancestorRailCount * indent * -1}px`,
            top: `${ancestorTopExtension * -1}px`,
            width: `${ancestorRailCount * indent}px`,
            height: `${ancestorHeight}px`,
          })}
        >
          <svg
            className={styles.treeConnectorSvg}
            viewBox={`0 0 ${ancestorRailCount * indent} ${ancestorHeight}`}
          >
            {ancestorContinuation.map((isActive, index) => {
              if (!isActive) {
                return null;
              }

              const x = index * indent + center;

              return isDotted ? (
                <React.Fragment key={`ancestor-${index}`}>
                  {renderDottedPolyline({
                    absoluteStart: ancestorCanvasTop,
                    lineWidth,
                    points: [
                      { x, y: 0 },
                      { x, y: ancestorHeight },
                    ],
                    slot: "tree-guide-rail",
                  })}
                </React.Fragment>
              ) : (
                <line
                  key={`ancestor-${index}`}
                  data-slot="tree-guide-rail"
                  fill="none"
                  shapeRendering="geometricPrecision"
                  stroke="var(--tree-line-color)"
                  strokeWidth={lineWidth}
                  vectorEffect="non-scaling-stroke"
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={ancestorHeight}
                  {...getStrokeProps(
                    lineStyle,
                    lineWidth,
                    getDashOffset(dashPeriod, ancestorCanvasTop),
                  )}
                />
              );
            })}
          </svg>
        </span>
      ) : null}

      {!isRoot && continueIncomingAxis ? (
        <span
          aria-hidden="true"
          className={styles.treeConnectorCanvas}
          data-slot="tree-branch-rail-canvas"
          style={getConnectorStyle({
            left: "0px",
            top: `${(isFirstSibling ? 0 : rowGap) * -1}px`,
            width: `${center + lineWidth}px`,
            height: `${branchRailHeight}px`,
          })}
        >
          <svg
            className={styles.treeConnectorSvg}
            viewBox={`0 0 ${center + lineWidth} ${branchRailHeight}`}
          >
            {isDotted ? (
              renderDottedPolyline({
                absoluteStart: branchCanvasTop,
                lineWidth,
                points: [
                  { x: incomingAxisX, y: 0 },
                  { x: incomingAxisX, y: branchRailHeight },
                ],
                slot: "tree-branch-rail",
              })
            ) : (
              <line
                data-slot="tree-branch-rail"
                fill="none"
                shapeRendering="geometricPrecision"
                stroke="var(--tree-line-color)"
                strokeWidth={lineWidth}
                vectorEffect="non-scaling-stroke"
                x1={incomingAxisX}
                x2={incomingAxisX}
                y1={0}
                y2={branchRailHeight}
                {...getStrokeProps(
                  lineStyle,
                  lineWidth,
                  getDashOffset(dashPeriod, branchCanvasTop),
                )}
              />
            )}
          </svg>
        </span>
      ) : null}

      {(renderRootGuide || !isRoot || hasVisibleChildren) &&
      rowCanvasHeight > 0 ? (
        <span
          aria-hidden="true"
          className={styles.treeConnectorCanvas}
          data-slot="tree-row-connectors"
          style={getConnectorStyle({
            left: "0px",
            top: `${branchTopExtension * -1}px`,
            width: `${rowCanvasWidth}px`,
            height: `${rowCanvasHeight}px`,
          })}
        >
          <svg
            className={styles.treeConnectorSvg}
            viewBox={`0 0 ${rowCanvasWidth} ${rowCanvasHeight}`}
          >
            {renderRootGuide ? (
              isDotted ? (
                renderDottedPolyline({
                  absoluteStart: rowCanvasTop + rootGuideStartY,
                  lineWidth,
                  points: [
                    { x: toggleCenterX, y: rootGuideStartY },
                    { x: toggleCenterX, y: rootGuideEndY },
                  ],
                  slot: "tree-root-guide",
                })
              ) : (
                <line
                  data-slot="tree-root-guide"
                  fill="none"
                  shapeRendering="geometricPrecision"
                  stroke="var(--tree-line-color)"
                  strokeWidth={lineWidth}
                  vectorEffect="non-scaling-stroke"
                  x1={toggleCenterX}
                  x2={toggleCenterX}
                  y1={rootGuideStartY}
                  y2={rootGuideEndY}
                  {...getStrokeProps(
                    lineStyle,
                    lineWidth,
                    getDashOffset(dashPeriod, rowCanvasTop + rootGuideStartY),
                  )}
                />
              )
            ) : null}

            {!isRoot ? (
              continueIncomingAxis ? (
                isDotted ? (
                  renderDottedPolyline({
                    absoluteStart: rowCanvasLeft + incomingAxisX,
                    lineWidth,
                    minimumStartDistance: getDotSpacing(lineWidth),
                    points: [
                      { x: incomingAxisX, y: rowCenterY },
                      { x: toggleCenterX, y: rowCenterY },
                    ],
                    startDistance: getDotSpacing(lineWidth),
                    skipStartDot: true,
                    slot: "tree-incoming-connector",
                  })
                ) : (
                  <line
                    data-slot="tree-incoming-connector"
                    fill="none"
                    shapeRendering="geometricPrecision"
                    stroke="var(--tree-line-color)"
                    strokeWidth={lineWidth}
                    vectorEffect="non-scaling-stroke"
                    x1={horizontalStartX}
                    x2={toggleCenterX}
                    y1={rowCenterY}
                    y2={rowCenterY}
                    {...getStrokeProps(
                      lineStyle,
                      lineWidth,
                      getDashOffset(
                        dashPeriod,
                        rowCanvasLeft + horizontalStartX,
                      ),
                    )}
                  />
                )
              ) : roundedIncomingRadius > 0 ? (
                isDotted ? (
                  renderDottedPolyline({
                    absoluteStart: rowCanvasTop,
                    lineWidth,
                    points: buildRoundedElbowPolyline(
                      incomingAxisX,
                      rowCenterY,
                      roundedIncomingRadius,
                      toggleCenterX,
                    ),
                    slot: "tree-incoming-connector",
                  })
                ) : (
                  <path
                    d={`M ${incomingAxisX} 0 V ${Math.max(
                      rowCenterY - roundedIncomingRadius,
                      0,
                    )} Q ${incomingAxisX} ${rowCenterY} ${incomingAxisX + roundedIncomingRadius} ${rowCenterY} H ${toggleCenterX}`}
                    data-slot="tree-incoming-connector"
                    fill="none"
                    shapeRendering="geometricPrecision"
                    stroke="var(--tree-line-color)"
                    strokeWidth={lineWidth}
                    vectorEffect="non-scaling-stroke"
                    {...getStrokeProps(
                      lineStyle,
                      lineWidth,
                      getDashOffset(dashPeriod, rowCanvasTop),
                    )}
                  />
                )
              ) : isDotted ? (
                renderDottedPolyline({
                  absoluteStart: rowCanvasTop,
                  lineWidth,
                  points: [
                    { x: incomingAxisX, y: 0 },
                    { x: incomingAxisX, y: rowCenterY },
                    { x: toggleCenterX, y: rowCenterY },
                  ],
                  slot: "tree-incoming-connector",
                })
              ) : (
                <>
                  <line
                    data-slot="tree-incoming-connector"
                    fill="none"
                    shapeRendering="geometricPrecision"
                    stroke="var(--tree-line-color)"
                    strokeWidth={lineWidth}
                    vectorEffect="non-scaling-stroke"
                    x1={incomingAxisX}
                    x2={incomingAxisX}
                    y1={0}
                    y2={rowCenterY}
                    {...getStrokeProps(
                      lineStyle,
                      lineWidth,
                      getDashOffset(dashPeriod, rowCanvasTop),
                    )}
                  />
                  <line
                    data-slot="tree-incoming-connector"
                    fill="none"
                    shapeRendering="geometricPrecision"
                    stroke="var(--tree-line-color)"
                    strokeWidth={lineWidth}
                    vectorEffect="non-scaling-stroke"
                    x1={horizontalStartX}
                    x2={toggleCenterX}
                    y1={rowCenterY}
                    y2={rowCenterY}
                    {...getStrokeProps(
                      lineStyle,
                      lineWidth,
                      getDashOffset(
                        dashPeriod,
                        rowCanvasLeft + horizontalStartX,
                      ),
                    )}
                  />
                </>
              )
            ) : null}

            {hasVisibleChildren && !isRoot ? (
              isDotted ? (
                renderDottedPolyline({
                  absoluteStart: rowCanvasTop + rowCenterY,
                  lineWidth,
                  minimumStartDistance: getDotSpacing(lineWidth),
                  points: [
                    { x: toggleCenterX, y: rowCenterY },
                    { x: toggleCenterX, y: rowCanvasHeight },
                  ],
                  startDistance: getDotSpacing(lineWidth),
                  skipStartDot: true,
                  slot: "tree-child-stem",
                })
              ) : (
                <line
                  data-slot="tree-child-stem"
                  fill="none"
                  shapeRendering="geometricPrecision"
                  stroke="var(--tree-line-color)"
                  strokeWidth={lineWidth}
                  vectorEffect="non-scaling-stroke"
                  x1={toggleCenterX}
                  x2={toggleCenterX}
                  y1={rowCenterY}
                  y2={rowCanvasHeight}
                  {...getStrokeProps(
                    lineStyle,
                    lineWidth,
                    getDashOffset(dashPeriod, rowCanvasTop + rowCenterY),
                  )}
                />
              )
            ) : null}
          </svg>
        </span>
      ) : null}
    </>
  );
}
