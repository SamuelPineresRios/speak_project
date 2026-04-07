import { NextRequest, NextResponse } from 'next/server'

// This is a mock - in production, fetch from your database
async function getCompletedActivities() {
  // TODO: Connect to your database and fetch:
  // - All missions with completions
  // - All stories with completions  
  // - All guides with completions
  // Along with student responses, feedback, ratings, etc.
  
  return [
    {
      type: 'mission',
      name: 'Sample Mission',
      studentName: 'Juan García',
      studentEmail: 'juan@example.com',
      studentLevel: 'A2',
      completedAt: new Date().toISOString(),
      responses: ['How can I help you?', 'I would like to buy a backpack'],
      feedback: ['Good pronunciation', 'Excellent vocabulary'],
      rating: 4,
      progress: 100,
      timeInvested: 245
    }
  ]
}

export async function GET(req: NextRequest) {
  try {
    const activities = await getCompletedActivities()
    
    if (activities.length === 0) {
      return NextResponse.json(
        { error: 'No completed activities found' },
        { status: 404 }
      )
    }

    // Prepare data for CSV
    const headers = [
      'Tipo', 'Nombre', 'Estudiante', 'Email', 'Nivel CEFR', 
      'Fecha Completada', 'Respuestas', 'Feedback', 'Calificación', 
      'Progreso %', 'Tiempo (segundos)'
    ];

    const escapeCsv = (str: any) => {
      const s = String(str);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const activity of activities) {
      const row = [
        activity.type === 'mission' ? 'Misión' : activity.type === 'story' ? 'Historia' : 'Guía',
        activity.name,
        activity.studentName,
        activity.studentEmail,
        activity.studentLevel,
        new Date(activity.completedAt).toLocaleString('es-ES'),
        activity.responses.join(' | '),
        activity.feedback.join(' | '),
        `${activity.rating}/5`,
        `${activity.progress}%`,
        activity.timeInvested
      ];
      csvRows.push(row.map(escapeCsv).join(','));
    }

    const csvContent = csvRows.join('\n');

    // Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="actividades-completadas-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: `Export failed: ${error.message}` },
      { status: 500 }
    )
  }
}
