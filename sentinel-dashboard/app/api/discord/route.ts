import { NextResponse } from 'next/server';

interface DiscordAlert {
  type: 'protocol_alert' | 'audit_complete' | 'high_risk_detected';
  protocol?: {
    name: string;
    slug: string;
    tvl: number;
    change_7d: number;
    score: number;
    chain: string;
  };
  message?: string;
  timestamp?: string;
}

// In-memory storage for recent alerts (in production, use Redis or database)
let recentAlerts: DiscordAlert[] = [];
const MAX_ALERTS = 50;

export async function POST(request: Request) {
  try {
    const alert: DiscordAlert = await request.json();
    
    // Add timestamp if not provided
    if (!alert.timestamp) {
      alert.timestamp = new Date().toISOString();
    }

    // Store alert
    recentAlerts.unshift(alert);
    if (recentAlerts.length > MAX_ALERTS) {
      recentAlerts = recentAlerts.slice(0, MAX_ALERTS);
    }

    console.log('📡 Discord Alert Received:', alert.type, alert.protocol?.name || alert.message);

    return NextResponse.json({
      success: true,
      message: 'Alert received',
      alertCount: recentAlerts.length
    });

  } catch (error: any) {
    console.error('Discord webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    return NextResponse.json({
      success: true,
      alerts: recentAlerts.slice(0, limit),
      total: recentAlerts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Discord API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
