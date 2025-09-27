import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import sharp from 'sharp';

export interface ProcessedFile {
  type: 'image' | 'text' | 'table' | 'code' | 'archive' | 'video' | 'audio' | 'unknown';
  content: string;
  metadata: {
    filename: string;
    size: number;
    mimeType: string;
    extension: string;
    category: string;
    pages?: number;
    sheets?: string[];
    dimensions?: { width: number; height: number };
    duration?: number;
    encoding?: string;
  };
  base64?: string; // For images
  preview?: string; // For text previews
  icon?: string; // Icon identifier
}

export interface FileProcessingResult {
  success: boolean;
  data?: ProcessedFile;
  error?: string;
}

/**
 * Process uploaded file and extract content for AI consumption
 */
export async function processFile(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    console.log(`🔄 Processing file: ${filename} (${mimeType})`);
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    
    // Determine file type and process accordingly
    if (mimeType.startsWith('image/')) {
      return await processImage(file, filename, mimeType);
    } else if (mimeType === 'application/pdf') {
      return await processPDF(file, filename, mimeType);
    } else if (isSpreadsheetFile(filename, mimeType)) {
      return await processExcel(file, filename, mimeType);
    } else if (isWordFile(filename, mimeType)) {
      return await processWord(file, filename, mimeType);
    } else if (isTextFile(filename, mimeType)) {
      return await processText(file, filename, mimeType);
    } else if (isCodeFile(filename)) {
      return await processCode(file, filename, mimeType);
    } else if (isArchiveFile(filename)) {
      return await processArchive(file, filename, mimeType);
    } else if (isVideoFile(filename)) {
      return await processVideo(file, filename, mimeType);
    } else if (isAudioFile(filename)) {
      return await processAudio(file, filename, mimeType);
    } else {
      // Handle unsupported files with generic processing
      return await processGeneric(file, filename, mimeType);
    }
  } catch (error) {
    console.error('❌ File processing error:', error);
    return {
      success: false,
      error: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process image files (JPG, PNG, GIF, WebP)
 */
async function processImage(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    
    // Get image metadata first
    const sharpMetadata = await sharp(file).metadata();
    
    // Optimize image and convert to base64
    const optimizedImage = await sharp(file)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64 = optimizedImage.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    const dimensions = {
      width: sharpMetadata.width || 0,
      height: sharpMetadata.height || 0
    };

    return {
      success: true,
      data: {
        type: 'image',
        content: `[Image: ${filename}] - This is an uploaded image (${dimensions.width}x${dimensions.height}) that the user wants you to analyze. Please describe what you see in detail.`,
        base64: dataUrl,
        preview: `Image - ${dimensions.width}x${dimensions.height}`,
        icon: extension,
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category,
          dimensions,
          ...sharpMetadata
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process PDF files
 */
async function processPDF(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    const data = await pdfParse(file);
    
    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        error: 'PDF contains no readable text. The PDF might be image-based or password protected.'
      };
    }

    // Clean up the extracted text
    const cleanedText = data.text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      success: true,
      data: {
        type: 'text',
        content: `\n=== FILE CONTENT START ===\nFilename: ${filename}\nFile Type: PDF Document\nPages: ${data.numpages}\n---\n\n${cleanedText}\n\n=== FILE CONTENT END ===\n`,
        preview: cleanedText.substring(0, 200) + (cleanedText.length > 200 ? '...' : ''),
        icon: 'pdf',
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category,
          pages: data.numpages
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process Excel files (.xlsx, .xls)
 */
async function processExcel(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 0) {
      return {
        success: false,
        error: 'Excel file contains no sheets.'
      };
    }

    let content = `\n=== FILE CONTENT START ===\nFilename: ${filename}\nFile Type: Excel Spreadsheet\nSheets: ${sheetNames.join(', ')}\n---\n\n`;
    let preview = '';
    
    // Process each sheet
    sheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      content += `Sheet: ${sheetName}\n`;
      content += '---\n';
      
      // Convert to readable table format
      if (jsonData.length > 0) {
        const maxRows = Math.min(jsonData.length, 50); // Limit to first 50 rows
        
        for (let i = 0; i < maxRows; i++) {
          const row = jsonData[i] as any[];
          if (row && row.length > 0) {
            const rowData = row.map(cell => cell?.toString() || '').join('\t');
            content += rowData + '\n';
            
            // Create preview from first few rows
            if (i < 3 && index === 0) {
              preview += rowData.substring(0, 50) + '\n';
            }
          }
        }
        
        if (jsonData.length > 50) {
          content += `... (showing first 50 of ${jsonData.length} rows)\n`;
        }
      } else {
        content += 'Empty sheet\n';
      }
      
      content += '\n';
    });
    
    content += '\n=== FILE CONTENT END ===\n';

    return {
      success: true,
      data: {
        type: 'table',
        content,
        preview: preview.trim() || `${sheetNames.length} sheet(s)`,
        icon: extension,
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category,
          sheets: sheetNames
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process Word documents (.docx, .doc)
 */
async function processWord(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    const result = await mammoth.extractRawText({ buffer: file });
    
    if (!result.value || result.value.trim().length === 0) {
      return {
        success: false,
        error: 'Word document contains no readable text.'
      };
    }

    // Clean up extracted text
    const cleanedText = result.value
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    let noteText = '';
    // Add warnings if any
    if (result.messages && result.messages.length > 0) {
      const warnings = result.messages.filter(m => m.type === 'warning');
      if (warnings.length > 0) {
        noteText = '\n\n[Note: Some formatting or elements may not have been extracted properly]';
      }
    }

    return {
      success: true,
      data: {
        type: 'text',
        content: `\n=== FILE CONTENT START ===\nFilename: ${filename}\nFile Type: Word Document\n---\n\n${cleanedText}${noteText}\n\n=== FILE CONTENT END ===\n`,
        preview: cleanedText.substring(0, 200) + (cleanedText.length > 200 ? '...' : ''),
        icon: extension,
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process Word document: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process plain text files
 */
async function processText(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    let content = file.toString('utf-8');
    let encoding = 'utf-8';
    
    // Try different encodings if UTF-8 fails
    if (content.includes('�')) {
      try {
        content = file.toString('latin1');
        encoding = 'latin1';
      } catch {
        content = file.toString('ascii');
        encoding = 'ascii';
      }
    }
    
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: 'Text file is empty.'
      };
    }

    return {
      success: true,
      data: {
        type: 'text',
        content: `\n=== FILE CONTENT START ===\nFilename: ${filename}\nFile Type: Text File\n---\n${content}\n=== FILE CONTENT END ===\n`,
        preview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        icon: 'txt',
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category,
          encoding
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process text file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process code files (HTML, CSS, JS, Python, etc.)
 */
async function processCode(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    let content = file.toString('utf-8');
    let encoding = 'utf-8';
    
    // Try different encodings if UTF-8 fails
    if (content.includes('�')) {
      try {
        content = file.toString('latin1');
        encoding = 'latin1';
      } catch {
        content = file.toString('ascii');
        encoding = 'ascii';
      }
    }
    
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: 'Code file is empty.'
      };
    }

    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'jsx': 'React JSX',
      'ts': 'TypeScript',
      'tsx': 'React TSX',
      'py': 'Python',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'md': 'Markdown',
      'java': 'Java',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'sql': 'SQL'
    };

    const language = languageMap[extension] || extension.toUpperCase();

    return {
      success: true,
      data: {
        type: 'code',
        content: `\n=== FILE CONTENT START ===\nFilename: ${filename}\nFile Type: ${language} Code\nEncoding: ${encoding}\n---\n\n${content}\n\n=== FILE CONTENT END ===\n`,
        preview: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        icon: extension,
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category,
          encoding
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process code file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process archive files (ZIP, RAR, 7Z, etc.)
 */
async function processArchive(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    
    // For archives, we can't extract content easily without additional dependencies
    // But we can provide metadata and indicate it's an archive
    const archiveTypes: { [key: string]: string } = {
      'zip': 'ZIP Archive',
      'rar': 'RAR Archive',
      '7z': '7-Zip Archive',
      'tar': 'TAR Archive',
      'gz': 'GZIP Archive',
      'bz2': 'BZIP2 Archive',
      'xz': 'XZ Archive'
    };

    const archiveType = archiveTypes[extension] || 'Archive';

    return {
      success: true,
      data: {
        type: 'archive',
        content: `[${archiveType}: ${filename}] - This is a compressed archive file. I can see the archive but cannot extract its contents. Please extract the files if you need me to analyze specific content within the archive.`,
        preview: `${archiveType} - ${(file.length / 1024 / 1024).toFixed(2)} MB`,
        icon: extension,
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process archive: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process video files
 */
async function processVideo(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    
    const videoTypes: { [key: string]: string } = {
      'mp4': 'MP4 Video',
      'avi': 'AVI Video',
      'mkv': 'MKV Video',
      'mov': 'MOV Video',
      'wmv': 'WMV Video',
      'flv': 'FLV Video',
      'webm': 'WebM Video',
      'm4v': 'M4V Video'
    };

    const videoType = videoTypes[extension] || 'Video';
    const sizeInMB = (file.length / 1024 / 1024).toFixed(2);

    return {
      success: true,
      data: {
        type: 'video',
        content: `[${videoType}: ${filename}] - This is a video file (${sizeInMB} MB). I can see the video file but cannot play or analyze video content directly. Please describe what you'd like me to help you with regarding this video.`,
        preview: `${videoType} - ${sizeInMB} MB`,
        icon: extension,
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process video: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process audio files
 */
async function processAudio(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    
    const audioTypes: { [key: string]: string } = {
      'mp3': 'MP3 Audio',
      'wav': 'WAV Audio',
      'flac': 'FLAC Audio',
      'aac': 'AAC Audio',
      'ogg': 'OGG Audio',
      'wma': 'WMA Audio',
      'm4a': 'M4A Audio'
    };

    const audioType = audioTypes[extension] || 'Audio';
    const sizeInMB = (file.length / 1024 / 1024).toFixed(2);

    return {
      success: true,
      data: {
        type: 'audio',
        content: `[${audioType}: ${filename}] - This is an audio file (${sizeInMB} MB). I can see the audio file but cannot play or transcribe audio content directly. Please describe what you'd like me to help you with regarding this audio.`,
        preview: `${audioType} - ${sizeInMB} MB`,
        icon: extension,
        metadata: {
          filename,
          size: file.length,
          mimeType,
          extension,
          category
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process audio: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process generic/unknown files
 */
async function processGeneric(file: Buffer, filename: string, mimeType: string): Promise<FileProcessingResult> {
  try {
    const extension = getFileExtension(filename);
    const category = getFileCategory(filename, mimeType);
    const sizeInMB = (file.length / 1024 / 1024).toFixed(2);
    
    // Try to detect if it's a text-based file
    let isTextBased = false;
    let content = '';
    let preview = '';
    
    try {
      content = file.toString('utf-8');
      // Check if it looks like text (no null bytes, mostly printable characters)
      if (!content.includes('\0') && content.substring(0, 1000).split('').every(char => {
        const code = char.charCodeAt(0);
        return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
      })) {
        isTextBased = true;
        preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
      }
    } catch {
      // Not text-based
    }

    if (isTextBased && content.trim()) {
      return {
        success: true,
        data: {
          type: 'text',
          content: `[${extension.toUpperCase()} File: ${filename}]\n\n${content}`,
          preview,
          icon: extension || 'file',
          metadata: {
            filename,
            size: file.length,
            mimeType,
            extension,
            category,
            encoding: 'utf-8'
          }
        }
      };
    } else {
      return {
        success: true,
        data: {
          type: 'unknown',
          content: `[${extension.toUpperCase()} File: ${filename}] - This is a ${extension.toUpperCase()} file (${sizeInMB} MB). I can see the file but cannot analyze its binary content directly. Please describe what you'd like me to help you with regarding this file.`,
          preview: `${extension.toUpperCase()} file - ${sizeInMB} MB`,
          icon: extension || 'file',
          metadata: {
            filename,
            size: file.length,
            mimeType,
            extension,
            category
          }
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validate file before processing
 */
export function validateFile(file: { size: number; mimetype?: string; originalname: string; type?: string }): { valid: boolean; error?: string; warning?: string } {
  const maxSize = 100 * 1024 * 1024; // 100MB (increased limit)
  const mimeType = file.mimetype || file.type || '';
  const filename = file.originalname || '';
  const extension = getFileExtension(filename);
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Dosya çok büyük. Maksimum boyut 100MB. Bu dosya ${Math.round(file.size / 1024 / 1024)}MB.`
    };
  }
  
  // Extended allowed types - now supports many more formats
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
    // Documents  
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/rtf',
    // Spreadsheets
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv',
    // Presentations
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
    // Text files
    'text/plain', 'text/html', 'text/css', 'text/javascript', 'text/markdown',
    // Code files
    'application/javascript', 'application/json', 'application/xml', 'text/xml',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    'application/x-tar', 'application/gzip',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg',
    // Video
    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/webm'
  ];
  
  // Also check by extension for files that might not have correct MIME type
  const allowedExtensions = [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'psd', 'ai', 'sketch',
    // Documents
    'pdf', 'doc', 'docx', 'rtf', 'odt', 'pages',
    // Spreadsheets
    'xls', 'xlsx', 'csv', 'ods', 'numbers',
    // Presentations
    'ppt', 'pptx', 'odp', 'key',
    // Text & Code
    'txt', 'md', 'html', 'htm', 'css', 'scss', 'sass', 'less',
    'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
    'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env',
    'py', 'java', 'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala',
    'sql', 'sqlite', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
    // Media
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus',
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v',
    // Special
    'dockerfile', 'gitignore', 'license', 'makefile', 'readme'
  ];
  
  // Check if file is allowed by MIME type or extension
  const isAllowedByMime = allowedTypes.includes(mimeType);
  const isAllowedByExtension = allowedExtensions.includes(extension);
  
  if (!isAllowedByMime && !isAllowedByExtension) {
    return {
      valid: false,
      error: `Bu dosya türü desteklenmiyor: ${extension || mimeType}. Desteklenen türler: Resimler, PDF, Word, Excel, PowerPoint, metin dosyaları, kod dosyaları, arşivler, ses ve video dosyaları.`
    };
  }
  
  // Check if file is processable by AI
  const isProcessable = isFileProcessable(extension);
  let warning;
  
  if (!isProcessable) {
    warning = `Bu dosya türü AI tarafından okunamayabilir, ancak yine de yüklenebilir.`;
  }
  
  return { 
    valid: true, 
    warning 
  };
}

// ===== NEW HELPER FUNCTIONS =====

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get file category for better organization
 */
export function getFileCategory(filename: string, mimeType: string): string {
  const ext = getFileExtension(filename);
  
  // Images
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'psd', 'ai'].includes(ext)) {
    return 'image';
  }
  
  // Documents
  if (['pdf', 'doc', 'docx', 'rtf', 'odt'].includes(ext)) {
    return 'document';
  }
  
  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return 'spreadsheet';
  }
  
  // Presentations
  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return 'presentation';
  }
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'md', 'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql'].includes(ext)) {
    return 'code';
  }
  
  // Text files
  if (['txt', 'rtf', 'log'].includes(ext)) {
    return 'text';
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return 'archive';
  }
  
  // Video
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'].includes(ext)) {
    return 'video';
  }
  
  // Audio
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(ext)) {
    return 'audio';
  }
  
  return 'unknown';
}

/**
 * Check if file is a spreadsheet
 */
function isSpreadsheetFile(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);
  return mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['xlsx', 'xls', 'csv'].includes(ext);
}

/**
 * Check if file is a Word document
 */
function isWordFile(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);
  return mimeType.includes('document') || mimeType.includes('word') || ['docx', 'doc'].includes(ext);
}

/**
 * Check if file is a text file
 */
function isTextFile(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);
  return mimeType === 'text/plain' || ['txt', 'rtf', 'log'].includes(ext);
}

/**
 * Check if file is a code file
 */
function isCodeFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  const codeExtensions = [
    // Web
    'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
    // Data
    'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
    // Documentation
    'md', 'markdown', 'rst', 'tex',
    // Programming languages
    'py', 'java', 'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala',
    // Database
    'sql', 'sqlite',
    // Shell
    'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
    // Other
    'dockerfile', 'gitignore', 'env'
  ];
  return codeExtensions.includes(ext);
}

/**
 * Check if file is an archive
 */
function isArchiveFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext);
}

/**
 * Check if file is a video
 */
function isVideoFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'].includes(ext);
}

/**
 * Check if file is audio
 */
function isAudioFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(ext);
}

/**
 * Get file type category for UI display (legacy function)
 */
export function getFileTypeCategory(mimeType: string): 'image' | 'document' | 'spreadsheet' | 'text' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'document';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType === 'text/plain') return 'text';
  return 'unknown';
}
