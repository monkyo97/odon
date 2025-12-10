import React from 'react';
import { Surface, ToothCondition } from '@/types/odontogram';
import { CONDITION_COLORS } from '@/constants/odontogram';

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
    const isUpper = number < 30; // 11-28 are upper

    // Helper to get color for a surface
    const getSurfaceColor = (surface: Surface) => {
        // Check for "whole" tooth conditions first (e.g., missing, crown) needs to be handled visually differently usually, 
        // but here we might flag it.
        // Actually, if a whole tooth condition exists, typically specific surfaces might technically still have color, 
        // but often the whole tooth is overlaid.
        // We will check specific surface condition first.
        const condition = conditions.find(c => c.surface === surface);
        if (condition) return CONDITION_COLORS[condition.condition_type as keyof typeof CONDITION_COLORS] || '#FFFFFF';

        // Additional check if we want "whole" to override
        const wholeCondition = conditions.find(c => c.surface === 'whole');
        if (wholeCondition) {
            // Maybe return a dimmed version or handle in overlay?
            // For now, keep surface specific logic pure.
            return '#FFFFFF';
        }

        return '#FFFFFF'; // Default white
    };

    const getStrokeColor = (surface: Surface) => {
        return selectedSurface === surface ? '#3B82F6' : '#9CA3AF'; // Blue if selected, Gray default
    };

    const getStrokeWidth = (surface: Surface) => {
        return selectedSurface === surface ? 2 : 1;
    };

    // Better Geometric Paths for a standard "Cross" Odontogram representation
    const SIZE = 40;
    const CENTER = SIZE / 2;
    const OFFSET = 8; // Size of center square

    // Coordinates
    const p1 = { x: 0, y: 0 };
    const p2 = { x: SIZE, y: 0 };
    const p3 = { x: SIZE, y: SIZE };
    const p4 = { x: 0, y: SIZE };

    const c1 = { x: CENTER - OFFSET, y: CENTER - OFFSET };
    const c2 = { x: CENTER + OFFSET, y: CENTER - OFFSET };
    const c3 = { x: CENTER + OFFSET, y: CENTER + OFFSET };
    const c4 = { x: CENTER - OFFSET, y: CENTER + OFFSET };

    const isRightQuadrant = (number >= 11 && number <= 18) || (number >= 41 && number <= 48) || (number >= 51 && number <= 55) || (number >= 81 && number <= 85);

    const topSurface: Surface = isUpper ? 'vestibular' : 'lingual';
    const bottomSurface: Surface = isUpper ? 'lingual' : 'vestibular';
    const leftSurface: Surface = isRightQuadrant ? 'distal' : 'mesial';
    const rightSurface: Surface = isRightQuadrant ? 'mesial' : 'distal';
    const centerSurface: Surface = (number >= 11 && number <= 23) || (number >= 31 && number <= 43) ? 'incisal' : 'occlusal';

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
            onClick={(e) => { e.stopPropagation(); onSurfaceClick(surface); }}
            className="cursor-pointer hover:fill-blue-100 transition-colors duration-200"
            data-tooltip-id={`tooltip-${number}`}
            data-tooltip-content={`${label}`}
        >
            <title>{label}</title>
        </path>
    );

    // Check for "Whole" conditions like Missing (X) or Extraction (||)
    const missing = conditions.some(c => c.condition_type === 'missing');
    const extraction = conditions.some(c => c.condition_type === 'extraction_planned');
    const endo = conditions.some(c => c.condition_type === 'endodontics');
    const crown = conditions.some(c => c.condition_type === 'crown');

    // Range Logic
    const renderRangeOverlay = () => {
        if (!rangeInfo) return null;
        const { type, position } = rangeInfo;

        let color = '#3B82F6'; // Default bridge blue
        if (type === 'orthodontics') color = '#10B981'; // Ortho green
        if (type === 'prosthesis') color = '#F59E0B'; // Prosthesis Gold

        const yPos = SIZE / 2;
        const strokeWidth = 3;

        return (
            <g className="pointer-events-none">
                {/* Wires/Lines */}
                {(position === 'start' || position === 'middle') && (
                    <line x1={CENTER} y1={yPos} x2={SIZE} y2={yPos} stroke={color} strokeWidth={strokeWidth} />
                )}
                {(position === 'end' || position === 'middle') && (
                    <line x1={0} y1={yPos} x2={CENTER} y2={yPos} stroke={color} strokeWidth={strokeWidth} />
                )}

                {/* Brackets or Markers (for Ortho mostly) */}
                {type === 'orthodontics' && (
                    <rect x={CENTER - 4} y={CENTER - 4} width={8} height={8} fill={color} />
                )}

                {/* Bridge Abutment Indicators */}
                {type === 'bridge' && (position === 'start' || position === 'end') && (
                    <circle cx={CENTER} cy={CENTER} r={4} fill={color} />
                )}
            </g>
        );
    };

    return (
        <div className="relative flex flex-col items-center m-1 group">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
                {/* Visual feedback for start of selection */}
                {isSelectionStart && (
                    <circle cx={CENTER} cy={CENTER} r={SIZE / 2 + 4} fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
                )}

                {renderPath(topD, topSurface, isUpper ? 'Vestibular' : 'Lingual')}
                {renderPath(rightD, rightSurface, isRightQuadrant ? 'Mesial' : 'Distal')}
                {renderPath(bottomD, bottomSurface, isUpper ? 'Lingual' : 'Vestibular')}
                {renderPath(leftD, leftSurface, isRightQuadrant ? 'Distal' : 'Mesial')}
                {renderPath(centerD, centerSurface, 'Oclusal/Incisal')}

                {/* Overlays for Whole Tooth Conditions */}
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

                {crown && (
                    <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 2} fill="none" stroke="#F59E0B" strokeWidth="3" className="pointer-events-none" />
                )}

                {renderRangeOverlay()}
            </svg>
            <span className="text-xs font-medium text-gray-600 mt-1 select-none">{number}</span>
            {endo && <div className="absolute -bottom-2 w-1 h-3 bg-purple-500"></div>}
        </div>
    );
};
