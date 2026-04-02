import { NextRequest, NextResponse } from "next/server";
import { generateProductRecommendations, trackRecommendationInteraction, getRecommendationAnalytics } from "@/server/services/automation/recommendations";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const action = searchParams.get('action');

  try {
    if (action === 'analytics') {
      const days = parseInt(searchParams.get('days') || '7');
      const analytics = await getRecommendationAnalytics(days);
      return NextResponse.json(analytics);
    }

    // Get current user/session
    const session = await auth();
    const userId = session?.user?.id;
    const sessionId = req.cookies.get('sessionId')?.value;

    const recommendations = await generateProductRecommendations(userId, sessionId, limit);

    return NextResponse.json({
      recommendations: recommendations.map(r => ({
        product: r.product,
        score: r.score,
        algorithm: r.algorithm,
        context: r.context
      }))
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recommendationId, action } = body;

    if (!recommendationId || !action) {
      return NextResponse.json(
        { error: 'Missing recommendationId or action' },
        { status: 400 }
      );
    }

    if (!['click', 'purchase'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "click" or "purchase"' },
        { status: 400 }
      );
    }

    await trackRecommendationInteraction(recommendationId, action);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track recommendation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}