/**
 * Bulk Node Import Parser
 * Auto-detects CSV or JSON format and parses node data
 */

export interface ParsedNodeData {
  parent: string;
  node: string;
  summary: string;
  tags: string[];
}

export interface ParseResult {
  success: boolean;
  nodes: ParsedNodeData[];
  errors: Array<{ row: number; message: string }>;
  format: 'csv' | 'json' | 'unknown';
}

/**
 * Auto-detect format and parse bulk node data
 */
export function parseBulkNodes(data: string): ParseResult {
  const trimmed = data.trim();

  // Auto-detect format
  if (trimmed.startsWith('[{') || trimmed.startsWith('[{')) {
    return parseJSON(trimmed);
  } else {
    return parseCSV(trimmed);
  }
}

/**
 * Parse JSON format
 * Expected: [{ parent, node, summary, tags }, ...]
 */
function parseJSON(data: string): ParseResult {
  try {
    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return {
        success: false,
        nodes: [],
        errors: [{ row: 0, message: 'JSON must be an array of objects' }],
        format: 'json',
      };
    }

    const nodes: ParsedNodeData[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    parsed.forEach((item, index) => {
      if (!item.parent || !item.node) {
        errors.push({
          row: index + 1,
          message: 'Missing required fields: parent or node',
        });
        return;
      }

      nodes.push({
        parent: String(item.parent).trim(),
        node: String(item.node).trim(),
        summary: item.summary ? String(item.summary).trim() : '',
        tags: parseTags(item.tags),
      });
    });

    return {
      success: nodes.length > 0,
      nodes,
      errors,
      format: 'json',
    };
  } catch (error: any) {
    return {
      success: false,
      nodes: [],
      errors: [{ row: 0, message: `JSON parse error: ${error.message}` }],
      format: 'json',
    };
  }
}

/**
 * Parse CSV format
 * Expected: parent,node,summary,tags
 * Handles quoted fields with commas
 */
function parseCSV(data: string): ParseResult {
  const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      nodes: [],
      errors: [{ row: 0, message: 'No data provided' }],
      format: 'csv',
    };
  }

  const nodes: ParsedNodeData[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  // Check if first line is header
  let startIndex = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('parent') && firstLine.includes('node')) {
    startIndex = 1; // Skip header
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const rowNumber = i + 1;

    try {
      const fields = parseCSVLine(line);

      if (fields.length < 2) {
        errors.push({
          row: rowNumber,
          message: 'Insufficient fields (need at least parent and node)',
        });
        continue;
      }

      const [parent, node, summary = '', tags = ''] = fields;

      if (!parent.trim() || !node.trim()) {
        errors.push({
          row: rowNumber,
          message: 'Parent or node name is empty',
        });
        continue;
      }

      nodes.push({
        parent: parent.trim(),
        node: node.trim(),
        summary: summary.trim(),
        tags: parseTags(tags),
      });
    } catch (error: any) {
      errors.push({
        row: rowNumber,
        message: `Parse error: ${error.message}`,
      });
    }
  }

  return {
    success: nodes.length > 0,
    nodes,
    errors,
    format: 'csv',
  };
}

/**
 * Parse a single CSV line, handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Handle escaped quotes ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  fields.push(current);

  return fields.map(f => f.trim());
}

/**
 * Parse tags from string or array
 */
function parseTags(tags: any): string[] {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags.map(t => String(t).trim()).filter(t => t.length > 0);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  return [];
}
