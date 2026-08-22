import { redirect } from "next/navigation";

export default function MyPageIndex() {
  redirect("/mypage/profile");
}
