import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('OpenGraph')
@Controller('og')
export class OgController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Generate dynamic 1200x630 OpenGraph / Twitter Card image (SVG)' })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'author', required: false, type: String })
  @ApiQuery({ name: 'readingTime', required: false, type: String })
  generateOgImage(
    @Query('title') rawTitle: string = 'Technical Engineering & Distributed Systems',
    @Query('category') rawCategory: string = 'SYSTEM DESIGN',
    @Query('author') rawAuthor: string = 'Nexus Staff',
    @Query('readingTime') rawReadingTime: string = '10',
    @Res() res: Response,
  ) {
    const title = this.escapeXml(rawTitle?.trim() || 'Technical Engineering & Distributed Systems');
    const category = this.escapeXml(rawCategory?.trim().toUpperCase() || 'SYSTEM DESIGN');
    const author = this.escapeXml(rawAuthor?.trim() || 'Nexus Staff');
    const readingTime = parseInt(rawReadingTime, 10) || 10;

    // Word wrap title into lines
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= 38) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    const displayLines = lines.slice(0, 3);
    if (lines.length > 3) {
      displayLines[2] = displayLines[2] + '...';
    }

    const titleFontSize = displayLines.length === 1 ? 50 : displayLines.length === 2 ? 44 : 38;
    const titleLineHeight = titleFontSize * 1.25;
    const startY = 270 - ((displayLines.length - 1) * titleLineHeight) / 2;

    const tspanElements = displayLines
      .map((line, i) => `<tspan x="80" y="${Math.round(startY + i * titleLineHeight)}">${line}</tspan>`)
      .join('\n    ');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="50%" stop-color="#111115" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>

    <!-- Glow Gradient -->
    <radialGradient id="glow" cx="85%" cy="15%" r="60%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18" />
      <stop offset="50%" stop-color="#1d4ed8" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#09090b" stop-opacity="0" />
    </radialGradient>

    <!-- Accent Gradient -->
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <!-- Dot Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1.2" fill="#27272a" opacity="0.6" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <rect width="1200" height="630" fill="url(#grid)" />

  <!-- Outer Border -->
  <rect x="20" y="20" width="1160" height="590" rx="24" fill="none" stroke="#27272a" stroke-width="2" />

  <!-- Top Navigation / Branding Header -->
  <g transform="translate(80, 75)">
    <!-- Logo Icon -->
    <rect width="44" height="44" rx="12" fill="url(#primaryGrad)" />
    <text x="22" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">N</text>

    <!-- Brand Name -->
    <text x="58" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff" letter-spacing="-0.5">NexusNation.in</text>

    <!-- Category Pill Badge -->
    <g transform="translate(800, 2)">
      <rect width="240" height="38" rx="10" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6" stroke-width="1.5" stroke-opacity="0.4" />
      <text x="120" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#60a5fa" text-anchor="middle" letter-spacing="1">${category}</text>
    </g>
  </g>

  <!-- Main Article Title -->
  <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${titleFontSize}" font-weight="900" fill="#ffffff" letter-spacing="-1">
    ${tspanElements}
  </text>

  <!-- Bottom Divider Line -->
  <line x1="80" y1="490" x2="1120" y2="490" stroke="#27272a" stroke-width="1.5" />

  <!-- Footer Metadata -->
  <g transform="translate(80, 535)">
    <!-- Author Persona -->
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#f4f4f5">
      ${author}
    </text>
    <text x="${Math.max(author.length * 11 + 25, 160)}" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#71717a">
      •  Architectural Reference &amp; Blueprint
    </text>

    <!-- Reading Time & Publication Meta -->
    <g transform="translate(1040, 0)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="600" fill="#60a5fa" text-anchor="end">
        ~${readingTime} min read  •  Nexus Technical Publishing
      </text>
    </g>
  </g>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(svg);
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
