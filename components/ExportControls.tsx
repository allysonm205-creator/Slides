import React, { useState, useEffect, useRef } from 'react';
import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';
import type { Slide } from '../types';
import { DownloadIcon, FilePowerpointIcon, FilePdfIcon, FileImageIcon } from './icons/ActionIcons';

interface ExportControlsProps {
  slides: Slide[];
  onExportPNG: () => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({ slides, onExportPNG }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPPTX = () => {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    slides.forEach(slide => {
      const presSlide = pptx.addSlide();

      presSlide.addText(slide.title, { 
        x: 0.5, y: 0.25, w: '90%', h: 1, 
        fontSize: 32, 
        bold: true, 
        color: '363636' 
      });

      const hasImage = slide.imageUrl && slide.imageUrl.startsWith('data:image');
      const textX = hasImage ? 4.5 : 0.5;
      const textW = hasImage ? 5 : 9;

      if (hasImage) {
        presSlide.addImage({
            data: slide.imageUrl,
            x: 0.5, y: 1.5, w: 3.5, h: 3.5 * (9/16)
        });
      }
      
      presSlide.addText(slide.content.map(point => ({ text: point, options: { bullet: true } })), {
        x: textX, y: 1.5, w: textW, h: 3.5,
        fontSize: 16,
        color: '363636'
      });
      
      if (slide.speakerNotes) {
        presSlide.addNotes(slide.speakerNotes);
      }
    });

    pptx.writeFile({ fileName: 'apresentacao.pptx' });
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 450] // 16:9 aspect ratio
    });

    slides.forEach((slide, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Background
      doc.setFillColor('#1e293b'); // bg-slate-800
      doc.rect(0, 0, 800, 450, 'F');
      
      // Title
      doc.setFontSize(30);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#ffffff');
      doc.text(slide.title, 40, 50, { maxWidth: 720 });

      // Content
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#cbd5e1'); // text-slate-300
      
      const hasImage = slide.imageUrl && slide.imageUrl.startsWith('data:image');
      const textX = hasImage ? 350 : 60;
      const textW = hasImage ? 410 : 700;
      let textY = 120;

      if (hasImage) {
        try {
            doc.addImage(slide.imageUrl!, 'PNG', 40, 120, 280, 157.5);
        } catch(e) {
            console.error("Error adding image to PDF", e);
        }
      }

      slide.content.forEach(point => {
        const lines = doc.splitTextToSize(`• ${point}`, textW);
        doc.text(lines, textX, textY);
        textY += (lines.length * 14) + 8;
      });
    });

    doc.save('apresentacao.pdf');
    setIsOpen(false);
  };
  
  const handleExportPNGClick = () => {
    onExportPNG();
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <DownloadIcon className="-ml-1 h-5 w-5" aria-hidden="true" />
          Exportar
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute bottom-full mb-2 w-56 origin-bottom-right rounded-md bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            <button onClick={handleExportPPTX} className="text-slate-200 hover:bg-slate-600 w-full text-left px-4 py-2 text-sm flex items-center gap-3">
              <FilePowerpointIcon className="h-5 w-5 text-orange-400"/>
              <span>Exportar como PPTX</span>
            </button>
            <button onClick={handleExportPDF} className="text-slate-200 hover:bg-slate-600 w-full text-left px-4 py-2 text-sm flex items-center gap-3">
              <FilePdfIcon className="h-5 w-5 text-red-400"/>
              <span>Exportar como PDF</span>
            </button>
            <button onClick={handleExportPNGClick} className="text-slate-200 hover:bg-slate-600 w-full text-left px-4 py-2 text-sm flex items-center gap-3">
              <FileImageIcon className="h-5 w-5 text-blue-400"/>
              <span>Baixar Slide Atual (PNG)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportControls;