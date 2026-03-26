/**
 * Sanitizes text by removing markdown and special characters
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text) return '';
  
  let sanitized = text;
  
  // Remove markdown headers (##, ###, ####, etc.)
  sanitized = sanitized.replace(/^#{1,6}\s+/gm, '');
  
  // Remove bold (**) and italic (*)
  sanitized = sanitized.replace(/\*\*(.+?)\*\*/g, '$1');
  sanitized = sanitized.replace(/\*(.+?)\*/g, '$1');
  
  // Remove code blocks (```)
  sanitized = sanitized.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code (`)
  sanitized = sanitized.replace(/`(.+?)`/g, '$1');
  
  // Remove blockquotes (>)
  sanitized = sanitized.replace(/^>\s+/gm, '');
  
  // Remove horizontal rules (---, ***, ___)
  sanitized = sanitized.replace(/^[-*_]{3,}$/gm, '');
  
  // Remove markdown links [text](url)
  sanitized = sanitized.replace(/\[(.+?)\]\(.+?\)/g, '$1');
  
  // Remove markdown images ![alt](url)
  sanitized = sanitized.replace(/!\[(.+?)\]\(.+?\)/g, '');
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove multiple consecutive newlines
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}