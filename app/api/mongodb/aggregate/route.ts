/**
 * API Route: Execute aggregation pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeAggregation } from '@/services/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { uri, database, collection, pipeline } = await request.json();

    if (!uri || !database || !collection || !pipeline) {
      return NextResponse.json(
        { success: false, error: 'URI, database, collection, and pipeline are required' },
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

    if (!Array.isArray(pipeline)) {
      return NextResponse.json(
        { success: false, error: 'Pipeline must be an array' },
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

    const result = await executeAggregation(uri, database, collection, pipeline);

    return NextResponse.json(
      {
        success: true,
        data: result,
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
    console.error('Error executing aggregation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute aggregation',
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
