import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { authConfig } from "./auth-config";

export interface AuthenticatedUser {
  authenticated: true;
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request.cookies?.meuestoque_token ?? null,
      ]),
      secretOrKey: authConfig.jwtSecret,
    },
    (_payload, done) => {
      done(null, { authenticated: true } satisfies AuthenticatedUser);
    },
  ),
);

export { passport };
