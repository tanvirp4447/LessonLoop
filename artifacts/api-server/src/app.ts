import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import router from "./routes";
import { logger } from "./lib/logger";
import { createHmac } from "crypto";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const SESSION_SECRET = process.env.SESSION_SECRET ?? "lessonloop-dev-secret";
const COOKIE_NAME = "ll_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function sign(data: string): string {
  return createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
}

function signCookie(value: string): string {
  return `${value}.${sign(value)}`;
}

function unsignCookie(signed: string): string | null {
  const dotIdx = signed.lastIndexOf(".");
  if (dotIdx < 0) return null;
  const value = signed.slice(0, dotIdx);
  const sig = signed.slice(dotIdx + 1);
  if (sig !== sign(value)) return null;
  return value;
}

app.use((req, _res, next) => {
  let session: { userId?: number } = {};

  const raw = req.cookies?.[COOKIE_NAME];
  if (raw) {
    const unsigned = unsignCookie(raw);
    if (unsigned) {
      try {
        session = JSON.parse(Buffer.from(unsigned, "base64url").toString());
      } catch {
        session = {};
      }
    }
  }

  (req as any).session = session;
  next();
});

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const session = (req as any).session;
    if (session) {
      const encoded = Buffer.from(JSON.stringify(session)).toString("base64url");
      const signed = signCookie(encoded);
      res.cookie(COOKIE_NAME, signed, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
        path: "/",
      });
    }
    return originalJson(body);
  };
  next();
});

app.use("/api", router);

export default app;
