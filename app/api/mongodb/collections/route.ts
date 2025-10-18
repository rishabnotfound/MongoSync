/**
 * API Route: List collections in a database
 */

import { NextRequest, NextResponse } from 'next/server';
import { listCollections } from '@/services/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { uri, database } = await request.json();

    if (!uri || !database) {
      return NextResponse.json(
        { success: false, error: 'URI and database are required' },
        { status: 400 }
      );
    }

    const collections = await listCollections(uri, database);

    return NextResponse.json({
      success: true,
      data: { collections },
    });
  } catch (error) {
    console.error('Error listing collections:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list collections',
      },
      { status: 500 }
    );
  }
}
