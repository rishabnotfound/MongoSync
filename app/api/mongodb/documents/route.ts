/**
 * API Route: CRUD operations for documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { findDocuments, insertDocument, updateDocument, deleteDocument } from '@/services/mongodb';
import { ObjectId } from 'mongodb';

// GET/POST documents (find/query)
export async function POST(request: NextRequest) {
  try {
    const { uri, database, collection, filter = {}, options = {} } = await request.json();

    if (!uri || !database || !collection) {
      return NextResponse.json(
        { success: false, error: 'URI, database, and collection are required' },
        { status: 400 }
      );
    }

    const result = await findDocuments(uri, database, collection, filter, options);

    return NextResponse.json({
      success: true,
      data: {
        documents: result.documents,
        total: result.total,
        page: Math.floor((options.skip || 0) / (options.limit || 50)) + 1,
        pageSize: options.limit || 50,
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
      },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const result = await insertDocument(uri, database, collection, document);

    return NextResponse.json({
      success: true,
      data: { insertedId: result.insertedId },
    });
  } catch (error) {
    console.error('Error inserting document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to insert document',
      },
      { status: 500 }
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
        { status: 400 }
      );
    }

    // Convert _id string to ObjectId if present
    if (filter._id && typeof filter._id === 'string') {
      filter._id = new ObjectId(filter._id);
    }

    const result = await updateDocument(uri, database, collection, filter, update);

    return NextResponse.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update document',
      },
      { status: 500 }
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
        { status: 400 }
      );
    }

    // Convert _id string to ObjectId if present
    if (filter._id && typeof filter._id === 'string') {
      filter._id = new ObjectId(filter._id);
    }

    const result = await deleteDocument(uri, database, collection, filter);

    return NextResponse.json({
      success: true,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete document',
      },
      { status: 500 }
    );
  }
}
