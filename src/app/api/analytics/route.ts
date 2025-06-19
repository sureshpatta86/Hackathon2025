import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

// GET /api/analytics - Get communication analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = subDays(new Date(), days);

    // Get communication statistics
    const communications = await db.communication.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalCommunications: communications.length,
      sms: {
        total: communications.filter(c => c.type === 'SMS').length,
        delivered: communications.filter(c => c.type === 'SMS' && c.status === 'DELIVERED').length,
        failed: communications.filter(c => c.type === 'SMS' && c.status === 'FAILED').length,
        pending: communications.filter(c => c.type === 'SMS' && c.status === 'PENDING').length,
      },
      voice: {
        total: communications.filter(c => c.type === 'VOICE').length,
        delivered: communications.filter(c => c.type === 'VOICE' && c.status === 'DELIVERED').length,
        failed: communications.filter(c => c.type === 'VOICE' && c.status === 'FAILED').length,
        pending: communications.filter(c => c.type === 'VOICE' && c.status === 'PENDING').length,
      },
    };

    // Calculate success rates
    const smsSuccessRate = stats.sms.total > 0 
      ? ((stats.sms.delivered / stats.sms.total) * 100).toFixed(1)
      : '0';
    
    const voiceSuccessRate = stats.voice.total > 0 
      ? ((stats.voice.delivered / stats.voice.total) * 100).toFixed(1)
      : '0';

    // Get daily breakdown for charts
    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayCommunications = communications.filter(c => 
        c.createdAt >= dayStart && c.createdAt <= dayEnd
      );
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        sms: dayCommunications.filter(c => c.type === 'SMS').length,
        voice: dayCommunications.filter(c => c.type === 'VOICE').length,
        total: dayCommunications.length,
      });
    }

    // Get top patients by communication count
    const patientCommunications = communications.reduce((acc, comm) => {
      const patientKey = `${comm.patient.firstName} ${comm.patient.lastName}`;
      acc[patientKey] = (acc[patientKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPatients = Object.entries(patientCommunications)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Get recent failures for troubleshooting
    const recentFailures = communications
      .filter(c => c.status === 'FAILED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        type: c.type,
        patient: `${c.patient.firstName} ${c.patient.lastName}`,
        phoneNumber: c.phoneNumber,
        errorMessage: c.errorMessage,
        failedAt: c.failedAt,
      }));

    return NextResponse.json({
      stats,
      successRates: {
        sms: parseFloat(smsSuccessRate),
        voice: parseFloat(voiceSuccessRate),
      },
      dailyStats,
      topPatients,
      recentFailures,
      dateRange: {
        from: startDate.toISOString(),
        to: new Date().toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
