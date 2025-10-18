/**
 * API Route: Test MongoDB connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { testConnection, listDatabases } from '@/services/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { uri } = await request.json();

    if (!uri) {
      return NextResponse.json(
        { success: false, error: 'URI is required' },
        { status: 400 }
      );
    }

    // Test connection
    const testResult = await testConnection(uri);

    if (!testResult.success) {
      return NextResponse.json(
        { success: false, error: testResult.error },
        { status: 400 }
      );
    }

    // Get list of databases
    const databases = await listDatabases(uri);

    return NextResponse.json({
      success: true,
      data: { databases: databases.map((db: any) => db.name) },
    });
  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      },
      { status: 500 }
    );
  }
}
