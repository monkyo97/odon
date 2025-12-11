import jsPDF from 'jspdf';
import { formatDate } from './formatDate';
import html2canvas from 'html2canvas';
import { Odontogram, ToothCondition } from '@/types/odontogram';
import { SURFACE_CODES, TOOLBAR_TOOLS } from '@/constants/odontogram';

interface GeneratorProps {
    clinicName?: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    odontogram: Odontogram;
    conditions: ToothCondition[];
    elementIdToCapture: string; // ID of the div containing the visual odontogram
}

export const generateOdontogramPDF = async ({
    clinicName = 'Clínica Dental',
    patientName,
    patientEmail,
    patientPhone,
    odontogram,
    conditions,
    elementIdToCapture
}: GeneratorProps) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 1. Header
    doc.setFontSize(18);
    doc.text(clinicName, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Fecha de Generación: ${formatDate(new Date())}`, pageWidth - 14, 20, { align: 'right' }); // Aqui hay fecha mostrar formato 'dd/MM/yyyy'
    
    // 2. Patient Info
    doc.setFontSize(14);
    doc.text('Información del Paciente', 14, 35);
    doc.setFontSize(10);
    doc.text(`Nombre: ${patientName}`, 14, 42);
    if (patientEmail) doc.text(`Email: ${patientEmail}`, 14, 47);
    if (patientPhone) doc.text(`Teléfono: ${patientPhone}`, 14, 52);

    // 3. Odontogram Info
    doc.text(`Odontograma: ${odontogram.name}`, 100, 42);
    doc.text(`Fecha Creación: ${formatDate(odontogram.created_date)}`, 100, 47); // Aqui hay fecha mostrar formato 'dd/MM/yyyy'

    // 4. Capture Visual
    const element = document.getElementById(elementIdToCapture);
    let yPos = 60;
    
    if (element) {
        try {
            const canvas = await html2canvas(element, { 
                scale: 2, // Higher quality
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: true, // Allow cross-origin images if any
                ignoreElements: (node) => node.nodeName === 'BUTTON',
                windowWidth: element.scrollWidth + 50, // Ensure full width is captured
                windowHeight: element.scrollHeight + 50,
                x: 0,
                y: 0,
                width: element.scrollWidth,
                height: element.scrollHeight
            });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = pageWidth - 28;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            doc.addImage(imgData, 'PNG', 14, yPos, pdfWidth, pdfHeight);
            yPos += pdfHeight + 10;
        } catch (error) {
            console.error('Error capturing odontogram', error);
            doc.text('(Error al capturar la imagen del odontograma)', 14, yPos);
            yPos += 10;
        }
    }

    // 5. Table of Conditions
    doc.setFontSize(14);
    doc.text('Detalle de Diagnósticos', 14, yPos);
    yPos += 10;

    // Simple Table Header
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos - 5, pageWidth - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    
    // Header Columns
    doc.text('Fecha', 16, yPos);
    doc.text('Diente', 45, yPos);
    doc.text('Sup.', 65, yPos);
    doc.text('Diagnóstico', 85, yPos);
    doc.text('Notas', 135, yPos);
    doc.text('Importe', pageWidth - 16, yPos, { align: 'right' });
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');

    conditions.forEach((c) => {
        // Check for page break
        if (yPos > 280) {
            doc.addPage();
            yPos = 20;
        }

        const date = c.created_date ? formatDate(c.created_date) : '-'; // Aqui hay fecha mostrar formato 'dd/MM/yyyy'
        const tooth = c.range_end_tooth ? `${c.tooth_number}-${c.range_end_tooth}` : c.tooth_number.toString();
        const surface = SURFACE_CODES[c.surface] || c.surface;
        const type = TOOLBAR_TOOLS.find(t => t.id === c.condition_type)?.label || c.condition_type;
        const notes = c.notes?.substring(0, 30) || '-';
        const cost = c.cost ? `$${c.cost}` : '$0';

        doc.text(date, 16, yPos);
        doc.text(tooth, 45, yPos);
        doc.text(surface, 65, yPos);
        doc.text(type, 85, yPos);
        doc.text(notes, 135, yPos);
        doc.text(cost, pageWidth - 16, yPos, { align: 'right' });

        yPos += 8;
    });

    doc.save(`Odontograma_${patientName}_${formatDate(new Date())}.pdf`); // Aqui hay fecha mostrar formato 'dd/MM/yyyy'
};
