import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch all books and team data
        const books = await base44.asServiceRole.entities.Book.list();
        const documents = await base44.asServiceRole.entities.Document.list();
        const teamMembers = await base44.asServiceRole.entities.TeamMember.list();
        const subscribers = await base44.asServiceRole.entities.NewsletterSubscriber.list();

        // Calculate metrics
        const totalBooks = books.length;
        const completedBooks = books.filter(b => b.status === 'published').length;
        const inProgressBooks = books.filter(b => b.status !== 'draft' && b.status !== 'published').length;
        const draftBooks = books.filter(b => b.status === 'draft').length;

        // Check for books with missing critical components
        const booksWithIssues = books.filter(b => 
            (b.status !== 'draft' && !b.manuscript_chapters?.length) ||
            (b.status === 'published' && !b.front_cover_url)
        );

        // Project health analysis
        const projectsNeedingAttention = books.filter(b => {
            if (b.status === 'draft') return false;
            const createdDate = new Date(b.created_date);
            const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreated > 30 && b.status !== 'published';
        });

        // Quality checks
        const qualityIssues = [];
        books.forEach(book => {
            if (book.manuscript_chapters?.length > 0) {
                const hasShortChapters = book.manuscript_chapters.some(ch => 
                    ch.word_count && ch.word_count < 500
                );
                if (hasShortChapters) {
                    qualityIssues.push({
                        book_id: book.id,
                        title: book.title,
                        issue: 'Contains chapters under 500 words'
                    });
                }
            }

            if (book.status !== 'draft' && !book.category) {
                qualityIssues.push({
                    book_id: book.id,
                    title: book.title,
                    issue: 'Missing category'
                });
            }
        });

        // Team productivity
        const activeProjects = books.filter(b => b.status !== 'draft' && b.status !== 'published');
        const teamProductivity = teamMembers.reduce((acc, member) => {
            const memberBooks = books.filter(b => b.created_by === member.user_email);
            acc[member.user_email] = {
                name: member.name,
                total_books: memberBooks.length,
                published: memberBooks.filter(b => b.status === 'published').length,
                in_progress: memberBooks.filter(b => b.status !== 'draft' && b.status !== 'published').length
            };
            return acc;
        }, {});

        // Generate report
        const report = {
            generated_at: new Date().toISOString(),
            summary: {
                total_books: totalBooks,
                completed_books: completedBooks,
                in_progress_books: inProgressBooks,
                draft_books: draftBooks,
                completion_rate: totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0,
                total_documents: documents.length,
                total_team_members: teamMembers.length,
                total_subscribers: subscribers.length
            },
            project_health: {
                projects_on_track: activeProjects.length - projectsNeedingAttention.length,
                projects_needing_attention: projectsNeedingAttention.length,
                at_risk_projects: projectsNeedingAttention.map(p => ({
                    id: p.id,
                    title: p.title,
                    status: p.status,
                    days_since_created: Math.round((Date.now() - new Date(p.created_date).getTime()) / (1000 * 60 * 60 * 24))
                }))
            },
            quality_assurance: {
                total_issues: qualityIssues.length + booksWithIssues.length,
                critical_issues: booksWithIssues.map(b => ({
                    id: b.id,
                    title: b.title,
                    issue: 'Missing critical components'
                })),
                quality_issues: qualityIssues
            },
            team_productivity: teamProductivity,
            recommendations: [
                projectsNeedingAttention.length > 0 && 'Follow up with stalled projects over 30 days old',
                qualityIssues.length > 0 && 'Review and enhance content quality for flagged books',
                booksWithIssues.length > 0 && 'Complete missing critical components',
                inProgressBooks > completedBooks * 2 && 'Focus on completing in-progress projects',
                activeProjects.length > 10 && 'Consider prioritizing projects to improve completion rate'
            ].filter(Boolean),
            status: booksWithIssues.length === 0 && qualityIssues.length === 0 ? 'healthy' : 'needs_attention'
        };

        return Response.json(report);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});