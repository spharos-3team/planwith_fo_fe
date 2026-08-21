import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  rememberEmail: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .max(20, "비밀번호는 20자 이하여야 합니다.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
    "소문자, 대문자, 특수문자를 포함해주세요."
  );

export const nameSchema = z
  .string()
  .trim()
  .min(2, "이름은 2자 이상이어야 합니다.")
  .max(20, "이름은 20자 이하여야 합니다.");

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^01[016789]\d{7,8}$/,
    "휴대폰 번호는 01012345678 형식으로 입력해주세요."
  );

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "닉네임은 2자 이상이어야 합니다.")
  .max(10, "닉네임은 10자 이하여야 합니다.");
