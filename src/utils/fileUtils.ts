/**
 * Advanced File Utilities for Norvis AI
 * Handles file icons, colors, and display information
 */

export interface FileDisplayInfo {
  icon: string;
  color: string;
  displayName: string;
  description: string;
  category: string;
}

/**
 * Get comprehensive display information for a file
 */
export function getFileDisplayInfo(filename: string, mimeType?: string): FileDisplayInfo {
  const extension = getFileExtension(filename);
  const category = getFileCategory(extension, mimeType);
  
  // Get specific info based on extension
  const info = getExtensionInfo(extension);
  
  return {
    icon: info.icon,
    color: info.color,
    displayName: info.displayName,
    description: info.description,
    category: category
  };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get file category
 */
export function getFileCategory(extension: string, mimeType?: string): string {
  // Images
  if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'psd', 'ai', 'sketch'].includes(extension)) {
    return 'image';
  }
  
  // Documents
  if (['pdf', 'doc', 'docx', 'rtf', 'odt', 'pages'].includes(extension)) {
    return 'document';
  }
  
  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods', 'numbers'].includes(extension)) {
    return 'spreadsheet';
  }
  
  // Presentations
  if (['ppt', 'pptx', 'odp', 'key'].includes(extension)) {
    return 'presentation';
  }
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'md', 'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'bat'].includes(extension)) {
    return 'code';
  }
  
  // Text files
  if (['txt', 'rtf', 'log', 'readme'].includes(extension)) {
    return 'text';
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return 'archive';
  }
  
  // Video
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'f4v'].includes(extension)) {
    return 'video';
  }
  
  // Audio
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(extension)) {
    return 'audio';
  }
  
  return 'unknown';
}

/**
 * Get detailed extension information
 */
function getExtensionInfo(extension: string): Omit<FileDisplayInfo, 'category'> {
  const extensionMap: Record<string, Omit<FileDisplayInfo, 'category'>> = {
    // Images
    'jpg': { icon: '🖼️', color: 'bg-blue-500', displayName: 'JPEG Image', description: 'Joint Photographic Experts Group image' },
    'jpeg': { icon: '🖼️', color: 'bg-blue-500', displayName: 'JPEG Image', description: 'Joint Photographic Experts Group image' },
    'png': { icon: '🖼️', color: 'bg-green-500', displayName: 'PNG Image', description: 'Portable Network Graphics image' },
    'gif': { icon: '🎞️', color: 'bg-pink-500', displayName: 'GIF Image', description: 'Graphics Interchange Format animated image' },
    'webp': { icon: '🖼️', color: 'bg-purple-500', displayName: 'WebP Image', description: 'Web Picture format image' },
    'svg': { icon: '🎨', color: 'bg-orange-500', displayName: 'SVG Vector', description: 'Scalable Vector Graphics' },
    'bmp': { icon: '🖼️', color: 'bg-gray-500', displayName: 'Bitmap', description: 'Windows Bitmap image' },
    'ico': { icon: '🔸', color: 'bg-blue-500', displayName: 'Icon', description: 'Windows Icon file' },
    'tiff': { icon: '🖼️', color: 'bg-indigo-500', displayName: 'TIFF Image', description: 'Tagged Image File Format' },
    'psd': { icon: '🎨', color: 'bg-blue-600', displayName: 'Photoshop', description: 'Adobe Photoshop Document' },
    'ai': { icon: '🎨', color: 'bg-orange-600', displayName: 'Illustrator', description: 'Adobe Illustrator Document' },
    'sketch': { icon: '🎨', color: 'bg-yellow-500', displayName: 'Sketch', description: 'Sketch Design File' },

    // Documents
    'pdf': { icon: '📄', color: 'bg-red-500', displayName: 'PDF Document', description: 'Portable Document Format' },
    'doc': { icon: '📝', color: 'bg-blue-500', displayName: 'Word Document', description: 'Microsoft Word 97-2003' },
    'docx': { icon: '📝', color: 'bg-blue-500', displayName: 'Word Document', description: 'Microsoft Word Document' },
    'rtf': { icon: '📝', color: 'bg-gray-500', displayName: 'Rich Text', description: 'Rich Text Format document' },
    'odt': { icon: '📝', color: 'bg-green-500', displayName: 'OpenDocument', description: 'OpenDocument Text document' },
    'pages': { icon: '📝', color: 'bg-blue-500', displayName: 'Pages', description: 'Apple Pages document' },

    // Spreadsheets
    'xls': { icon: '📊', color: 'bg-green-500', displayName: 'Excel Spreadsheet', description: 'Microsoft Excel 97-2003' },
    'xlsx': { icon: '📊', color: 'bg-green-500', displayName: 'Excel Spreadsheet', description: 'Microsoft Excel Workbook' },
    'csv': { icon: '📊', color: 'bg-gray-500', displayName: 'CSV Data', description: 'Comma-Separated Values' },
    'ods': { icon: '📊', color: 'bg-green-500', displayName: 'OpenDocument', description: 'OpenDocument Spreadsheet' },
    'numbers': { icon: '📊', color: 'bg-green-500', displayName: 'Numbers', description: 'Apple Numbers spreadsheet' },

    // Presentations
    'ppt': { icon: '📊', color: 'bg-orange-500', displayName: 'PowerPoint', description: 'Microsoft PowerPoint 97-2003' },
    'pptx': { icon: '📊', color: 'bg-orange-500', displayName: 'PowerPoint', description: 'Microsoft PowerPoint Presentation' },
    'odp': { icon: '📊', color: 'bg-orange-500', displayName: 'OpenDocument', description: 'OpenDocument Presentation' },
    'key': { icon: '📊', color: 'bg-orange-500', displayName: 'Keynote', description: 'Apple Keynote presentation' },

    // Web Technologies
    'html': { icon: '🌐', color: 'bg-orange-500', displayName: 'HTML', description: 'HyperText Markup Language' },
    'htm': { icon: '🌐', color: 'bg-orange-500', displayName: 'HTML', description: 'HyperText Markup Language' },
    'css': { icon: '🎨', color: 'bg-blue-500', displayName: 'CSS', description: 'Cascading Style Sheets' },
    'scss': { icon: '🎨', color: 'bg-pink-500', displayName: 'SCSS', description: 'Sass CSS preprocessor' },
    'sass': { icon: '🎨', color: 'bg-pink-500', displayName: 'Sass', description: 'Syntactically Awesome StyleSheets' },
    'less': { icon: '🎨', color: 'bg-blue-500', displayName: 'LESS', description: 'Leaner Style Sheets' },

    // JavaScript & TypeScript
    'js': { icon: '💛', color: 'bg-yellow-500', displayName: 'JavaScript', description: 'JavaScript source code' },
    'jsx': { icon: '⚛️', color: 'bg-blue-500', displayName: 'React JSX', description: 'React JavaScript XML' },
    'ts': { icon: '💙', color: 'bg-blue-500', displayName: 'TypeScript', description: 'TypeScript source code' },
    'tsx': { icon: '⚛️', color: 'bg-blue-500', displayName: 'React TSX', description: 'React TypeScript XML' },
    'vue': { icon: '💚', color: 'bg-green-500', displayName: 'Vue.js', description: 'Vue.js component' },
    'svelte': { icon: '🔥', color: 'bg-orange-500', displayName: 'Svelte', description: 'Svelte component' },

    // Programming Languages
    'py': { icon: '🐍', color: 'bg-blue-500', displayName: 'Python', description: 'Python source code' },
    'java': { icon: '☕', color: 'bg-red-500', displayName: 'Java', description: 'Java source code' },
    'c': { icon: '🔧', color: 'bg-gray-500', displayName: 'C', description: 'C source code' },
    'cpp': { icon: '🔧', color: 'bg-blue-500', displayName: 'C++', description: 'C++ source code' },
    'cc': { icon: '🔧', color: 'bg-blue-500', displayName: 'C++', description: 'C++ source code' },
    'cxx': { icon: '🔧', color: 'bg-blue-500', displayName: 'C++', description: 'C++ source code' },
    'h': { icon: '🔧', color: 'bg-gray-500', displayName: 'C/C++ Header', description: 'C/C++ header file' },
    'hpp': { icon: '🔧', color: 'bg-blue-500', displayName: 'C++ Header', description: 'C++ header file' },
    'cs': { icon: '🔷', color: 'bg-purple-500', displayName: 'C#', description: 'C# source code' },
    'php': { icon: '🐘', color: 'bg-purple-500', displayName: 'PHP', description: 'PHP source code' },
    'rb': { icon: '💎', color: 'bg-red-500', displayName: 'Ruby', description: 'Ruby source code' },
    'go': { icon: '🐹', color: 'bg-blue-500', displayName: 'Go', description: 'Go source code' },
    'rs': { icon: '🦀', color: 'bg-orange-500', displayName: 'Rust', description: 'Rust source code' },
    'swift': { icon: '🍎', color: 'bg-orange-500', displayName: 'Swift', description: 'Swift source code' },
    'kt': { icon: '🎯', color: 'bg-purple-500', displayName: 'Kotlin', description: 'Kotlin source code' },
    'scala': { icon: '⚙️', color: 'bg-red-500', displayName: 'Scala', description: 'Scala source code' },

    // Data & Configuration
    'json': { icon: '📋', color: 'bg-yellow-500', displayName: 'JSON', description: 'JavaScript Object Notation' },
    'xml': { icon: '📋', color: 'bg-orange-500', displayName: 'XML', description: 'eXtensible Markup Language' },
    'yaml': { icon: '📋', color: 'bg-red-500', displayName: 'YAML', description: 'YAML Ain\'t Markup Language' },
    'yml': { icon: '📋', color: 'bg-red-500', displayName: 'YAML', description: 'YAML Ain\'t Markup Language' },
    'toml': { icon: '📋', color: 'bg-gray-500', displayName: 'TOML', description: 'Tom\'s Obvious Minimal Language' },
    'ini': { icon: '⚙️', color: 'bg-gray-500', displayName: 'INI Config', description: 'Configuration file' },
    'cfg': { icon: '⚙️', color: 'bg-gray-500', displayName: 'Config', description: 'Configuration file' },
    'conf': { icon: '⚙️', color: 'bg-gray-500', displayName: 'Config', description: 'Configuration file' },
    'env': { icon: '🔐', color: 'bg-green-500', displayName: 'Environment', description: 'Environment variables' },

    // Database
    'sql': { icon: '🗄️', color: 'bg-blue-500', displayName: 'SQL', description: 'Structured Query Language' },
    'sqlite': { icon: '🗄️', color: 'bg-blue-500', displayName: 'SQLite', description: 'SQLite database' },

    // Documentation
    'md': { icon: '📖', color: 'bg-gray-500', displayName: 'Markdown', description: 'Markdown documentation' },
    'markdown': { icon: '📖', color: 'bg-gray-500', displayName: 'Markdown', description: 'Markdown documentation' },
    'rst': { icon: '📖', color: 'bg-gray-500', displayName: 'reStructuredText', description: 'reStructuredText documentation' },
    'tex': { icon: '📖', color: 'bg-green-500', displayName: 'LaTeX', description: 'LaTeX document' },
    'readme': { icon: '📖', color: 'bg-blue-500', displayName: 'README', description: 'README file' },

    // Text Files
    'txt': { icon: '📄', color: 'bg-gray-500', displayName: 'Text File', description: 'Plain text file' },
    'rtf': { icon: '📄', color: 'bg-gray-500', displayName: 'Rich Text', description: 'Rich Text Format' },
    'log': { icon: '📜', color: 'bg-yellow-500', displayName: 'Log File', description: 'Application log file' },

    // Shell Scripts
    'sh': { icon: '⚡', color: 'bg-black', displayName: 'Shell Script', description: 'Shell script' },
    'bash': { icon: '⚡', color: 'bg-black', displayName: 'Bash Script', description: 'Bash shell script' },
    'zsh': { icon: '⚡', color: 'bg-black', displayName: 'Zsh Script', description: 'Z shell script' },
    'fish': { icon: '🐟', color: 'bg-blue-500', displayName: 'Fish Script', description: 'Fish shell script' },
    'ps1': { icon: '💙', color: 'bg-blue-500', displayName: 'PowerShell', description: 'PowerShell script' },
    'bat': { icon: '⚡', color: 'bg-gray-500', displayName: 'Batch File', description: 'Windows batch file' },
    'cmd': { icon: '⚡', color: 'bg-gray-500', displayName: 'Command File', description: 'Windows command file' },

    // Archives
    'zip': { icon: '📦', color: 'bg-yellow-500', displayName: 'ZIP Archive', description: 'ZIP compressed archive' },
    'rar': { icon: '📦', color: 'bg-red-500', displayName: 'RAR Archive', description: 'RAR compressed archive' },
    '7z': { icon: '📦', color: 'bg-gray-500', displayName: '7-Zip Archive', description: '7-Zip compressed archive' },
    'tar': { icon: '📦', color: 'bg-brown-500', displayName: 'TAR Archive', description: 'Tape archive' },
    'gz': { icon: '📦', color: 'bg-blue-500', displayName: 'GZIP Archive', description: 'GZIP compressed archive' },
    'bz2': { icon: '📦', color: 'bg-orange-500', displayName: 'BZIP2 Archive', description: 'BZIP2 compressed archive' },
    'xz': { icon: '📦', color: 'bg-purple-500', displayName: 'XZ Archive', description: 'XZ compressed archive' },

    // Video
    'mp4': { icon: '🎥', color: 'bg-red-500', displayName: 'MP4 Video', description: 'MPEG-4 video' },
    'avi': { icon: '🎥', color: 'bg-blue-500', displayName: 'AVI Video', description: 'Audio Video Interleave' },
    'mkv': { icon: '🎥', color: 'bg-green-500', displayName: 'MKV Video', description: 'Matroska video' },
    'mov': { icon: '🎥', color: 'bg-gray-500', displayName: 'QuickTime', description: 'QuickTime movie' },
    'wmv': { icon: '🎥', color: 'bg-blue-500', displayName: 'WMV Video', description: 'Windows Media Video' },
    'flv': { icon: '🎥', color: 'bg-red-500', displayName: 'Flash Video', description: 'Adobe Flash video' },
    'webm': { icon: '🎥', color: 'bg-green-500', displayName: 'WebM Video', description: 'WebM video format' },
    'm4v': { icon: '🎥', color: 'bg-gray-500', displayName: 'M4V Video', description: 'iTunes video' },

    // Audio
    'mp3': { icon: '🎵', color: 'bg-green-500', displayName: 'MP3 Audio', description: 'MPEG-3 audio' },
    'wav': { icon: '🎵', color: 'bg-blue-500', displayName: 'WAV Audio', description: 'Waveform audio' },
    'flac': { icon: '🎵', color: 'bg-purple-500', displayName: 'FLAC Audio', description: 'Free Lossless Audio Codec' },
    'aac': { icon: '🎵', color: 'bg-orange-500', displayName: 'AAC Audio', description: 'Advanced Audio Coding' },
    'ogg': { icon: '🎵', color: 'bg-red-500', displayName: 'OGG Audio', description: 'OGG Vorbis audio' },
    'wma': { icon: '🎵', color: 'bg-blue-500', displayName: 'WMA Audio', description: 'Windows Media Audio' },
    'm4a': { icon: '🎵', color: 'bg-gray-500', displayName: 'M4A Audio', description: 'MPEG-4 audio' },
    'opus': { icon: '🎵', color: 'bg-indigo-500', displayName: 'Opus Audio', description: 'Opus audio codec' },

    // Special files
    'dockerfile': { icon: '🐳', color: 'bg-blue-500', displayName: 'Dockerfile', description: 'Docker container definition' },
    'gitignore': { icon: '🔒', color: 'bg-gray-500', displayName: 'Git Ignore', description: 'Git ignore rules' },
    'license': { icon: '📜', color: 'bg-yellow-500', displayName: 'License', description: 'Software license' },
    'makefile': { icon: '🔨', color: 'bg-green-500', displayName: 'Makefile', description: 'Build automation' }
  };

  return extensionMap[extension] || {
    icon: '📄',
    color: 'bg-gray-500',
    displayName: extension.toUpperCase() || 'File',
    description: `${extension.toUpperCase()} file`
  };
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file type is supported for AI processing
 */
export function isFileProcessable(extension: string): boolean {
  const processableExtensions = [
    // Text-based files
    'txt', 'md', 'rtf', 'log',
    // Code files
    'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml', 'yaml', 'yml', 
    'py', 'java', 'c', 'cpp', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql',
    // Documents
    'pdf', 'doc', 'docx',
    // Spreadsheets
    'xls', 'xlsx', 'csv',
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'
  ];
  
  return processableExtensions.includes(extension);
}

/**
 * Get file icon emoji for display
 */
export function getFileIconEmoji(extension: string): string {
  const info = getExtensionInfo(extension);
  return info.icon;
}

/**
 * Get file color for UI
 */
export function getFileColor(extension: string): string {
  const info = getExtensionInfo(extension);
  return info.color;
}

/**
 * Client-safe file validation (without server dependencies)
 */
export function validateFile(file: { size: number; type?: string; name?: string }): { valid: boolean; error?: string; warning?: string } {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const fileName = file.name || '';
  const fileType = file.type || '';
  const extension = getFileExtension(fileName);
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Dosya çok büyük. Maksimum boyut 100MB. Bu dosya ${Math.round(file.size / 1024 / 1024)}MB.`
    };
  }
  
  // Basic file type validation
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
  
  if (!allowedExtensions.includes(extension) && !fileType.startsWith('image/')) {
    return {
      valid: false,
      error: `Bu dosya türü desteklenmiyor: ${extension || fileType}. Desteklenen türler: Resimler, PDF, Word, Excel, PowerPoint, metin dosyaları, kod dosyaları, arşivler, ses ve video dosyaları.`
    };
  }
  
  // Check if file is processable by AI
  const processableForAI = isFileProcessable(extension);
  let warning;
  
  if (!processableForAI) {
    warning = `Bu dosya türü AI tarafından okunamayabilir, ancak yine de yüklenebilir.`;
  }
  
  return { 
    valid: true, 
    warning 
  };
}
