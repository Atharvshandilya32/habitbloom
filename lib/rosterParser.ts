import { ref, set } from 'firebase/database';
import { database } from './firebase';
import { RosterEntry } from './identityTypes';
import { logAuditEvent } from './auditLogger';

export interface ParsedRosterResult {
  total: number;
  entries: RosterEntry[];
  errors: string[];
}

/**
 * Sanitizes CSV cell content against CSV Formula Injection vulnerabilities
 */
export function sanitizeCSVCell(val: string): string {
  if (!val) return '';
  let clean = val.trim().replace(/^["']|["']$/g, '');
  // Strip leading formula injection characters
  while (clean.length > 0 && ['=', '+', '-', '@', '\t', '\r'].includes(clean[0])) {
    clean = clean.substring(1).trim();
  }
  return clean;
}

/**
 * Parses raw CSV text into RosterEntries
 */
export function parseCSVText(csvText: string): ParsedRosterResult {
  const errors: string[] = [];
  
  // File size guard (max 2MB raw text)
  if (csvText.length > 2 * 1024 * 1024) {
    return { total: 0, entries: [], errors: ['File size exceeds 2MB limit.'] };
  }

  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { total: 0, entries: [], errors: ['File is empty.'] };
  }

  if (lines.length > 5001) {
    errors.push('File contains over 5,000 rows. Only the first 5,000 rows were parsed.');
  }

  // Detect header row
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  
  // Find column indices
  let idIdx = headers.findIndex(h => h.includes('id') || h.includes('admission') || h.includes('roll') || h.includes('employee') || h.includes('member'));
  let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student') || h.includes('employee') || h.includes('member'));
  const emailIdx = headers.findIndex(h => h.includes('email'));
  const roleIdx = headers.findIndex(h => h.includes('role'));

  if (idIdx === -1) idIdx = 0; // Fallback to 1st column
  if (nameIdx === -1) nameIdx = 1 < headers.length ? 1 : 0; // Fallback to 2nd column

  const entries: RosterEntry[] = [];
  const seenIds = new Set<string>();
  const now = new Date().toISOString();

  const maxRows = Math.min(lines.length, 5001);
  for (let i = 1; i < maxRows; i++) {
    const cols = lines[i].split(',').map(c => sanitizeCSVCell(c));
    if (cols.length < 1 || !cols[idIdx]) continue;

    const rawId = cols[idIdx];
    const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').toUpperCase();
    if (!cleanId) continue;

    if (seenIds.has(cleanId)) {
      errors.push(`Skipped duplicate ID in file: ${cleanId}`);
      continue;
    }
    seenIds.add(cleanId);

    const name = cols[nameIdx] || `Member ${cleanId}`;
    const email = emailIdx !== -1 ? cols[emailIdx] : undefined;
    const roleId = roleIdx !== -1 ? cols[roleIdx] : undefined;

    // Collect secondary fields
    const secondaryData: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (idx !== idIdx && idx !== nameIdx && idx !== emailIdx && idx !== roleIdx && cols[idx]) {
        secondaryData[sanitizeCSVCell(h)] = cols[idx];
      }
    });

    entries.push({
      id: cleanId,
      name,
      email,
      roleId,
      secondaryData: Object.keys(secondaryData).length > 0 ? secondaryData : undefined,
      createdAt: now,
    });
  }

  return { total: entries.length, entries, errors };
}

/**
 * Uploads parsed roster entries directly into Firebase Realtime Database
 */
export async function uploadRosterToSpace(
  spaceId: string,
  entries: RosterEntry[],
  actor: { id: string; name: string }
): Promise<boolean> {
  if (!database || !spaceId || entries.length === 0) return false;

  try {
    for (const entry of entries) {
      await set(ref(database, `spaceRosters/${spaceId}/${entry.id}`), entry);
    }

    await logAuditEvent(
      spaceId,
      actor,
      { id: 'ROSTER', name: 'Organization Roster' },
      'ROSTER_UPLOAD',
      `Uploaded ${entries.length} roster entries`
    );

    return true;
  } catch (error) {
    console.warn('Failed to upload roster to space:', error);
    return false;
  }
}
