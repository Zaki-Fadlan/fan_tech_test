export interface UserPresence {
  nama_user: string;
  waktu_masuk: string | null;
  waktu_pulang: string | null;
  status_masuk: string;
  status_pulang: string;
}

export interface GroupedPresences {
  [date: string]: {
    [userId: number]: UserPresence;
  };
}
interface PresenceData {
  id_users: number;
  type: "IN" | "OUT";
  waktu: Date;
  is_approve: string;
}
