/**
 * API Route: Manage Collection
 * Handles collection creation and deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { uri, database, collection } = await request.json();

    if (!uri || !database || !collection) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    const client = new MongoClient(uri);
    await client.connect();

    try {
      const db = client.db(database);
      await db.createCollection(collection);

      return NextResponse.json(
        {
          success: true,
          data: { database, collection, created: true },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    } finally {
      await client.close();
    }
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create collection' },
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

export async function DELETE(request: NextRequest) {
  try {
    const { uri, database, collection } = await request.json();

    if (!uri || !database || !collection) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    const client = new MongoClient(uri);
    await client.connect();

    try {
      const db = client.db(database);
      await db.collection(collection).drop();

      return NextResponse.json(
        {
          success: true,
          data: { database, collection, deleted: true },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    } finally {
      await client.close();
    }
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete collection' },
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
