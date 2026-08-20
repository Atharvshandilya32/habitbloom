1. **Fix Client-Side Code - SpaceSettingsModal.tsx**
   - Update `src/app/components/spaces/SpaceSettingsModal.tsx` to query invites by `spaceId` instead of reading all invites.
   - Add imports for `query`, `orderByChild`, and `equalTo` from `firebase/database`.
   - Change `get(child(ref(database), 'spaceInvites'))` to `get(query(ref(database, 'spaceInvites'), orderByChild('spaceId'), equalTo(space.id)))`.

2. **Fix Client-Side Code - Invite Page**
   - Update `src/app/invite/[inviteCode]/page.tsx` to read the specific invite directly via its code: `get(child(dbRef, \`spaceInvites/${inviteCode}\`))` instead of fetching all invites.
   - Remove the code that increments the `uses` field of the invite when a user joins, as regular users will no longer have write access to invites.

3. **Update Firebase Rules**
   - In `database.rules.json`, update the `spaceInvites` section.
   - Remove the global `".read": "auth != null"` from the `spaceInvites` root.
   - Add `.indexOn: ["spaceId"]` to the `spaceInvites` node.
   - Add a root `.read` rule to allow queries filtered by `spaceId` where the user is the creator of that space: `".read": "auth != null && query.orderByChild == 'spaceId' && root.child('spaces').child(query.equalTo).child('createdBy').val() === auth.uid"`
   - Modify the `$inviteCode` node rules:
     - `.read`: allow any authenticated user to read a specific invite by its code (`"auth != null"`).
     - `.write`: allow the space creator to write the invite (`"auth != null && (!data.exists() || root.child('spaces').child(data.child('spaceId').val()).child('createdBy').val() === auth.uid || root.child('spaces').child(newData.child('spaceId').val()).child('createdBy').val() === auth.uid)"`).

4. **Run Project Checks**
   - Run `npm run type-check` to ensure no TypeScript errors.
   - Run `npm run lint` to ensure no linting errors.
   - Run `npm run test` to execute the project's tests.

5. **Complete pre-commit steps**
   - Run the pre commit instructions step to ensure proper testing, verifications, reviews and reflections are done.

6. **Submit PR**
   - Commit the changes and submit the PR with the required title and description.
