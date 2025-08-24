export type Mail = {
  id: number;
  threadId: number;
  owner: string;
  from: string;
  to: string;
  time: string;
  timeStamp: string;
  box: string;
  subject: string;
  body: string;
  read: boolean;
  starred: boolean;
  spam: boolean;
};
