export class JwtDto {
  userId: string;
  sessionId: string;
  // Issued at
  iat: number;
  //Expiration time
  exp: number;
}
