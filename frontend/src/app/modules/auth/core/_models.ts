// AuthModel - ข้อมูลที่ได้จาก login/register
export interface AuthModel {
  _id: string;
  user_name: string;
  user_email: string;
  role: "CEO" | "admin" | "employee";
  department_id?: DepartmentModel | string | null;
  leave_days: number;
  avatar?: string;
  image_url?: string;
  token: string; // ✅ ใช้ token
}

// DepartmentModel
export interface DepartmentModel {
  _id: string;
  department_name: string;
  createdAt?: string;
  updatedAt?: string;
}

// UserModel - ข้อมูลโปรไฟล์ผู้ใช้
export interface UserModel {
  _id: string;
  user_name: string;
  user_email: string;
  role: "owner" | "admin" | "employee" |"CEO";
  department_id?: DepartmentModel | string | null;
  leave_days: number;
  avatar?: string;
  image_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

// EventModel
export interface EventModel {
  _id: string;
  user_id: string | UserModel;
  event_name: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

// HolidayModel
export interface HolidayModel {
  _id: string;
  user_id: string | UserModel;
  holiday_name: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}
