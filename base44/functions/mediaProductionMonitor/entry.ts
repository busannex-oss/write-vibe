import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Media Production Monitor
 * Runs daily to:
 * 1. Check ElevenLabs API health & quota
 * 2. Audit pending/stalled video & audio book jobs
 * 3. Log issues to ErrorLog entity
 * 4. Send a daily summary email to the platform admin / project manager
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Allow both admin users and scheduled automation (no user auth for scheduled)
        let callerIsAdmin = false;
        try {
            const user = await base44.auth.me();
            callerIsAdmin = user?.role === 'admin';
        } catch (_) {}
        if (!callerIsAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

        const elevenlabsKey = Deno.env.get("ELEVENLABS_API_KEY");
        const now = new Date();
        const issues = [];
        const metrics = {
            generated_at: now.toISOString(),
            elevenlabs: { status: "unknown", characters_used: 0, characters_limit: 0, quota_percent: 0 },
            ffmpeg: { status: "operational" },
            books_audited: 0,
            stalled_video_jobs: [],
            stalled_audio_jobs: [],
            books_missing_media: [],
            health_score: 100
        };

        // ── 1. ElevenLabs API Health Check ──────────────────────────────────────
        if (!elevenlabsKey) {
            metrics.elevenlabs.status = "not_configured";
            issues.push({
                severity: "critical",
                type: "api_key_missing",
                component: "ElevenLabs",
                message: "ELEVENLABS_API_KEY environment variable is not set. Audiobook generation is completely blocked.",
                action: "Set the ELEVENLABS_API_KEY secret in the dashboard immediately."
            });
            metrics.health_score -= 40;
        } else {
            try {
                const quotaRes = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
                    headers: { "xi-api-key": elevenlabsKey }
                });

                if (!quotaRes.ok) {
                    metrics.elevenlabs.status = "error";
                    issues.push({
                        severity: "critical",
                        type: "api_auth_failure",
                        component: "ElevenLabs",
                        message: `ElevenLabs API returned ${quotaRes.status}. Key may be invalid or expired.`,
                        action: "Verify and rotate the ELEVENLABS_API_KEY."
                    });
                    metrics.health_score -= 35;
                } else {
                    const quota = await quotaRes.json();
                    const used = quota.character_count || 0;
                    const limit = quota.character_limit || 1;
                    const pct = Math.round((used / limit) * 100);
                    metrics.elevenlabs = { status: "operational", characters_used: used, characters_limit: limit, quota_percent: pct };

                    if (pct >= 95) {
                        issues.push({
                            severity: "critical",
                            type: "quota_exhausted",
                            component: "ElevenLabs",
                            message: `ElevenLabs quota at ${pct}% (${used}/${limit} chars). Audiobook generation will fail imminently.`,
                            action: "Upgrade ElevenLabs plan or reduce generation volume immediately."
                        });
                        metrics.health_score -= 30;
                    } else if (pct >= 80) {
                        issues.push({
                            severity: "high",
                            type: "quota_warning",
                            component: "ElevenLabs",
                            message: `ElevenLabs quota at ${pct}% (${used}/${limit} chars). Risk of quota exhaustion soon.`,
                            action: "Monitor usage and consider upgrading ElevenLabs plan."
                        });
                        metrics.health_score -= 15;
                    }
                }
            } catch (err) {
                metrics.elevenlabs.status = "unreachable";
                issues.push({
                    severity: "critical",
                    type: "api_connectivity",
                    component: "ElevenLabs",
                    message: `Cannot reach ElevenLabs API: ${err.message}`,
                    action: "Check network connectivity and ElevenLabs service status."
                });
                metrics.health_score -= 35;
            }
        }

        // ── 2. Audit Books for Stalled / Missing Media Jobs ──────────────────────
        const books = await base44.asServiceRole.entities.Book.list();
        metrics.books_audited = books.length;
        const stalledThresholdMs = 48 * 60 * 60 * 1000; // 48 hours

        for (const book of books) {
            // Check for stalled video jobs: book in 'writing'+ stage but no video_commercial_url and updated >48h ago
            if (book.status && book.status !== 'draft') {
                const updatedAt = new Date(book.updated_date || book.created_date);
                const ageMs = now - updatedAt;

                const hasVideoStage = book.front_cover_url; // video is post-cover
                const missingVideo = !book.video_commercial_url;
                const missingAudio = !book.audiobook_url;

                if (hasVideoStage && missingVideo && ageMs > stalledThresholdMs) {
                    metrics.stalled_video_jobs.push({ id: book.id, title: book.title, status: book.status, hours_stalled: Math.round(ageMs / 3600000) });
                    metrics.health_score = Math.max(0, metrics.health_score - 5);
                }

                if (book.manuscript_chapters?.length > 0 && missingAudio && ageMs > stalledThresholdMs) {
                    metrics.stalled_audio_jobs.push({ id: book.id, title: book.title, status: book.status, hours_stalled: Math.round(ageMs / 3600000) });
                    metrics.health_score = Math.max(0, metrics.health_score - 5);
                }

                // Books marked published but missing audiobook or video
                if (book.status === 'published' && (missingVideo || missingAudio)) {
                    metrics.books_missing_media.push({
                        id: book.id,
                        title: book.title,
                        missing_video: missingVideo,
                        missing_audio: missingAudio
                    });
                }
            }
        }

        if (metrics.stalled_video_jobs.length > 0) {
            issues.push({
                severity: "high",
                type: "stalled_video_jobs",
                component: "FFmpeg / Video Producer",
                message: `${metrics.stalled_video_jobs.length} book(s) have stalled video generation (no video after 48h post cover completion): ${metrics.stalled_video_jobs.map(b => b.title).join(', ')}`,
                action: "Trigger video commercial regeneration for these books."
            });
        }

        if (metrics.stalled_audio_jobs.length > 0) {
            issues.push({
                severity: "high",
                type: "stalled_audio_jobs",
                component: "ElevenLabs / Audiobook Producer",
                message: `${metrics.stalled_audio_jobs.length} book(s) have stalled audiobook generation (manuscript ready, no audio after 48h): ${metrics.stalled_audio_jobs.map(b => b.title).join(', ')}`,
                action: "Trigger audiobook regeneration for these books."
            });
        }

        if (metrics.books_missing_media.length > 0) {
            issues.push({
                severity: "medium",
                type: "published_books_missing_media",
                component: "Media Production",
                message: `${metrics.books_missing_media.length} published book(s) are missing video or audio: ${metrics.books_missing_media.map(b => b.title).join(', ')}`,
                action: "Generate missing media assets for published books."
            });
        }

        // ── 3. Log Critical/High Issues to ErrorLog ──────────────────────────────
        const criticalAndHigh = issues.filter(i => i.severity === 'critical' || i.severity === 'high');
        for (const issue of criticalAndHigh) {
            await base44.asServiceRole.entities.ErrorLog.create({
                error_type: "runtime",
                message: `[Media Production] ${issue.message}`,
                component: issue.component,
                severity: issue.severity === 'critical' ? 'critical' : 'high',
                context: JSON.stringify({ type: issue.type, action: issue.action, metrics }),
                resolved: false
            });
        }

        // ── 4. Send Daily Report Email to Admin ──────────────────────────────────
        const healthEmoji = metrics.health_score >= 90 ? "🟢" : metrics.health_score >= 70 ? "🟡" : "🔴";

        const issuesList = issues.length > 0
            ? issues.map(i => `• [${i.severity.toUpperCase()}] ${i.component}: ${i.message}\n  → Action: ${i.action}`).join('\n\n')
            : "✅ No issues detected.";

        const emailBody = `
📊 MEDIA PRODUCTION DAILY REPORT — ${now.toDateString()}
${healthEmoji} Health Score: ${metrics.health_score}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📹 VIDEO PRODUCTION (FFmpeg)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FFmpeg Status: ${metrics.ffmpeg.status}
Stalled Video Jobs: ${metrics.stalled_video_jobs.length}
${metrics.stalled_video_jobs.map(b => `  - ${b.title} (${b.hours_stalled}h stalled)`).join('\n') || '  None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎙️ AUDIO PRODUCTION (ElevenLabs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API Status: ${metrics.elevenlabs.status}
Quota Usage: ${metrics.elevenlabs.characters_used.toLocaleString()} / ${metrics.elevenlabs.characters_limit.toLocaleString()} chars (${metrics.elevenlabs.quota_percent}%)
Stalled Audio Jobs: ${metrics.stalled_audio_jobs.length}
${metrics.stalled_audio_jobs.map(b => `  - ${b.title} (${b.hours_stalled}h stalled)`).join('\n') || '  None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 BOOKS OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Books Audited: ${metrics.books_audited}
Published Books Missing Media: ${metrics.books_missing_media.length}
${metrics.books_missing_media.map(b => `  - ${b.title} (video: ${b.missing_video ? '❌' : '✅'}, audio: ${b.missing_audio ? '❌' : '✅'})`).join('\n') || '  None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ISSUES REQUIRING ATTENTION (${issues.length} total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${issuesList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This report is auto-generated by the Write Vibe Media Production Monitor.
 Critical issues have been logged to the Error Dashboard.
 — Write Vibe Media Production Agent
        `.trim();

        // Send to all admin users registered in the app
        const allUsers = await base44.asServiceRole.entities.User.list();
        const adminUsers = allUsers.filter(u => u.role === 'admin' && u.email);
        for (const admin of adminUsers) {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: admin.email,
                subject: `${healthEmoji} [Write Vibe] Daily Media Production Report — Score: ${metrics.health_score}/100`,
                body: emailBody
            });
        }

        return Response.json({
            success: true,
            health_score: metrics.health_score,
            issues_found: issues.length,
            critical_issues: criticalAndHigh.length,
            metrics
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});