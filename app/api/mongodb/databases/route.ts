/**
 * API Route: List databases
 */

import { NextRequest, NextResponse } from 'next/server';
import { listDatabases } from '@/services/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { uri } = await request.json();

    if (!uri) {
      return NextResponse.json(
        { success: false, error: 'URI is required' },
        { status: 400 }
      );
    }

    const databases = await listDatabases(uri);

    return NextResponse.json({
      success: true,
      data: { databases },
    });
  } catch (error) {
    console.error('Error listing databases:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list databases',
      },
      { status: 500 }
    );
  }
}
