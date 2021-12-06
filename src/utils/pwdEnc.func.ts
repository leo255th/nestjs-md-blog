import SHA512 from 'sha512-es';

const pwdSalt = "-leoyi-blog"

export function pwdEncrypt(pwd, salt = pwdSalt): string {
  const pwdHash = SHA512.hash(pwd.trim() + pwdSalt);
  return pwdHash;
}