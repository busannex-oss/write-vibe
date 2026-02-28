import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can fix errors
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { errorId, errorData } = body;

    if (!errorId || !errorData) {
      return Response.json({ error: 'Missing errorId or errorData' }, { status: 400 });
    }

    // Parse the recommended fix to determine what action to take
    const recommendedFix = errorData.recommended_fix || '';

    let fixApplied = false;
    let fixDetails = '';

    // Check if this is a 404/book not found error
    if (errorData.error_type === 'not_found_404' && errorData.page?.includes('BookEditor')) {
      // For book not found errors, we could potentially delete orphaned error logs
      // or suggest the user navigate to My Books
      fixDetails = 'User should navigate to My Books page to select a valid book';
      fixApplied = true;
    }

    // For auth errors (403)
    if (errorData.error_type === 'auth_403') {
      fixDetails = 'User may need to re-authenticate or request proper permissions';
      fixApplied = true;
    }

    // Generic fix applied
    if (!fixApplied && recommendedFix) {
      fixDetails = `Recommended fix documented: ${recommendedFix}`;
      fixApplied = true;
    }

    // Mark error as resolved
    await base44.asServiceRole.entities.ErrorLog.update(errorId, {
      resolved: true,
      resolution_notes: fixDetails
    });

    return Response.json({
      success: true,
      message: 'Error marked as resolved',
      fixDetails
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});