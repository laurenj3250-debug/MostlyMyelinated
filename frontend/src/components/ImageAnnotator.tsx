import { useState, useRef, useEffect } from 'react';
import { X, Highlighter, ArrowRight, Type, Undo, Save, Download } from 'lucide-react';

interface ImageAnnotatorProps {
  imageUrl: string;
  onSave?: (annotatedDataUrl: string) => void;
  onClose?: () => void;
}

type Tool = 'arrow' | 'highlight' | 'text';
type Color = '#FF0000' | '#00FF00' | '#0000FF' | '#FFFF00' | '#FF00FF';

interface Annotation {
  type: Tool;
  color: Color;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  text?: string;
}

export default function ImageAnnotator({ imageUrl, onSave, onClose }: ImageAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>('arrow');
  const [selectedColor, setSelectedColor] = useState<Color>('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);

  const colors: Color[] = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      redrawCanvas(img, []);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const redrawCanvas = (img: HTMLImageElement, anns: Annotation[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Draw annotations
    anns.forEach((ann) => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = 3;

      if (ann.type === 'arrow' && ann.endX !== undefined && ann.endY !== undefined) {
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(ann.startX, ann.startY);
        ctx.lineTo(ann.endX, ann.endY);
        ctx.stroke();

        // Draw arrow head
        const angle = Math.atan2(ann.endY - ann.startY, ann.endX - ann.startX);
        const headLength = 15;
        ctx.beginPath();
        ctx.moveTo(ann.endX, ann.endY);
        ctx.lineTo(
          ann.endX - headLength * Math.cos(angle - Math.PI / 6),
          ann.endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(ann.endX, ann.endY);
        ctx.lineTo(
          ann.endX - headLength * Math.cos(angle + Math.PI / 6),
          ann.endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else if (ann.type === 'highlight' && ann.endX !== undefined && ann.endY !== undefined) {
        // Draw semi-transparent highlight
        ctx.globalAlpha = 0.3;
        ctx.fillRect(
          Math.min(ann.startX, ann.endX),
          Math.min(ann.startY, ann.endY),
          Math.abs(ann.endX - ann.startX),
          Math.abs(ann.endY - ann.startY)
        );
        ctx.globalAlpha = 1;
      } else if (ann.type === 'text' && ann.text) {
        // Draw text
        ctx.font = '20px Arial';
        ctx.fillText(ann.text, ann.startX, ann.startY);
      }
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (selectedTool === 'text') {
      setTextPosition(pos);
    } else {
      setIsDrawing(true);
      setCurrentAnnotation({
        type: selectedTool,
        color: selectedColor,
        startX: pos.x,
        startY: pos.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !image) return;

    const pos = getMousePos(e);
    const updatedAnnotation = {
      ...currentAnnotation,
      endX: pos.x,
      endY: pos.y,
    };

    // Redraw canvas with current annotation
    redrawCanvas(image, [...annotations, updatedAnnotation]);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation || !image) return;

    const pos = getMousePos(e);
    const finalAnnotation = {
      ...currentAnnotation,
      endX: pos.x,
      endY: pos.y,
    };

    const newAnnotations = [...annotations, finalAnnotation];
    setAnnotations(newAnnotations);
    redrawCanvas(image, newAnnotations);

    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  const handleTextSubmit = () => {
    if (!textInput || !textPosition || !image) return;

    const textAnnotation: Annotation = {
      type: 'text',
      color: selectedColor,
      startX: textPosition.x,
      startY: textPosition.y,
      text: textInput,
    };

    const newAnnotations = [...annotations, textAnnotation];
    setAnnotations(newAnnotations);
    redrawCanvas(image, newAnnotations);

    setTextInput('');
    setTextPosition(null);
  };

  const handleUndo = () => {
    if (annotations.length === 0 || !image) return;

    const newAnnotations = annotations.slice(0, -1);
    setAnnotations(newAnnotations);
    redrawCanvas(image, newAnnotations);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'annotated-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Toolbar */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Tool Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTool('arrow')}
                className={`p-2 rounded ${
                  selectedTool === 'arrow' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
                title="Arrow"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedTool('highlight')}
                className={`p-2 rounded ${
                  selectedTool === 'highlight' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
                title="Highlight"
              >
                <Highlighter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedTool('text')}
                className={`p-2 rounded ${
                  selectedTool === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
                title="Text"
              >
                <Type className="w-5 h-5" />
              </button>
            </div>

            {/* Color Selection */}
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Undo */}
            <button
              onClick={handleUndo}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full cursor-crosshair bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      {/* Text Input Modal */}
      {textPosition && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Add Text Annotation</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text..."
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleTextSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setTextPosition(null);
                  setTextInput('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}