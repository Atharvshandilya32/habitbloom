import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../../lib/server/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token, inviteCode, orgId } = await request.json();

    if (!token || !inviteCode) {
      return NextResponse.json({ error: 'Missing token or inviteCode' }, { status: 400 });
    }

    // 1. Verify user token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    const userName = decodedToken.name;

    // 2. Fetch invite by code
    const invitesSnap = await adminDb.ref('spaceInvites').orderByChild('code').equalTo(inviteCode).once('value');
    if (!invitesSnap.exists()) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    let inviteData = null;
    let inviteId = null;
    invitesSnap.forEach((childSnap) => {
      inviteId = childSnap.key;
      inviteData = childSnap.val();
      return true; // cancel early
    });

    if (!inviteData) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    const spaceId = inviteData.spaceId;

    // 3. Fetch Space Details
    const spaceSnap = await adminDb.ref(`spaces/${spaceId}`).once('value');
    if (!spaceSnap.exists()) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }


    // 4. Resolve default member roleId
    let defaultRoleId = '';
    const rolesSnap = await adminDb.ref(`spaceRoles/${spaceId}`).once('value');
    if (rolesSnap.exists()) {
      const rolesMap = rolesSnap.val();
      const rolesList = Object.values(rolesMap) as { id: string; name: string }[];
      const memberRole = rolesList.find(r => r.name.toLowerCase().includes('member') || r.name.toLowerCase().includes('student')) || rolesList[rolesList.length - 1];
      if (memberRole) defaultRoleId = memberRole.id;
    }

    // 5. Check Roster verification
    const cleanOrgId = orgId ? orgId.trim().toUpperCase() : '';
    let isVerified = false;
    let verStatus = 'pending';

    if (cleanOrgId) {
      const rosterSnap = await adminDb.ref(`spaceRosters/${spaceId}/${cleanOrgId}`).once('value');
      if (rosterSnap.exists()) {
        isVerified = true;
        verStatus = 'verified';
        const rosterData = rosterSnap.val();
        if (rosterData.roleId) defaultRoleId = rosterData.roleId;
      }
    }

    // 6. Perform the updates atomically or sequentially
    const now = new Date().toISOString();
    const newMember = {
      spaceId: spaceId,
      userId: userId,
      roleId: defaultRoleId,
      role: 'member',
      orgId: cleanOrgId || null,
      verified: isVerified,
      verificationStatus: verStatus,
      joinedAt: now,
    };

    const updatedInvite = {
      ...inviteData,
      uses: (inviteData.uses || 0) + 1
    };

    // Update spaceMembers
    await adminDb.ref(`spaceMembers/${spaceId}_${userId}`).set(newMember);

    // Update spaceInvites
    await adminDb.ref(`spaceInvites/${inviteId}`).set(updatedInvite);

    // Write audit log
    const logRef = adminDb.ref(`spaceAuditLogs/${spaceId}`).push();
    await logRef.set({
      timestamp: now,
      actor: { id: userId, name: userName || userEmail || 'Member' },
      target: { id: userId, name: userName || userEmail || 'Member' },
      action: 'JOIN',
      details: `Joined space (${verStatus === 'verified' ? 'Auto-Verified via Roster' : 'Joined as Pending Verification'})`
    });

    return NextResponse.json({ success: true, spaceId: spaceId });
  } catch (error) {
    console.error('Error joining space:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
