import React from 'react';
import { Surface, ToothCondition } from '@/types/odontogram';
import { CONDITION_COLORS, CONDITIONS, SURFACE_IDS } from '@/constants/odontogram';

interface ToothSVGProps {
    number: number;
    conditions: ToothCondition[];
    onSurfaceClick: (surface: Surface) => void;
    selectedSurface?: Surface | null;
    rangeInfo?: {
        type: 'orthodontics' | 'bridge' | 'prosthesis';
        position: 'start' | 'middle' | 'end' | 'single';
    } | null;
    isSelectionStart?: boolean;
}

export const ToothSVG: React.FC<ToothSVGProps> = ({ number, conditions, onSurfaceClick, selectedSurface, rangeInfo, isSelectionStart }) => {
    // 1. Identify Quadrant/Arch
    // Upper: 11-18, 21-28, 51-55, 61-65
    // Lower: 31-38, 41-48, 71-75, 81-85
    const isUpper = (number >= 11 && number <= 28) || (number >= 51 && number <= 65);

    // Right Quadrants: 1 (1x), 4 (4x), 5 (5x), 8 (8x)
    const isRightQuadrant =
        (number >= 11 && number <= 18) ||
        (number >= 41 && number <= 48) ||
        (number >= 51 && number <= 55) ||
        (number >= 81 && number <= 85);

    // 2. Check for Whole Tooth Conditions (Blocking)
    const missing = conditions.some(c => c.condition_type === 'missing');
    const extraction = conditions.some(c => c.condition_type === 'extraction_planned');
    const isBlocked = missing || extraction;

    // 3. Colors Helper
    const getSurfaceColor = (surface: Surface) => {
        const condition = conditions.find(c => c.surface === surface);
        if (condition) return CONDITION_COLORS[condition.condition_type] || '#FFFFFF';
        return '#FFFFFF'; // Default white
    };

    const getStrokeColor = (surface: Surface) => {
        return selectedSurface === surface ? '#3B82F6' : '#9CA3AF';
    };

    const getStrokeWidth = (surface: Surface) => {
        return selectedSurface === surface ? 2 : 1;
    };

    // 4. Geometry
    const SIZE = 40;
    const CENTER = SIZE / 2;
    const OFFSET = 8;

    // Coordinates
    const p1 = { x: 0, y: 0 };
    const p2 = { x: SIZE, y: 0 };
    const p3 = { x: SIZE, y: SIZE };
    const p4 = { x: 0, y: SIZE };

    const c1 = { x: CENTER - OFFSET, y: CENTER - OFFSET };
    const c2 = { x: CENTER + OFFSET, y: CENTER - OFFSET };
    const c3 = { x: CENTER + OFFSET, y: CENTER + OFFSET };
    const c4 = { x: CENTER - OFFSET, y: CENTER + OFFSET };

    // 5. Orientation Logic (User Request)
    // En superiores: B es hacia abajo (Bottom)
    // En inferiores: B es hacia arriba (Top)

    // Default Mapping (Visual Position -> Logical Surface)
    // top: Surface at y=0
    // bottom: Surface at y=SIZE
    // left: Surface at x=0
    // right: Surface at x=SIZE

    let topSurface: Surface;
    let bottomSurface: Surface;
    let leftSurface: Surface;
    let rightSurface: Surface;

    // Center Surface Logic (simplified for brevity, covering main groups)
    // Incisal: 11-23, 31-43, 51-53, 61-63, 71-73, 81-83
    // Occlusal: Premolars/Molars
    const isIncisal =
        (number >= 11 && number <= 23) ||
        (number >= 31 && number <= 43) ||
        (number >= 51 && number <= 53) ||
        (number >= 61 && number <= 63) ||
        (number >= 71 && number <= 73) ||
        (number >= 81 && number <= 83);

    const centerSurface: Surface = isIncisal ? 'incisal' : 'occlusal';

    if (isUpper) {
        // Upper: B (Vestibular) is Bottom. So Top is Palatal/Lingual.
        topSurface = 'palatal'; // or lingual
        bottomSurface = 'vestibular';
    } else {
        // Lower: B (Vestibular) is Top. So Bottom is Lingual.
        topSurface = 'vestibular';
        bottomSurface = 'lingual';
    }

    if (isRightQuadrant) {
        // Right side of face (Patient's Right). Visual Left of chart usually?
        // Wait, standard chart:
        // Right Quadrant (18-11) is on the LEFT side of the screen.
        // Left Quadrant (21-28) is on the RIGHT side of the screen.
        // If 18 is on far left:
        // [18] [17] ...
        // For 18: Left/Outward edge is Distal. Right/Inward edge (towards 17) is Mesial.
        // So LEFT SCREEN side is Distal. RIGHT SCREEN side is Mesial.
        leftSurface = 'distal';
        rightSurface = 'mesial';
    } else {
        // Left Quadrant (21-28) is on RIGHT side of screen.
        // [21] [22] ...
        // For 21: Left/Inward edge (towards 11) is Mesial. Right/Outward edge is Distal.
        leftSurface = 'mesial';
        rightSurface = 'distal';
    }


    // Paths
    const topD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${c2.x} ${c2.y} L ${c1.x} ${c1.y} Z`;
    const rightD = `M ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${c3.x} ${c3.y} L ${c2.x} ${c2.y} Z`;
    const bottomD = `M ${p4.x} ${p4.y} L ${c4.x} ${c4.y} L ${c3.x} ${c3.y} L ${p3.x} ${p3.y} Z`;
    const leftD = `M ${p1.x} ${p1.y} L ${c1.x} ${c1.y} L ${c4.x} ${c4.y} L ${p4.x} ${p4.y} Z`;
    const centerD = `M ${c1.x} ${c1.y} L ${c2.x} ${c2.y} L ${c3.x} ${c3.y} L ${c4.x} ${c4.y} Z`;

    const renderPath = (d: string, surface: Surface, label: string) => (
        <path
            d={d}
            fill={getSurfaceColor(surface)}
            stroke={getStrokeColor(surface)}
            strokeWidth={getStrokeWidth(surface)}
            onClick={(e) => {
                e.stopPropagation();
                onSurfaceClick(surface);
            }}
            className="transition-colors duration-200 cursor-pointer hover:fill-blue-100"
            data-tooltip-id={`tooltip-${number}`}
            data-tooltip-content={`${label}`}
        >
            <title>{label}</title>
        </path>
    );

    // Conditions
    const endo = conditions.some(c => c.condition_type === 'endodontics');
    const crown = conditions.some(c => c.condition_type === 'crown');
    const fracture = conditions.some(c => c.condition_type === 'fracture');

    // Range Logic
    const renderRangeOverlay = () => {
        if (!rangeInfo) return null;
        const { type, position } = rangeInfo;

        const color = CONDITION_COLORS[type] || '#3B82F6';

        // User Suggestion: "Line of range below the drawing"
        // We render it below the tooth square (y > SIZE).
        const lineY = SIZE + 8;
        const strokeWidth = 4;

        return (
            <g className="pointer-events-none">
                {/* Connection Line */}
                {(position === 'start' || position === 'middle') && (
                    <line x1={CENTER} y1={lineY} x2={SIZE + 4} y2={lineY} stroke={color} strokeWidth={strokeWidth} />
                )}
                {(position === 'end' || position === 'middle') && (
                    <line x1={-4} y1={lineY} x2={CENTER} y2={lineY} stroke={color} strokeWidth={strokeWidth} />
                )}

                {/* Start/End Markers */}
                {position === 'start' && (
                    <circle cx={CENTER} cy={lineY} r={3} fill={color} />
                )}
                {position === 'end' && (
                    <circle cx={CENTER} cy={lineY} r={3} fill={color} />
                )}
            </g>
        );
    };

    return (
        <div className="relative flex flex-col items-center m-1 group">
            {/* If blocked, maybe add opacity? */}
            <svg width={SIZE} height={SIZE + 20} viewBox={`0 0 ${SIZE} ${SIZE + 20}`} className={`overflow-visible ${isBlocked ? 'opacity-80' : ''}`}>
                {/* Visual feedback for start of selection */}
                {isSelectionStart && (
                    <circle cx={CENTER} cy={CENTER} r={SIZE / 2 + 6} fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
                )}

                {/* 1. Surfaces */}
                {renderPath(topD, topSurface, isUpper ? 'Palatino/Lingual' : 'Vestibular')}
                {renderPath(rightD, rightSurface, isRightQuadrant ? 'Mesial' : 'Distal')}
                {renderPath(bottomD, bottomSurface, isUpper ? 'Vestibular' : 'Lingual')}
                {renderPath(leftD, leftSurface, isRightQuadrant ? 'Distal' : 'Mesial')}
                {renderPath(centerD, centerSurface, 'Oclusal/Incisal')}

                {/* 2. Endodontics (Center Overlay) */}
                {endo && (
                    <rect x={c1.x} y={c1.y} width={OFFSET * 2} height={OFFSET * 2} fill={CONDITION_COLORS.endodontics} className="pointer-events-none opacity-70" />
                )}

                {/* 3. Crown (Circle Overlay) */}
                {crown && (
                    <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 2} fill="none" stroke={CONDITION_COLORS.crown} strokeWidth="3" className="pointer-events-none" />
                )}

                {/* 4. Fracture (ZigZag? or just color surface usually. If specialized symbol:) */}
                {fracture && (
                    <path d={`M${p1.x} ${p1.y} L${p3.x} ${p3.y}`} stroke={CONDITION_COLORS.fracture} strokeWidth="2" className="pointer-events-none" />
                )}

                {/* 5. Missing / Extraction (Top Layer) */}
                {missing && (
                    <g className="pointer-events-none">
                        <line x1="0" y1="0" x2={SIZE} y2={SIZE} stroke="black" strokeWidth="3" />
                        <line x1={SIZE} y1="0" x2="0" y2={SIZE} stroke="black" strokeWidth="3" />
                    </g>
                )}

                {extraction && (
                    <g className="pointer-events-none">
                        <line x1="0" y1="0" x2={SIZE} y2={SIZE} stroke="red" strokeWidth="3" />
                        <line x1={SIZE} y1="0" x2="0" y2={SIZE} stroke="red" strokeWidth="3" />
                    </g>
                )}

                {/* Range Underlay/Overlay */}
                {renderRangeOverlay()}
            </svg>
            <span className={`text-xs font-medium mt-1 select-none ${isBlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                {number}
            </span>
        </div>
    );
};
