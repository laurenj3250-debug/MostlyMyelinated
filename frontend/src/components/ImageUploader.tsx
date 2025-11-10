import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Edit } from 'lucide-react';
import ImageAnnotator from './ImageAnnotator';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  currentImages?: any[];
  onDeleteImage?: (imageId: string) => Promise<void>;
  onAnnotate?: (imageId: string, annotatedDataUrl: string) => Promise<void>;
  maxSize?: number; // in MB
  accept?: string;
}

export default function ImageUploader({
  onUpload,
  currentImages = [],
  onDeleteImage,
  onAnnotate,
  maxSize = 10,
  accept = 'image/*',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [annotatingImage, setAnnotatingImage] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDelete = async (imageId: string) => {
    if (onDeleteImage && confirm('Delete this image?')) {
      try {
        await onDeleteImage(imageId);
      } catch (error) {
        console.error('Failed to delete image:', error);
        setError('Failed to delete image');
      }
    }
  };

  const handleAnnotate = (image: any) => {
    setAnnotatingImage(image);
  };

  const handleSaveAnnotation = async (annotatedDataUrl: string) => {
    if (!annotatingImage || !onAnnotate) return;

    try {
      await onAnnotate(annotatingImage.id, annotatedDataUrl);
      setAnnotatingImage(null);
    } catch (error) {
      console.error('Failed to save annotation:', error);
      setError('Failed to save annotation');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed p-6 text-center transition-all ${
          dragOver
            ? 'border-lab-cyan bg-lab-cyan/10 shadow-[0_0_20px_rgba(0,217,255,0.3)]'
            : 'border-lab-border bg-black hover:border-lab-cyan/50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{ borderRadius: '2px' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <Upload className={`w-10 h-10 mb-3 ${dragOver ? 'text-lab-cyan' : 'text-lab-text-tertiary'}`} />
          <p className="text-sm font-mono font-bold text-lab-text-primary mb-1 uppercase">
            {uploading ? 'UPLOADING IMAGE...' : 'CLICK OR DRAG IMAGE TO UPLOAD'}
          </p>
          <p className="text-xs font-mono text-lab-text-tertiary uppercase">
            JPEG, PNG, GIF, WEBP (MAX {maxSize}MB)
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-lab-alert/10 border-2 border-lab-alert text-lab-alert p-3 text-sm font-mono" style={{ borderRadius: '2px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-mono font-bold text-lab-cyan uppercase border-b border-lab-border/30 pb-2">
            IMAGING DATA ({currentImages.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {currentImages.map((image) => (
              <div
                key={image.id}
                className="relative group overflow-hidden border-2 border-lab-border hover:border-lab-cyan transition-all bg-black"
                style={{ borderRadius: '2px' }}
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-lab-card flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-lab-text-tertiary" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity flex items-center justify-center gap-2">
                  {onAnnotate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnnotate(image);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-lab-cyan border-2 border-lab-cyan text-black p-2 hover:bg-lab-mint hover:border-lab-mint"
                      style={{ borderRadius: '2px' }}
                      title="Annotate"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDeleteImage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-lab-alert border-2 border-lab-alert text-white p-2 hover:bg-lab-alert/80"
                      style={{ borderRadius: '2px' }}
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-lab-border/50 p-2">
                  <p className="text-white text-xs font-mono truncate">{image.filename}</p>
                  {image.imageType && (
                    <span className="text-lab-cyan text-xs font-mono uppercase">{image.imageType}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Annotator */}
      {annotatingImage && (
        <ImageAnnotator
          imageUrl={annotatingImage.url}
          onSave={handleSaveAnnotation}
          onClose={() => setAnnotatingImage(null)}
        />
      )}
    </div>
  );
}