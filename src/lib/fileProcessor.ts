import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import sharp from 'sharp';

export interface ProcessedFile {
  type: 'image' | 'text' | 'table';
  content: string;
  metadata: {
    filename: string;
    size: number;
    mimeType: string;
    pages?: number;
    sheets?: string[];
  };
  base64?: string; // For images
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
    
    // Determine file type and process accordingly
    if (mimeType.startsWith('image/')) {
      return await processImage(file, filename, mimeType);
    } else if (mimeType === 'application/pdf') {
      return await processPDF(file, filename, mimeType);
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      return await processExcel(file, filename, mimeType);
    } else if (mimeType.includes('document') || mimeType.includes('word') || filename.endsWith('.docx') || filename.endsWith('.doc')) {
      return await processWord(file, filename, mimeType);
    } else if (mimeType === 'text/plain' || filename.endsWith('.txt')) {
      return await processText(file, filename, mimeType);
    } else {
      return {
        success: false,
        error: `Unsupported file type: ${mimeType}. Supported types: Images (JPG, PNG, GIF), PDF, Excel, Word, Text files.`
      };
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
    // Optimize image and convert to base64
    const optimizedImage = await sharp(file)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64 = optimizedImage.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    // Get image metadata
    const metadata = await sharp(file).metadata();

    return {
      success: true,
      data: {
        type: 'image',
        content: `[Image: ${filename}] - This is an uploaded image that the user wants you to analyze. Please describe what you see in detail.`,
        base64: dataUrl,
        metadata: {
          filename,
          size: file.length,
          mimeType,
          ...metadata
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
        content: `[PDF Document: ${filename}]\n\n${cleanedText}`,
        metadata: {
          filename,
          size: file.length,
          mimeType,
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
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 0) {
      return {
        success: false,
        error: 'Excel file contains no sheets.'
      };
    }

    let content = `[Excel Spreadsheet: ${filename}]\n\n`;
    
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

    return {
      success: true,
      data: {
        type: 'table',
        content,
        metadata: {
          filename,
          size: file.length,
          mimeType,
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

    let content = `[Word Document: ${filename}]\n\n${cleanedText}`;

    // Add warnings if any
    if (result.messages && result.messages.length > 0) {
      const warnings = result.messages.filter(m => m.type === 'warning');
      if (warnings.length > 0) {
        content += '\n\n[Note: Some formatting or elements may not have been extracted properly]';
      }
    }

    return {
      success: true,
      data: {
        type: 'text',
        content,
        metadata: {
          filename,
          size: file.length,
          mimeType
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
    const content = file.toString('utf-8');
    
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
        content: `[Text File: ${filename}]\n\n${content}`,
        metadata: {
          filename,
          size: file.length,
          mimeType
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
 * Validate file before processing
 */
export function validateFile(file: { size: number; mimetype: string; originalname: string }): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Documents  
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/plain'
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is 50MB. Your file is ${Math.round(file.size / 1024 / 1024)}MB.`
    };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.mimetype}. Supported types: Images (JPG, PNG, GIF, WebP), PDF, Word (DOC, DOCX), Excel (XLS, XLSX), Text files.`
    };
  }

  return { valid: true };
}

/**
 * Get file type category for UI display
 */
export function getFileTypeCategory(mimeType: string): 'image' | 'document' | 'spreadsheet' | 'text' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'document';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType === 'text/plain') return 'text';
  return 'unknown';
}