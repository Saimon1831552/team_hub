export const ROLES = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
}

export const ACTION_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
}

export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
}

export const SOCKET_EVENTS = {
  JOIN_WORKSPACE:    'join-workspace',
  LEAVE_WORKSPACE:   'leave-workspace',
  GOAL_UPDATED:      'goal:updated',
  ACTION_UPDATED:    'action:updated',
  ANNOUNCEMENT_NEW:  'announcement:new',
  MEMBER_ONLINE:     'member:online',
  MEMBER_OFFLINE:    'member:offline',
  NOTIFICATION_NEW:  'notification:new',
}