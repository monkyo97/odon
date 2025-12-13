// import React from 'react';

// interface ToothSVGProps {
//   toothNumber: number;
//   conditions: any[];
//   onClick: () => void;
//   isUpper: boolean;
//   selectedSurfaces?: string[];
//   onSurfaceClick?: (surface: string) => void;
//   isSelecting?: boolean;
// }

// export const ToothSVG: React.FC<ToothSVGProps> = ({ 
//   toothNumber, 
//   conditions, 
//   onClick, 
//   isUpper,
//   selectedSurfaces = [],
//   onSurfaceClick,
//   isSelecting = false
// }) => {
//   const toothType = getToothType(toothNumber);
  
//   const handleSurfaceClick = (e: React.MouseEvent, surface: string) => {
//     e.stopPropagation();
//     if (isSelecting && onSurfaceClick) {
//       onSurfaceClick(surface);
//     }
//   };

//   const getSurfaceColor = (surface: string) => {
//     if (selectedSurfaces.includes(surface)) {
//       return '#3B82F6'; // Blue for selected
//     }
    
//     const condition = conditions.find(c => c.surface === surface);
//     if (condition) {
//       return getConditionColor(condition.condition);
//     }
    
//     return '#FFFFFF'; // White default
//   };

//   const getSurfaceOpacity = (surface: string) => {
//     if (selectedSurfaces.includes(surface)) return 0.8;
//     if (conditions.find(c => c.surface === surface)) return 0.9;
//     return 0.1;
//   };

//   return (
//     <div className="relative cursor-pointer group" onClick={onClick}>
//       <svg width="60" height="80" viewBox="0 0 60 80" className="hover:scale-105 transition-transform">
//         {/* Tooth outline based on type */}
//         {toothType === 'molar' && (
//           <g>
//             {/* Molar crown */}
//             <path
//               d={isUpper 
//                 ? "M10 20 Q10 15 15 15 L45 15 Q50 15 50 20 L50 35 Q50 40 45 40 L15 40 Q10 40 10 35 Z"
//                 : "M10 25 Q10 20 15 20 L45 20 Q50 20 50 25 L50 40 Q50 45 45 45 L15 45 Q10 45 10 40 Z"
//               }
//               fill="#F8F9FA"
//               stroke="#E5E7EB"
//               strokeWidth="1.5"
//             />
            
//             {/* Surfaces for molar */}
//             {/* Oclusal */}
//             <rect
//               x="15" y={isUpper ? "20" : "25"} width="30" height="15"
//               fill={getSurfaceColor('oclusal')}
//               fillOpacity={getSurfaceOpacity('oclusal')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'oclusal')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             {/* Vestibular */}
//             <rect
//               x="15" y={isUpper ? "15" : "20"} width="30" height="5"
//               fill={getSurfaceColor('vestibular')}
//               fillOpacity={getSurfaceOpacity('vestibular')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'vestibular')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             {/* Lingual */}
//             <rect
//               x="15" y={isUpper ? "35" : "40"} width="30" height="5"
//               fill={getSurfaceColor('lingual')}
//               fillOpacity={getSurfaceOpacity('lingual')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'lingual')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             {/* Mesial */}
//             <rect
//               x="10" y={isUpper ? "20" : "25"} width="5" height="15"
//               fill={getSurfaceColor('mesial')}
//               fillOpacity={getSurfaceOpacity('mesial')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'mesial')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             {/* Distal */}
//             <rect
//               x="45" y={isUpper ? "20" : "25"} width="5" height="15"
//               fill={getSurfaceColor('distal')}
//               fillOpacity={getSurfaceOpacity('distal')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'distal')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             {/* Roots */}
//             {isUpper ? (
//               <>
//                 <rect x="20" y="40" width="6" height="25" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//                 <rect x="34" y="40" width="6" height="25" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//               </>
//             ) : (
//               <>
//                 <rect x="20" y="10" width="6" height="25" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//                 <rect x="34" y="10" width="6" height="25" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//               </>
//             )}
//           </g>
//         )}

//         {toothType === 'premolar' && (
//           <g>
//             {/* Premolar crown */}
//             <path
//               d={isUpper 
//                 ? "M15 20 Q15 15 20 15 L40 15 Q45 15 45 20 L45 32 Q45 37 40 37 L20 37 Q15 37 15 32 Z"
//                 : "M15 28 Q15 23 20 23 L40 23 Q45 23 45 28 L45 40 Q45 45 40 45 L20 45 Q15 45 15 40 Z"
//               }
//               fill="#F8F9FA"
//               stroke="#E5E7EB"
//               strokeWidth="1.5"
//             />
            
//             {/* Surfaces */}
//             <rect
//               x="20" y={isUpper ? "20" : "28"} width="20" height="12"
//               fill={getSurfaceColor('oclusal')}
//               fillOpacity={getSurfaceOpacity('oclusal')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'oclusal')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="20" y={isUpper ? "15" : "23"} width="20" height="5"
//               fill={getSurfaceColor('vestibular')}
//               fillOpacity={getSurfaceOpacity('vestibular')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'vestibular')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="20" y={isUpper ? "32" : "40"} width="20" height="5"
//               fill={getSurfaceColor('lingual')}
//               fillOpacity={getSurfaceOpacity('lingual')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'lingual')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="15" y={isUpper ? "20" : "28"} width="5" height="12"
//               fill={getSurfaceColor('mesial')}
//               fillOpacity={getSurfaceOpacity('mesial')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'mesial')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="40" y={isUpper ? "20" : "28"} width="5" height="12"
//               fill={getSurfaceColor('distal')}
//               fillOpacity={getSurfaceOpacity('distal')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'distal')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             {/* Root */}
//             {isUpper ? (
//               <rect x="27" y="37" width="6" height="25" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//             ) : (
//               <rect x="27" y="10" width="6" height="25" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//             )}
//           </g>
//         )}

//         {toothType === 'canine' && (
//           <g>
//             {/* Canine crown */}
//             <path
//               d={isUpper 
//                 ? "M20 20 Q20 15 25 15 L35 15 Q40 15 40 20 L40 30 Q40 35 35 35 L25 35 Q20 35 20 30 Z"
//                 : "M20 30 Q20 25 25 25 L35 25 Q40 25 40 30 L40 40 Q40 45 35 45 L25 45 Q20 45 20 40 Z"
//               }
//               fill="#F8F9FA"
//               stroke="#E5E7EB"
//               strokeWidth="1.5"
//             />
            
//             {/* Surfaces */}
//             <rect
//               x="25" y={isUpper ? "20" : "30"} width="10" height="10"
//               fill={getSurfaceColor('incisal')}
//               fillOpacity={getSurfaceOpacity('incisal')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'incisal')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="25" y={isUpper ? "15" : "25"} width="10" height="5"
//               fill={getSurfaceColor('vestibular')}
//               fillOpacity={getSurfaceOpacity('vestibular')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'vestibular')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="25" y={isUpper ? "30" : "40"} width="10" height="5"
//               fill={getSurfaceColor('lingual')}
//               fillOpacity={getSurfaceOpacity('lingual')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'lingual')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="20" y={isUpper ? "20" : "30"} width="5" height="10"
//               fill={getSurfaceColor('mesial')}
//               fillOpacity={getSurfaceOpacity('mesial')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'mesial')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="35" y={isUpper ? "20" : "30"} width="5" height="10"
//               fill={getSurfaceColor('distal')}
//               fillOpacity={getSurfaceOpacity('distal')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'distal')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             {/* Root */}
//             {isUpper ? (
//               <rect x="27" y="35" width="6" height="30" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//             ) : (
//               <rect x="27" y="10" width="6" height="25" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//             )}
//           </g>
//         )}

//         {toothType === 'incisor' && (
//           <g>
//             {/* Incisor crown */}
//             <path
//               d={isUpper 
//                 ? "M22 20 Q22 15 27 15 L33 15 Q38 15 38 20 L38 28 Q38 33 33 33 L27 33 Q22 33 22 28 Z"
//                 : "M22 32 Q22 27 27 27 L33 27 Q38 27 38 32 L38 40 Q38 45 33 45 L27 45 Q22 45 22 40 Z"
//               }
//               fill="#F8F9FA"
//               stroke="#E5E7EB"
//               strokeWidth="1.5"
//             />
            
//             {/* Surfaces */}
//             <rect
//               x="27" y={isUpper ? "20" : "32"} width="6" height="8"
//               fill={getSurfaceColor('incisal')}
//               fillOpacity={getSurfaceOpacity('incisal')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'incisal')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="27" y={isUpper ? "15" : "27"} width="6" height="5"
//               fill={getSurfaceColor('vestibular')}
//               fillOpacity={getSurfaceOpacity('vestibular')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'vestibular')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="27" y={isUpper ? "28" : "40"} width="6" height="5"
//               fill={getSurfaceColor('lingual')}
//               fillOpacity={getSurfaceOpacity('lingual')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'lingual')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="22" y={isUpper ? "20" : "32"} width="5" height="8"
//               fill={getSurfaceColor('mesial')}
//               fillOpacity={getSurfaceOpacity('mesial')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'mesial')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             <rect
//               x="33" y={isUpper ? "20" : "32"} width="5" height="8"
//               fill={getSurfaceColor('distal')}
//               fillOpacity={getSurfaceOpacity('distal')}
//               stroke="#E5E7EB"
//               strokeWidth="0.5"
//               onClick={(e) => handleSurfaceClick(e, 'distal')}
//               className={isSelecting ? "cursor-pointer hover:fill-blue-300" : ""}
//             />
            
//             {/* Root */}
//             {isUpper ? (
//               <rect x="27" y="33" width="6" height="30" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//             ) : (
//               <rect x="27" y="10" width="6" height="25" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="1"/>
//             )}
//           </g>
//         )}

//         {/* Tooth number */}
//         <text
//           x="30"
//           y={isUpper ? "75" : "5"}
//           textAnchor="middle"
//           className="text-xs font-medium fill-gray-600"
//           fontSize="10"
//         >
//           {toothNumber}
//         </text>
//       </svg>

//       {/* Tooltip */}
//       <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
//         Pieza {toothNumber}
//         {conditions.length > 0 && (
//           <div className="text-xs">
//             {conditions.length} condición(es)
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// function getToothType(toothNumber: number): 'molar' | 'premolar' | 'canine' | 'incisor' {
//   const lastDigit = toothNumber % 10;
//   if (lastDigit >= 6) return 'molar';
//   if (lastDigit >= 4) return 'premolar';
//   if (lastDigit === 3) return 'canine';
//   return 'incisor';
// }

// function getConditionColor(condition: string): string {
//   const colors = {
//     caries: '#EF4444',
//     restauracion: '#3B82F6',
//     corona: '#F59E0B',
//     endodoncia: '#8B5CF6',
//     extraccion: '#6B7280',
//     implante: '#10B981',
//     fractura: '#F97316',
//     ausente: '#374151',
//     puente: '#EC4899',
//     carilla: '#06B6D4',
//     infeccion_apical: '#DC2626',
//     reconstruccion_defectuosa: '#7C2D12',
//     amalgama: '#4B5563',
//     sellante: '#0EA5E9'
//   };
//   return colors[condition as keyof typeof colors] || '#6B7280';
// }