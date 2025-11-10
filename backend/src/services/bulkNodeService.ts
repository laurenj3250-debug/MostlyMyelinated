import Fuse from 'fuse.js';
import { PrismaClient } from '@prisma/client';
import { ParsedNodeData } from './bulkNodeParser';

const prisma = new PrismaClient();

export type MatchStatus = 'EXACT' | 'STRONG' | 'WEAK' | 'NONE';

export interface NodePreview {
  parent: string;
  node: string;
  summary: string;
  tags: string[];
  matchStatus: MatchStatus;
  matchedNode?: {
    id: string;
    name: string;
    similarity: number;
    parentName?: string; // Parent of the matched node
  };
  willCreateParent: boolean;
  parentId?: string; // If parent exists
  parentMismatch?: boolean; // If matched node has different parent
}

export interface ParentPreview {
  name: string;
  exists: boolean;
  nodeId?: string;
}

export interface BulkPreviewResult {
  nodes: NodePreview[];
  parents: ParentPreview[];
  stats: {
    total: number;
    willCreate: number;
    willSkip: number;
    newParents: number;
  };
}

/**
 * Generate preview for bulk node import
 * Detects duplicates and determines which parents need to be created
 */
export async function previewBulkImport(
  userId: string,
  parsedNodes: ParsedNodeData[]
): Promise<BulkPreviewResult> {
  // Fetch all existing nodes for this user (with parent info for mismatch detection)
  const existingNodes = await prisma.node.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      parentId: true,
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Create Fuse instance for fuzzy matching
  const fuseOptions = {
    keys: ['name'],
    threshold: 0.3, // 0 = exact, 1 = match anything
    distance: 100,
    includeScore: true,
  };

  const fuse = new Fuse(existingNodes, fuseOptions);

  // Build map of existing parent names
  const parentMap = new Map<string, string>(); // name -> id
  existingNodes.forEach(node => {
    parentMap.set(node.name.toLowerCase(), node.id);
  });

  // Track which parents will need to be created
  const parentsToCreate = new Set<string>();
  const uniqueParents = new Set(parsedNodes.map(n => n.parent.toLowerCase()));

  uniqueParents.forEach(parentName => {
    if (!parentMap.has(parentName)) {
      parentsToCreate.add(parentName);
    }
  });

  // Generate preview for each node
  const previews: NodePreview[] = parsedNodes.map(parsed => {
    // Find fuzzy matches
    const matches = fuse.search(parsed.node);
    const topMatch = matches[0];

    let matchStatus: MatchStatus = 'NONE';
    let matchedNode: NodePreview['matchedNode'] = undefined;

    if (topMatch) {
      const score = topMatch.score!;
      const similarity = (1 - score) * 100; // Convert to percentage

      if (score === 0) {
        // Exact match
        matchStatus = 'EXACT';
      } else if (score <= 0.15) {
        // Strong match (85%+ similar)
        matchStatus = 'STRONG';
      } else if (score <= 0.3) {
        // Weak match (70%+ similar)
        matchStatus = 'WEAK';
      }

      if (matchStatus !== 'NONE') {
        matchedNode = {
          id: topMatch.item.id,
          name: topMatch.item.name,
          similarity: Math.round(similarity),
          parentName: topMatch.item.parent?.name,
        };
      }
    }

    // Check if parent exists or needs to be created
    const parentLower = parsed.parent.toLowerCase();
    const willCreateParent = parentsToCreate.has(parentLower);
    const parentId = parentMap.get(parentLower);

    // Detect parent mismatch for STRONG matches
    let parentMismatch = false;
    if (matchStatus === 'STRONG' && matchedNode?.parentName) {
      // Compare parent names (case-insensitive)
      parentMismatch = matchedNode.parentName.toLowerCase() !== parentLower;
    }

    return {
      parent: parsed.parent,
      node: parsed.node,
      summary: parsed.summary,
      tags: parsed.tags,
      matchStatus,
      matchedNode,
      willCreateParent,
      parentId,
      parentMismatch,
    };
  });

  // Calculate stats
  const willSkip = previews.filter(p => p.matchStatus === 'EXACT').length;
  const willCreate = previews.length - willSkip;

  // Build parent preview array
  const parentPreviews: ParentPreview[] = Array.from(uniqueParents).map(parentName => {
    const existingParentId = parentMap.get(parentName);
    return {
      name: parentName,
      exists: !!existingParentId,
      nodeId: existingParentId,
    };
  });

  return {
    nodes: previews,
    parents: parentPreviews,
    stats: {
      total: previews.length,
      willCreate,
      willSkip,
      newParents: parentsToCreate.size,
    },
  };
}

export interface BulkCreateInput {
  parent: string;
  node: string;
  summary: string;
  tags: string[];
  forceCreate: boolean; // If true, create even if duplicate
}

export interface BulkMergeInput {
  nodeId: string;
  summary?: string;
  tags?: string[];
}

export interface BulkCreateResult {
  created: number;
  skipped: number;
  parentsCreated: number;
  merged: number;
  nodeIds: string[];
}

/**
 * Execute bulk node creation with transaction
 * Creates parents first, then nodes, then merges
 */
export async function executeBulkCreate(
  userId: string,
  nodes: BulkCreateInput[],
  merges: BulkMergeInput[],
  autoCreateParents: boolean
): Promise<BulkCreateResult> {
  return await prisma.$transaction(async (tx) => {
    let parentsCreated = 0;
    let created = 0;
    let skipped = 0;
    let merged = 0;
    const nodeIds: string[] = [];

    // Step 1: Fetch existing nodes to check for exact duplicates
    const existingNodes = await tx.node.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const existingNameMap = new Map<string, string>(); // lowercase name -> id
    existingNodes.forEach(node => {
      existingNameMap.set(node.name.toLowerCase(), node.id);
    });

    // Step 2: Identify unique parents and create missing ones
    const parentMap = new Map<string, string>(); // parent name -> parent id

    // First, map existing parents
    existingNodes.forEach(node => {
      parentMap.set(node.name.toLowerCase(), node.id);
    });

    if (autoCreateParents) {
      const uniqueParents = new Set(nodes.map(n => n.parent));

      for (const parentName of uniqueParents) {
        const parentLower = parentName.toLowerCase();

        if (!parentMap.has(parentLower)) {
          // Create new parent node
          const newParent = await tx.node.create({
            data: {
              userId,
              name: parentName,
              summary: '', // Empty summary for auto-created parents
              tags: [],
              nodeStrength: 0, // New nodes start at 0
            },
          });

          parentMap.set(parentLower, newParent.id);
          parentsCreated++;
        }
      }
    }

    // Step 3: Create nodes
    for (const nodeData of nodes) {
      const nodeLower = nodeData.node.toLowerCase();

      // Skip exact duplicates unless forceCreate is true
      if (!nodeData.forceCreate && existingNameMap.has(nodeLower)) {
        skipped++;
        continue;
      }

      // Get parent ID
      const parentId = parentMap.get(nodeData.parent.toLowerCase());

      if (!parentId && autoCreateParents) {
        // This shouldn't happen if parents were created above, but safety check
        console.warn(`Parent "${nodeData.parent}" not found and auto-create failed`);
        skipped++;
        continue;
      }

      // Create the node
      const newNode = await tx.node.create({
        data: {
          userId,
          name: nodeData.node,
          summary: nodeData.summary || '',
          parentId: parentId || null,
          tags: nodeData.tags,
          nodeStrength: 0, // New nodes start at 0 (brain-dead until cards exist)
        },
      });

      nodeIds.push(newNode.id);
      created++;
    }

    // Step 4: Merge existing nodes
    for (const mergeData of merges || []) {
      await tx.node.update({
        where: { id: mergeData.nodeId, userId }, // Security: ensure userId matches
        data: {
          summary: mergeData.summary || undefined,
          tags: mergeData.tags || undefined,
        },
      });
      merged++;
    }

    return {
      created,
      skipped,
      parentsCreated,
      merged,
      nodeIds,
    };
  });
}
