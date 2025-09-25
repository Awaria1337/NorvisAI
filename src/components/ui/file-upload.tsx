'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, Image, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
// File type category helper (inline to avoid server imports)
const getFileTypeCategory = (mimeType: string): 'image' | 'document' | 'spreadsheet' | 'text' | 'unknown' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'document';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType === 'text/plain') return 'text';
  return 'unknown';
};
import { cn } from '@/utils/cn';

interface FileWithPreview {
  file: File;
  id: string;
  preview?: string;
  error?: string;
  processed?: boolean;
}

interface FileUploadProps {
  onFilesChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

const getFileIcon = (mimeType: string) => {
  const category = getFileTypeCategory(mimeType);
  switch (category) {
    case 'image': return <Image className="h-4 w-4" />;
    case 'spreadsheet': return <FileSpreadsheet className="h-4 w-4" />;
    case 'document':
    case 'text': return <FileText className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  maxSize = 50 * 1024 * 1024, // 50MB
  disabled = false,
  className
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState<Record<string, number>>({});

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return `Unsupported file type: ${file.type}`;
    }

    if (file.size > maxSize) {
      return `File too large. Maximum size is ${formatFileSize(maxSize)}. Your file is ${formatFileSize(file.size)}.`;
    }

    return null;
  };

  const processFile = useCallback(async (file: File): Promise<FileWithPreview> => {
    const id = Math.random().toString(36).substring(7);
    const error = validateFile(file);
    
    if (error) {
      return { file, id, error };
    }

    let preview: string | undefined;
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      try {
        preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      } catch (err) {
        console.error('Error generating image preview:', err);
      }
    }

    return { file, id, preview };
  }, [maxSize]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;
    
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading({});
    
    const newFiles: FileWithPreview[] = [];
    
    for (const file of acceptedFiles) {
      const processedFile = await processFile(file);
      newFiles.push(processedFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, maxFiles, disabled, processFile, onFilesChange]);

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxFiles,
    maxSize,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    }
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          files.length > 0 && "border-primary/20 bg-muted/20"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-primary">Drop files here...</p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Images, PDF, Word, Excel, Text files (max {formatFileSize(maxSize)})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border",
                fileItem.error ? "border-destructive bg-destructive/5" : "border-border bg-card"
              )}
            >
              {/* File Icon/Preview */}
              <div className="flex-shrink-0">
                {fileItem.preview ? (
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    {fileItem.error ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      getFileIcon(fileItem.file.type)
                    )}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileItem.file.size)}
                  {fileItem.error && (
                    <span className="text-destructive ml-2">
                      • {fileItem.error}
                    </span>
                  )}
                </p>
                
                {/* Upload Progress */}
                {uploading[fileItem.id] !== undefined && (
                  <div className="mt-1">
                    <Progress value={uploading[fileItem.id]} className="h-1" />
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(fileItem.id)}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {files.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {files.length} of {maxFiles} files selected
        </div>
      )}
    </div>
  );
};

export default FileUpload;