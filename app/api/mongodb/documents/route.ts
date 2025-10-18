/**
 * API Route: CRUD operations for documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { findDocuments, insertDocument, updateDocument, deleteDocument } from '@/services/mongodb';
import { ObjectId } from 'mongodb';

// Helper function to convert _id strings to ObjectId
function convertIdFilter(filter: any): any {
  if (!filter || typeof filter !== 'object') return filter;

  const converted = { ...filter };

  // Handle _id field specifically
  if (converted._id && typeof converted._id === 'string') {
    try {
      // Try to convert string to ObjectId
      converted._id = new ObjectId(converted._id);
    } catch (error) {
      // If conversion fails, leave as string (in case it's a custom _id)
    }
  }

  // Recursively handle nested objects
  for (const key in converted) {
    if (typeof converted[key] === 'object' && converted[key] !== null && !(converted[key] instanceof ObjectId)) {
      converted[key] = convertIdFilter(converted[key]);
    }
  }

  return converted;
}

// GET/POST documents (find/query)
export async function POST(request: NextRequest) {
  try {
    const { uri, database, collection, filter = {}, options = {} } = await request.json();

    if (!uri || !database || !collection) {
      return NextResponse.json(
        { success: false, error: 'URI, database, and collection are required' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Convert _id strings to ObjectId if present
    const convertedFilter = convertIdFilter(filter);

    const result = await findDocuments(uri, database, collection, convertedFilter, options);

    return NextResponse.json(
      {
        success: true,
        data: {
          documents: result.documents,
          total: result.total,
          page: Math.floor((options.skip || 0) / (options.limit || 50)) + 1,
          pageSize: options.limit || 50,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}

// PUT - Insert document
export async function PUT(request: NextRequest) {
  try {
    const { uri, database, collection, document } = await request.json();

    if (!uri || !database || !collection || !document) {
      return NextResponse.json(
        { success: false, error: 'URI, database, collection, and document are required' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const result = await insertDocument(uri, database, collection, document);

    return NextResponse.json(
      {
        success: true,
        data: { insertedId: result.insertedId },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error inserting document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to insert document',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}

// PATCH - Update document
export async function PATCH(request: NextRequest) {
  try {
    const { uri, database, collection, filter, update } = await request.json();

    if (!uri || !database || !collection || !filter || !update) {
      return NextResponse.json(
        { success: false, error: 'URI, database, collection, filter, and update are required' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Convert _id strings to ObjectId if present
    const convertedFilter = convertIdFilter(filter);

    const result = await updateDocument(uri, database, collection, convertedFilter, update);

    return NextResponse.json(
      {
        success: true,
        data: { modifiedCount: result.modifiedCount },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update document',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const { uri, database, collection, filter } = await request.json();

    if (!uri || !database || !collection || !filter) {
      return NextResponse.json(
        { success: false, error: 'URI, database, collection, and filter are required' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Convert _id strings to ObjectId if present
    const convertedFilter = convertIdFilter(filter);

    const result = await deleteDocument(uri, database, collection, convertedFilter);

    return NextResponse.json(
      {
        success: true,
        data: { deletedCount: result.deletedCount },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete document',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}
