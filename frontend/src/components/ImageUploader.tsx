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
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
          <Upload className="w-10 h-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {uploading ? 'Uploading...' : 'Click or drag image to upload'}
          </p>
          <p className="text-xs text-gray-500">
            Supports JPEG, PNG, GIF, WebP (max {maxSize}MB)
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Current Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {currentImages.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center gap-2">
                  {onAnnotate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnnotate(image);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <p className="text-white text-xs truncate">{image.filename}</p>
                  {image.imageType && (
                    <span className="text-white/80 text-xs">{image.imageType}</span>
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