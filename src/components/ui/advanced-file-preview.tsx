'use client';

import React from 'react';
import { X, FileText, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { getFileDisplayInfo, formatFileSize, isFileProcessable } from '@/utils/fileUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FileItem {
  id: string;
  file: File;
  name: string;
  preview?: string;
}

interface AdvancedFilePreviewProps {
  fileItems: FileItem[];
  onRemove: (index: number) => void;
  maxFiles?: number;
  compact?: boolean;
  showDetails?: boolean;
}

export default function AdvancedFilePreview({
  fileItems,
  onRemove,
  maxFiles = 3,
  compact = false,
  showDetails = true
}: AdvancedFilePreviewProps) {
  if (fileItems.length === 0) return null;

  if (compact) {
    return <CompactFilePreview fileItems={fileItems} onRemove={onRemove} />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">
          Yüklenen Dosyalar ({fileItems.length}/{maxFiles})
        </h4>
        {fileItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileItems.forEach((_, index) => onRemove(index))}
            className="h-auto p-1 text-xs text-muted-foreground hover:text-destructive"
          >
            Tümünü Temizle
          </Button>
        )}
      </div>
      
      <div className="grid gap-2">
        {fileItems.map((fileItem, index) => (
          <FilePreviewCard
            key={fileItem.id || index}
            fileItem={fileItem}
            index={index}
            onRemove={onRemove}
            showDetails={showDetails}
          />
        ))}
      </div>
    </div>
  );
}

// Eski icon sistemiyle çalışan fonksiyonlar
const getFileType = (fileItem: any) => {
  const file = fileItem.file || fileItem;
  if (file.type?.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  if (
    file.type === 'application/msword' || 
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) return 'word';
  if (
    file.type === 'application/vnd.ms-excel' || 
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) return 'excel';
  return 'document';
};

// Kod dosyası uzantıları - bunlar için kırmızı code icon kullanılacak
const codeExtensions = [
  // Web Technologies
  'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'sass', 'less',
  // Programming Languages
  'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
  // Data/Config
  'json', 'xml', 'yaml', 'yml', 'sql', 'md', 'txt'
];

// Bilinen dosya türleri - bunlar için özel iconlar var
const knownFileTypes = ['pdf', 'word', 'excel', 'image'];

// Bilinen text/document uzantıları - bunlar için document icon
const documentExtensions = ['rtf', 'odt', 'pages', 'docm', 'dotx'];

const getFileIcon = (fileType: string, extension?: string) => {
  const ext = extension?.toLowerCase();
  
  // Kod dosyaları için kırmızı code icon
  if (ext && codeExtensions.includes(ext)) {
    return '/code_icon.png';
  }
  
  // Özel dosya türleri için specific iconlar
  switch (fileType) {
    case 'pdf':
      return '/pdf_icon.png';
    case 'word':
      return '/word_icon.png';
    case 'excel':
      return '/excel_icon.png';
    case 'image':
      return '/image_icon.png';
    default:
      // Bilinen document uzantıları için document icon
      if (ext && documentExtensions.includes(ext)) {
        return '/document_icon.png';
      }
      // Bilinmeyen uzantılar için bilinmeyen dosya icon
      return '/bilinmeyen_dosya.png';
  }
};

const getFileColor = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return 'bg-red-500';
    case 'word':
      return 'bg-blue-500';
    case 'excel':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

function CompactFilePreview({
  fileItems,
  onRemove
}: {
  fileItems: FileItem[];
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {fileItems.map((fileItem, index) => {
        const file = fileItem.file || fileItem;
        const fileName = file.name || fileItem.name || 'Unknown';
        const fileType = getFileType(fileItem);
        const extension = fileName.split('.').pop()?.toLowerCase();
        const fileIcon = getFileIcon(fileType, extension);
        const fileColor = getFileColor(fileType);
        // Dosya türüne göre gösterim seçimi
        const ext = extension?.toLowerCase();
        const isCodeFile = ext && codeExtensions.includes(ext);
        const isKnownDocument = ext && documentExtensions.includes(ext);
        const isKnownFileType = knownFileTypes.includes(fileType);
        const isUnknownFile = !isCodeFile && !isKnownDocument && !isKnownFileType;
        const hasSpecificIcon = true; // Her tür dosya için artik icon var
        
        return (
          <div 
            key={fileItem.id || index} 
            className="relative bg-muted/20 rounded-lg overflow-hidden border border-border/20"
            style={{ width: '80px', height: '80px' }}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          >
            {fileItem.preview ? (
              <img 
                src={fileItem.preview} 
                alt={fileName}
                className="w-full h-full object-cover"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-1">
                {hasSpecificIcon ? (
                  // Kod dosyaları, PDF, Word, Excel vb. için icon gösterimi
                  <>
                    <div className="w-10 h-10 flex items-center justify-center mb-1">
                      <img 
                        src={fileIcon as string} 
                        alt={fileType} 
                        className="w-8 h-8 object-contain"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </div>
                    {isCodeFile && (
                      <span className="text-xs font-bold text-foreground text-center">
                        {extension?.toUpperCase()}
                      </span>
                    )}
                    {isUnknownFile && (
                      <span className="text-xs font-bold text-orange-500 text-center">
                        Bilinmeyen
                      </span>
                    )}
                    {!isCodeFile && !isUnknownFile && (
                      <span className="text-xs text-muted-foreground/70 text-center truncate w-full">
                        {fileName && fileName.length > 12 ? fileName.substring(0, 8) + '...' : fileName}
                      </span>
                    )}
                  </>
                ) : (
                  // Diğer dosyalar için metin gösterimi
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-xs font-bold text-foreground text-center">
                      {extension?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90 shadow-sm"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

function FilePreviewCard({
  fileItem,
  index,
  onRemove,
  showDetails
}: {
  fileItem: FileItem;
  index: number;
  onRemove: (index: number) => void;
  showDetails: boolean;
}) {
  const file = fileItem.file || fileItem;
  const fileName = file.name || fileItem.name || 'Unknown';
  const fileInfo = getFileDisplayInfo(fileName, file.type);
  const isProcessable = isFileProcessable(fileInfo.category);
  const fileSize = formatFileSize(file.size);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          {/* File Icon/Preview */}
          <div className="flex-shrink-0">
            {fileItem.preview ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden">
                <img
                  src={fileItem.preview}
                  alt={fileName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${fileInfo.color}`}>
                {fileInfo.icon}
              </div>
            )}
          </div>
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-foreground truncate" title={fileName}>
                  {fileName}
                </h5>
                <p className="text-xs text-muted-foreground truncate">
                  {fileInfo.displayName}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-1 ml-2">
                {showDetails && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <div className="font-medium">{fileInfo.displayName}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {fileInfo.description}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* File Details */}
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {fileInfo.category}
              </Badge>
              
              <span className="text-xs text-muted-foreground">
                {fileSize}
              </span>
              
              {isProcessable ? (
                <div className="flex items-center text-xs text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  AI okuyabilir
                </div>
              ) : (
                <div className="flex items-center text-xs text-yellow-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Desteklemiyor
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for showing file upload stats
export function FileUploadStats({ 
  fileCount, 
  maxFiles, 
  totalSize 
}: { 
  fileCount: number;
  maxFiles: number;
  totalSize: number;
}) {
  const percentage = (fileCount / maxFiles) * 100;
  
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        {fileCount}/{maxFiles} dosya
      </span>
      <span>
        {formatFileSize(totalSize)}
      </span>
      <div className="flex-1 mx-2 bg-muted h-1 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}