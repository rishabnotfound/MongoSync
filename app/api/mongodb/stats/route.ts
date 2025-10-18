/**
 * API Route: Collection statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollectionStats } from '@/services/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { uri, database, collection } = await request.json();

    if (!uri || !database || !collection) {
      return NextResponse.json(
        { success: false, error: 'URI, database, and collection are required' },
        { status: 400 }
      );
    }

    const stats = await getCollectionStats(uri, database, collection);

    return NextResponse.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
