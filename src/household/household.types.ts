/** Someone who shares this kitchen. */
export type MemberView = {
  id: string;
  name: string;
  pictureUrl: string | null;
  role: "owner" | "member";
};

/** A member row joined with the account it belongs to. */
export type MemberRow = {
  id: string;
  name: string;
  image: string | null;
  role: string;
};
