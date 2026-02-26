import React, { useRef, useEffect } from "react";

export default function CoverCompositor({ 
  type = "front", 
  backgroundUrl, 
  title, 
  subtitle,
  authorName,
  bookSummary,
  authorBio,
  authorPhotoUrl,
  category
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!backgroundUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Standard book cover dimensions (6x9 inches at 300 DPI)
    const width = 1800;
    const height = 2700;
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundUrl;
    
    img.onload = () => {
      // Draw background
      ctx.drawImage(img, 0, 0, width, height);

      if (type === "front") {
        drawFrontCover(ctx, width, height);
      } else {
        drawBackCover(ctx, width, height);
      }
    };
  }, [backgroundUrl, title, subtitle, authorName, type, bookSummary, authorBio, authorPhotoUrl, category]);

  const drawFrontCover = (ctx, width, height) => {
    // Add semi-transparent overlay at top for better text contrast
    const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.4);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height * 0.4);

    // Title - Professional typography
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Calculate font size based on title length
    const titleLength = title?.length || 0;
    let titleFontSize = titleLength > 30 ? 120 : titleLength > 20 ? 140 : 160;
    ctx.font = `bold ${titleFontSize}px "Georgia", serif`;
    
    // Word wrap for title
    const maxWidth = width * 0.85;
    const words = (title || "").toUpperCase().split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Draw title lines
    const lineHeight = titleFontSize * 1.2;
    const startY = height * 0.15;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });

    // Subtitle
    if (subtitle) {
      ctx.font = `italic 60px "Georgia", serif`;
      ctx.fillText(subtitle, width / 2, startY + (lines.length * lineHeight) + 80);
    }

    // Author name at bottom with elegant styling
    const bottomGradient = ctx.createLinearGradient(0, height * 0.8, 0, height);
    bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, height * 0.8, width, height * 0.2);

    ctx.fillStyle = '#F5CE62';
    ctx.font = 'bold 70px "Georgia", serif';
    ctx.fillText(`BY ${(authorName || "").toUpperCase()}`, width / 2, height - 120);

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const drawBackCover = (ctx, width, height) => {
    // Summary section with better contrast
    const summaryBoxY = height * 0.25;
    const summaryBoxHeight = height * 0.35;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(width * 0.1, summaryBoxY, width * 0.8, summaryBoxHeight);
    
    // Summary text
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '36px "Georgia", serif';
    ctx.textAlign = 'left';
    
    const summaryLines = wrapText(ctx, bookSummary || "Book summary goes here...", width * 0.7);
    const summaryLineHeight = 50;
    summaryLines.slice(0, 10).forEach((line, i) => {
      ctx.fillText(line, width * 0.15, summaryBoxY + 80 + (i * summaryLineHeight));
    });

    // Author bio section
    if (authorBio) {
      const bioBoxY = height * 0.62;
      const bioBoxHeight = height * 0.18;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(width * 0.1, bioBoxY, width * 0.8, bioBoxHeight);
      
      // Author photo circle
      if (authorPhotoUrl) {
        const photoX = width * 0.2;
        const photoY = bioBoxY + bioBoxHeight / 2;
        const photoRadius = 80;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        const authorImg = new Image();
        authorImg.crossOrigin = "anonymous";
        authorImg.src = authorPhotoUrl;
        authorImg.onload = () => {
          ctx.drawImage(authorImg, photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
        };
        ctx.restore();
      }
      
      // Bio text
      ctx.fillStyle = '#1a1a1a';
      ctx.font = '28px "Georgia", serif';
      const bioLines = wrapText(ctx, authorBio || "", width * 0.48);
      const bioLineHeight = 38;
      bioLines.slice(0, 5).forEach((line, i) => {
        ctx.fillText(line, width * 0.35, bioBoxY + 50 + (i * bioLineHeight));
      });
    }

    // Barcode at bottom right
    drawBarcode(ctx, width - 320, height - 180, 280, 140);

    // Category badge at top
    if (category) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(width * 0.1, 40, 300, 60);
      ctx.fillStyle = '#F5CE62';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(category.toUpperCase(), width * 0.1 + 20, 80);
    }
  };

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());
    return lines;
  };

  const drawBarcode = (ctx, x, y, width, height) => {
    // Draw white background for barcode
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, width, height);
    
    // Draw simple barcode pattern
    ctx.fillStyle = '#000000';
    const barWidth = width / 50;
    for (let i = 0; i < 50; i++) {
      if (Math.random() > 0.4) {
        ctx.fillRect(x + (i * barWidth), y + 10, barWidth * 0.8, height - 40);
      }
    }
    
    // ISBN number
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ISBN 978-0-XXX-XXXXX-X', x + width / 2, y + height - 10);
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-cover rounded-lg"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}