import { getSpaceUILabels } from '../lib/spaceUILabels';
import { SpaceType } from '../lib/spaceTypes';

console.log('🧪 Starting Space UI Labels Unit Test Suite...');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

function runTests() {
  // Group 1: Fitness spaces (gym, yoga_studio, sports_academy)
  const fitnessTypes: SpaceType[] = ['gym', 'yoga_studio', 'sports_academy'];
  for (const type of fitnessTypes) {
    const labels = getSpaceUILabels(type);
    assert(labels.coachDashboardTitle === 'Coach Dashboard', `${type} returns Coach Dashboard for coachDashboardTitle`);
    assert(labels.announcementsTitle === 'Gym Announcements', `${type} returns Gym Announcements for announcementsTitle`);
    assert(labels.templatesTitle === 'Workout Templates', `${type} returns Workout Templates for templatesTitle`);
    assert(labels.membersTitle === 'Members', `${type} returns Members for membersTitle`);
    assert(labels.challengesTitle === 'Challenges', `${type} returns Challenges for challengesTitle`);
  }

  // Group 2: Education spaces (school, college, coaching_institute)
  const educationTypes: SpaceType[] = ['school', 'college', 'coaching_institute'];
  for (const type of educationTypes) {
    const labels = getSpaceUILabels(type);
    assert(labels.coachDashboardTitle === 'Teacher Dashboard', `${type} returns Teacher Dashboard for coachDashboardTitle`);
    assert(labels.announcementsTitle === 'School Announcements', `${type} returns School Announcements for announcementsTitle`);
    assert(labels.templatesTitle === 'Homework Templates', `${type} returns Homework Templates for templatesTitle`);
    assert(labels.membersTitle === 'Students', `${type} returns Students for membersTitle`);
    assert(labels.challengesTitle === 'Assignments', `${type} returns Assignments for challengesTitle`);
  }

  // Group 3: Company
  const companyLabels = getSpaceUILabels('company');
  assert(companyLabels.coachDashboardTitle === 'Manager Dashboard', `company returns Manager Dashboard for coachDashboardTitle`);
  assert(companyLabels.announcementsTitle === 'Company Announcements', `company returns Company Announcements for announcementsTitle`);
  assert(companyLabels.templatesTitle === 'Productivity Templates', `company returns Productivity Templates for templatesTitle`);
  assert(companyLabels.membersTitle === 'Employees', `company returns Employees for membersTitle`);
  assert(companyLabels.challengesTitle === 'Goals', `company returns Goals for challengesTitle`);

  // Group 4: Community
  const communityLabels = getSpaceUILabels('community');
  assert(communityLabels.coachDashboardTitle === 'Moderator Dashboard', `community returns Moderator Dashboard for coachDashboardTitle`);
  assert(communityLabels.announcementsTitle === 'Community Feed', `community returns Community Feed for announcementsTitle`);
  assert(communityLabels.templatesTitle === 'Habit Templates', `community returns Habit Templates for templatesTitle`);
  assert(communityLabels.membersTitle === 'Members', `community returns Members for membersTitle`);
  assert(communityLabels.challengesTitle === 'Events', `community returns Events for challengesTitle`);

  // Group 5: Default fallback (family, custom, other, etc)
  const defaultTypes: SpaceType[] = ['family', 'custom', 'other'];
  for (const type of defaultTypes) {
    const labels = getSpaceUILabels(type);
    assert(labels.coachDashboardTitle === 'Manager Dashboard', `${type} (default) returns Manager Dashboard for coachDashboardTitle`);
    assert(labels.announcementsTitle === 'Announcements', `${type} (default) returns Announcements for announcementsTitle`);
    assert(labels.templatesTitle === 'Templates', `${type} (default) returns Templates for templatesTitle`);
    assert(labels.membersTitle === 'Members', `${type} (default) returns Members for membersTitle`);
    assert(labels.challengesTitle === 'Challenges', `${type} (default) returns Challenges for challengesTitle`);
  }

  console.log(`\n📊 Space UI Labels Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
