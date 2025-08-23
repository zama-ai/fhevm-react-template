export const TAB_INDEXES = {
  INBOX: 0,
  STARRED: 1,
  SENT: 2,
  ARCHIVE: 3,
  SPAM: 4,
  READ: 5,
  TRASH: 6,
} as const;

export type TabKey = keyof typeof TAB_INDEXES;

export type TabIndex = (typeof TAB_INDEXES)[TabKey];
