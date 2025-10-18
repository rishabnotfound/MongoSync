/**
 * API Route: Manage Database
 * Handles database creation and deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { uri, database } = await request.json();

    if (!uri || !database) {
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
      // Create a placeholder collection to initialize the database
      await db.createCollection('_init');
      // Optionally delete the placeholder
      await db.collection('_init').drop();

      return NextResponse.json(
        {
          success: true,
          data: { database, created: true },
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
    console.error('Error creating database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create database' },
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
    const { uri, database } = await request.json();

    if (!uri || !database) {
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
      await db.dropDatabase();

      return NextResponse.json(
        {
          success: true,
          data: { database, deleted: true },
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
    console.error('Error deleting database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete database' },
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
