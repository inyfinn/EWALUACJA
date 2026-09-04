import { OverallEvaluationSummary } from './evaluationNarratives';

/**
 * Helper to wrap text cleanly on HTML5 2D Canvas
 */
function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draws rounded rectangle on 2D context
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor?: string,
  strokeColor?: string,
  lineWidth = 1
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Generates an ultra-crisp, self-contained, 100% native HTML5 Canvas
 * containing the entire evaluation summary.
 * No external CSS or DOM dependencies.
 */
export function generateSummaryCanvas(
  summary: OverallEvaluationSummary,
  tokenUsed: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1100;
  // Estimated height calculation
  const height = 1750;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Main white card container
  const pad = 36;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  drawRoundedRect(ctx, pad, pad, cardW, cardH, 24, '#ffffff', '#e2e8f0', 2);

  let currentY = pad + 40;
  const contentX = pad + 40;
  const contentW = cardW - 80;

  // --- HEADER ---
  // Pill badge
  drawRoundedRect(ctx, contentX, currentY, 190, 26, 6, '#0f172a');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('KOPIA EWALUACJI 360', contentX + 16, currentY + 17);

  // Company tag right
  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Kubara Sp. z o.o.', contentX + contentW, currentY + 18);
  ctx.textAlign = 'left';

  currentY += 46;

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('Podsumowanie oceny pracownika: Krzysztof Wieczorek', contentX, currentY);

  currentY += 26;

  // Subtitle (token & date)
  ctx.fillStyle = '#64748b';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  const today = new Date().toLocaleDateString('pl-PL');
  ctx.fillText(`Kod ankiety: ${tokenUsed || 'ANONIM'}  •  Data sporządzenia: ${today}`, contentX, currentY);

  currentY += 24;

  // Divider
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, currentY);
  ctx.lineTo(contentX + contentW, currentY);
  ctx.stroke();

  currentY += 28;

  // --- COMPARISON MODULE (NA TLE ZESPOŁU) ---
  drawRoundedRect(ctx, contentX, currentY, contentW, 140, 16, '#f1f5f9', '#e2e8f0', 1);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  const compTitle = summary.isFirstSubmission
    ? 'Status w grupie: Przecierasz szlaki!'
    : 'Jak Twoje odpowiedzi wypadają na tle innych współpracowników?';
  ctx.fillText(compTitle, contentX + 24, currentY + 30);

  if (summary.isFirstSubmission) {
    ctx.fillStyle = '#475569';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText('Nikt jeszcze nie wypełnił ankiety – Twoja ocena przeciera szlaki i stanowi pierwszy punkt odniesienia.', contentX + 24, currentY + 65);
    ctx.fillText('Kolejni ankietowani będą zestawiani ze średnią uwzględniającą Twój głos.', contentX + 24, currentY + 88);
  } else {
    // 3 Sub-tiles
    const tileW = (contentW - 48 - 24) / 3;
    const tileH = 80;
    const tileY = currentY + 44;

    // Tile 1: Przychylność
    const t1X = contentX + 24;
    drawRoundedRect(ctx, t1X, tileY, tileW, tileH, 10, '#ffffff', '#e2e8f0', 1);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('PRZYCHYLNOŚĆ OCEN', t1X + 14, tileY + 22);

    ctx.fillStyle = summary.favourabilityDiffPercent >= 0 ? '#059669' : '#d97706';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    const favText = summary.favourabilityDiffPercent > 0
      ? `o ${summary.favourabilityDiffPercent}% wyższa`
      : summary.favourabilityDiffPercent < 0
      ? `o ${Math.abs(summary.favourabilityDiffPercent)}% bardziej surowa`
      : 'zgodna ze średnią';
    ctx.fillText(favText, t1X + 14, tileY + 44);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Względem średniej grupy', t1X + 14, tileY + 62);

    // Tile 2: Krytyczność i uwagi
    const t2X = t1X + tileW + 12;
    drawRoundedRect(ctx, t2X, tileY, tileW, tileH, 10, '#ffffff', '#e2e8f0', 1);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('KRYTYCZNOŚĆ I UWAGI', t2X + 14, tileY + 22);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    let critText = 'zgodnie ze średnią';
    if (summary.userNegativeDiffCount > 0) {
      critText = `+${summary.userNegativeDiffCount} uwag do poprawy`;
    } else if (summary.userNegativeDiffCount < 0) {
      critText = `-${Math.abs(summary.userNegativeDiffCount)} mniej uwag`;
    }
    ctx.fillText(critText, t2X + 14, tileY + 44);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Wskazano: ${summary.userNegativeCount} (śr. ${summary.groupAvgNegativeCount})`, t2X + 14, tileY + 62);

    // Tile 3: Nota średnia
    const t3X = t2X + tileW + 12;
    drawRoundedRect(ctx, t3X, tileY, tileW, tileH, 10, '#ffffff', '#e2e8f0', 1);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('TWOJA ŚREDNIA', t3X + 14, tileY + 22);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${summary.userAverageScore} / 11.0 pkt`, t3X + 14, tileY + 44);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Suma: ${summary.userTotalScore} na 132 pkt`, t3X + 14, tileY + 62);
  }

  currentY += 158;

  // --- OVERALL VERDICT CARD ---
  drawRoundedRect(ctx, contentX, currentY, contentW, 110, 16, '#ffffff', '#cbd5e1', 1.5);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`OCENA OGÓLNA (WYNIK: ${summary.userTotalScore} / 132 PKT)`, contentX + 24, currentY + 24);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${summary.overallVerdictTitle}`, contentX + 24, currentY + 48);

  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  const verdictLines = wrapTextLines(ctx, summary.overallVerdictText, contentW - 48);
  verdictLines.slice(0, 2).forEach((line, idx) => {
    ctx.fillText(line, contentX + 24, currentY + 74 + idx * 18);
  });

  currentY += 128;

  // --- CAŁOŚCIOWY PORTRET WSPÓŁPRACY ---
  // (Notice: user requested removing "(syntetyczny obraz...)")
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 15px system-ui, -apple-system, sans-serif';
  ctx.fillText('Całościowy portret współpracy', contentX, currentY + 12);

  currentY += 26;

  // Quote box
  const quoteLines = wrapTextLines(ctx, `„${summary.cohesiveStory}”`, contentW - 40);
  const quoteBoxH = Math.max(90, quoteLines.length * 20 + 28);
  drawRoundedRect(ctx, contentX, currentY, contentW, quoteBoxH, 12, '#f8fafc', '#e2e8f0', 1);

  // Left indigo accent line
  ctx.fillStyle = '#4f46e5';
  ctx.fillRect(contentX, currentY, 5, quoteBoxH);

  ctx.fillStyle = '#334155';
  ctx.font = 'italic 13px system-ui, -apple-system, sans-serif';
  quoteLines.forEach((line, idx) => {
    ctx.fillText(line, contentX + 20, currentY + 24 + idx * 20);
  });

  currentY += quoteBoxH + 26;

  // --- 4 DETAILED CATEGORIES ---
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 15px system-ui, -apple-system, sans-serif';
  ctx.fillText('Szczegółowe podsumowanie w 4 kategoriach (poziom od 1 do 11)', contentX, currentY + 10);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Skala: 3–33 pkt na kategorię', contentX + contentW, currentY + 10);
  ctx.textAlign = 'left';

  currentY += 24;

  // Render 4 dimension cards (2 columns x 2 rows)
  const dimColW = (contentW - 16) / 2;
  const dimCardH = 150;

  summary.dimensions.forEach((dim, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const dX = contentX + col * (dimColW + 16);
    const dY = currentY + row * (dimCardH + 16);

    // Card background
    drawRoundedRect(ctx, dX, dY, dimColW, dimCardH, 12, '#ffffff', '#e2e8f0', 1);

    // Title & Score
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(dim.title, dX + 16, dY + 26);

    // Score badge
    const badgeText = `${dim.score}/33 pkt (Poz. ${dim.level}/11)`;
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    const bW = ctx.measureText(badgeText).width + 16;
    drawRoundedRect(ctx, dX + dimColW - bW - 16, dY + 12, bW, 20, 10, '#f1f5f9', '#cbd5e1', 1);
    ctx.fillStyle = '#334155';
    ctx.fillText(badgeText, dX + dimColW - bW - 8, dY + 26);

    // Progress Bar
    const barW = dimColW - 32;
    drawRoundedRect(ctx, dX + 16, dY + 38, barW, 6, 3, '#e2e8f0');
    const fillPercent = Math.max(0.05, (dim.score - 3) / 30);
    drawRoundedRect(ctx, dX + 16, dY + 38, barW * fillPercent, 6, 3, '#4f46e5');

    // Level Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(dim.levelTitle, dX + 16, dY + 62);

    // Description lines
    ctx.fillStyle = '#475569';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    const dimLines = wrapTextLines(ctx, dim.sentences, dimColW - 32);
    dimLines.slice(0, 4).forEach((l, idx) => {
      ctx.fillText(l, dX + 16, dY + 80 + idx * 17);
    });
  });

  currentY += (dimCardH + 16) * 2 + 10;

  // --- FOOTER ---
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(contentX, currentY);
  ctx.lineTo(contentX + contentW, currentY);
  ctx.stroke();

  currentY += 20;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText('Kubara Sp. z o.o. • Roczna Ewaluacja Pracownicza 360', contentX, currentY);

  ctx.textAlign = 'right';
  ctx.fillText('Dokument wygenerowany automatycznie w systemie', contentX + contentW, currentY);
  ctx.textAlign = 'left';

  return canvas;
}
