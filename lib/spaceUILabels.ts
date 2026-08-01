import { SpaceType } from './spaceTypes';

export interface SpaceUILabels {
  coachDashboardTitle: string;
  announcementsTitle: string;
  templatesTitle: string;
  membersTitle: string;
  challengesTitle: string;
}

const defaultLabels: SpaceUILabels = {
  coachDashboardTitle: 'Manager Dashboard',
  announcementsTitle: 'Announcements',
  templatesTitle: 'Templates',
  membersTitle: 'Members',
  challengesTitle: 'Challenges'
};

export const getSpaceUILabels = (type: SpaceType): SpaceUILabels => {
  switch (type) {
    case 'gym':
    case 'yoga_studio':
    case 'sports_academy':
      return {
        coachDashboardTitle: 'Coach Dashboard',
        announcementsTitle: 'Gym Announcements',
        templatesTitle: 'Workout Templates',
        membersTitle: 'Members',
        challengesTitle: 'Challenges'
      };
    case 'school':
    case 'college':
    case 'coaching_institute':
      return {
        coachDashboardTitle: 'Teacher Dashboard',
        announcementsTitle: 'School Announcements',
        templatesTitle: 'Homework Templates',
        membersTitle: 'Students',
        challengesTitle: 'Assignments'
      };
    case 'company':
      return {
        coachDashboardTitle: 'Manager Dashboard',
        announcementsTitle: 'Company Announcements',
        templatesTitle: 'Productivity Templates',
        membersTitle: 'Employees',
        challengesTitle: 'Goals'
      };
    case 'community':
      return {
        coachDashboardTitle: 'Moderator Dashboard',
        announcementsTitle: 'Community Feed',
        templatesTitle: 'Habit Templates',
        membersTitle: 'Members',
        challengesTitle: 'Events'
      };
    default:
      return defaultLabels;
  }
};
