import { SurveyResponse } from '../types';

export const TRANSFER_FORMAT = 'kubara-ewaluacja-360';
export const TRANSFER_VERSION = 1;
export const TRANSFER_MARKER = 'KW360JSON:';

export interface SurveyTransferPackage {
  format: typeof TRANSFER_FORMAT;
  version: number;
  exportedAt: string;
  source: 'completion' | 'admin-export' | 'file-import';
  response: SurveyResponse;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  return b;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  b[2] = (n >>> 16) & 0xff;
  b[3] = (n >>> 24) & 0xff;
  return b;
}

/** ZIP store (no compression) so PDF+JSON stay in one importable file. */
export function zipStoreFiles(files: { name: string; data: Uint8Array }[]): Blob {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const local = concatBytes([
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      file.data,
    ]);
    const central = concatBytes([
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes,
    ]);
    localParts.push(local);
    centralParts.push(central);
    offset += local.length;
  }

  const centralDir = concatBytes(centralParts);
  const end = concatBytes([
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);

  return new Blob([concatBytes([...localParts, centralDir, end])], { type: 'application/zip' });
}

export function buildTransferPackage(response: SurveyResponse, source: SurveyTransferPackage['source'] = 'completion'): SurveyTransferPackage {
  return {
    format: TRANSFER_FORMAT,
    version: TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    source,
    response: { ...response },
  };
}

export function transferPackageToJson(pkg: SurveyTransferPackage): string {
  return JSON.stringify(pkg, null, 2);
}

export function transferMarkerPayload(pkg: SurveyTransferPackage): string {
  const json = JSON.stringify(pkg);
  return TRANSFER_MARKER + btoa(unescape(encodeURIComponent(json)));
}

function looksLikeResponse(value: unknown): value is SurveyResponse {
  if (!value || typeof value !== 'object') return false;
  const rec = value as Record<string, unknown>;
  return typeof rec.tokenUsed === 'string' && rec.answers !== undefined && typeof rec.answers === 'object';
}

function normalizeResponse(raw: SurveyResponse): SurveyResponse {
  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : (crypto.randomUUID ? crypto.randomUUID() : `import_${Date.now()}`),
    createdAt: raw.createdAt || new Date().toISOString(),
    tokenUsed: String(raw.tokenUsed || 'IMPORT').trim().toUpperCase(),
    answers: raw.answers || {},
    selectedFactors: raw.selectedFactors || {},
    dimensionComments: raw.dimensionComments || {},
    collaborationContext: raw.collaborationContext || '',
    teamRelation: raw.teamRelation || '',
    excludedFromReport: Boolean(raw.excludedFromReport),
  };
}

function parseJsonCandidate(text: string): SurveyResponse | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const tryParse = (candidate: string): SurveyResponse | null => {
    try {
      const data = JSON.parse(candidate);
      if (data && data.format === TRANSFER_FORMAT && looksLikeResponse(data.response)) {
        return normalizeResponse(data.response);
      }
      if (looksLikeResponse(data)) {
        return normalizeResponse(data);
      }
      if (data && looksLikeResponse(data.response)) {
        return normalizeResponse(data.response);
      }
      if (Array.isArray(data) && data.length && looksLikeResponse(data[0])) {
        return normalizeResponse(data[0]);
      }
    } catch {
      return null;
    }
    return null;
  };

  const direct = tryParse(trimmed);
  if (direct) return direct;

  const markerMatch = trimmed.match(/KW360JSON:([A-Za-z0-9+/=]+)/);
  if (markerMatch) {
    try {
      const decoded = decodeURIComponent(escape(atob(markerMatch[1])));
      const fromMarker = tryParse(decoded);
      if (fromMarker) return fromMarker;
    } catch {
      // continue
    }
  }

  const start = trimmed.indexOf('{"format"');
  if (start >= 0) {
    const sliced = trimmed.slice(start);
    const lastBrace = sliced.lastIndexOf('}');
    if (lastBrace > 0) {
      const fromSlice = tryParse(sliced.slice(0, lastBrace + 1));
      if (fromSlice) return fromSlice;
    }
  }

  return null;
}

function extractZipFiles(buffer: ArrayBuffer): { name: string; data: Uint8Array }[] {
  const bytes = new Uint8Array(buffer);
  const files: { name: string; data: Uint8Array }[] = [];
  let i = 0;
  const view = new DataView(buffer);

  while (i + 30 <= bytes.length) {
    if (view.getUint32(i, true) !== 0x04034b50) break;
    const nameLen = view.getUint16(i + 26, true);
    const extraLen = view.getUint16(i + 28, true);
    const method = view.getUint16(i + 8, true);
    let compSize = view.getUint32(i + 18, true);
    const flags = view.getUint16(i + 6, true);
    const nameStart = i + 30;
    const name = new TextDecoder().decode(bytes.slice(nameStart, nameStart + nameLen));
    let dataStart = nameStart + nameLen + extraLen;
    if (flags & 0x08) {
      // data descriptor; scan for next header is unreliable — skip descriptor zips
      return files;
    }
    const data = bytes.slice(dataStart, dataStart + compSize);
    if (method === 0) {
      files.push({ name, data });
    }
    i = dataStart + compSize;
  }
  return files;
}

export async function parseSurveyFile(file: File): Promise<SurveyResponse> {
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (name.endsWith('.zip')) {
    const files = extractZipFiles(buffer);
    const jsonFile = files.find(f => /\.(json|kw360\.json|txt)$/i.test(f.name)) || files[0];
    if (!jsonFile) {
      throw new Error('Archiwum ZIP nie zawiera pliku JSON z wynikiem ankiety.');
    }
    const text = new TextDecoder().decode(jsonFile.data);
    const parsed = parseJsonCandidate(text);
    if (!parsed) throw new Error('Nie udało się odczytać JSON z archiwum ZIP.');
    return parsed;
  }

  const asText = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  const parsed = parseJsonCandidate(asText);
  if (parsed) return parsed;

  // PDF/JPG often still contain the KW360JSON marker as literal bytes
  const latin1 = Array.from(new Uint8Array(buffer), b => String.fromCharCode(b)).join('');
  const fromBinary = parseJsonCandidate(latin1);
  if (fromBinary) return fromBinary;

  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) {
    throw new Error('JPG/PNG to kopia podglądowa. Do importu użyj pliku .kw360.json albo pakietu ZIP z tego samego eksportu.');
  }

  throw new Error('Nie rozpoznano formatu. Wgraj plik .kw360.json, .json albo ZIP z pakietu eksportu.');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1500);
}

export function exportFilename(ext: string, tokenUsed?: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const token = (tokenUsed || 'ANKIETA').replace(/[^A-Z0-9-]/gi, '');
  return `Ewaluacja_KW_${token}_${day}.${ext}`;
}
