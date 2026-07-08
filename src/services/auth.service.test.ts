import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BadRequestError, UnauthorizedError } from "../errors/http-errors.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { EmailService } from "./email/email.service.js";
import { TurnstileService } from "./security/turnstile.service.js";
import {
  createAuthUserRow,
  createEmailVerificationUserRow,
  createPasswordResetUserRow,
} from "../test/factories/auth.factory.js";
import type {
  AuthUserRow,
  CreateAuthUserInput,
  EmailVerificationUserRow,
  PasswordResetUserRow,
} from "../types/auth.types.js";
import { AuthService } from "./auth.service.js";

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

type AuthRepositoryMock = Pick<
  AuthRepository,
  | "createUser"
  | "findUserByEmail"
  | "findUserByEmailVerificationTokenHash"
  | "findUserByPasswordResetTokenHash"
  | "markEmailAsVerified"
  | "saveEmailVerificationToken"
  | "savePasswordResetToken"
  | "updatePasswordAndClearResetToken"
>;

type EmailServiceMock = Pick<
  EmailService,
  | "sendAccountCreatedEmail"
  | "sendEmailVerificationEmail"
  | "sendPasswordResetEmail"
>;

type TurnstileServiceMock = Pick<TurnstileService, "verify">;

function createAuthRepositoryMock(input: {
  createdUser?: AuthUserRow;
  emailVerificationUser?: EmailVerificationUserRow | null;
  passwordResetUser?: PasswordResetUserRow | null;
  userByEmail?: AuthUserRow | null;
} = {}): AuthRepositoryMock {
  return {
    createUser: vi.fn(async () => input.createdUser ?? createAuthUserRow()),
    findUserByEmail: vi.fn(async () => input.userByEmail ?? null),
    findUserByEmailVerificationTokenHash: vi.fn(
      async () => input.emailVerificationUser ?? null
    ),
    findUserByPasswordResetTokenHash: vi.fn(
      async () => input.passwordResetUser ?? null
    ),
    markEmailAsVerified: vi.fn(async () => undefined),
    saveEmailVerificationToken: vi.fn(async () => undefined),
    savePasswordResetToken: vi.fn(async () => undefined),
    updatePasswordAndClearResetToken: vi.fn(async () => undefined),
  };
}

function createEmailServiceMock(): EmailServiceMock {
  return {
    sendAccountCreatedEmail: vi.fn(async () => undefined),
    sendEmailVerificationEmail: vi.fn(async () => undefined),
    sendPasswordResetEmail: vi.fn(async () => undefined),
  };
}

function createTurnstileServiceMock(): TurnstileServiceMock {
  return {
    verify: vi.fn(async () => undefined),
  };
}

function createService(input: {
  authRepository?: AuthRepositoryMock;
  emailService?: EmailServiceMock;
  turnstileService?: TurnstileServiceMock;
} = {}): AuthService {
  return new AuthService(
    (input.authRepository ?? createAuthRepositoryMock()) as unknown as AuthRepository,
    (input.emailService ?? createEmailServiceMock()) as unknown as EmailService,
    (input.turnstileService ?? createTurnstileServiceMock()) as unknown as TurnstileService
  );
}

function mockCryptoRandomBytes(hexValue: string): void {
  const bytes = Buffer.from(hexValue, "hex");
  vi.spyOn(crypto, "randomBytes").mockReturnValue(bytes);
}

describe("AuthService register", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:30:00.000Z"));
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password");
    mockCryptoRandomBytes("ab".repeat(32));
  });

  it("verifies Turnstile, hashes password, creates user and sends verification email", async () => {
    const authRepository = createAuthRepositoryMock({
      createdUser: createAuthUserRow({
        email: "new@mpm.test",
        email_verified_at: null,
        first_name: "Ada",
        password_hash: "hashed-password",
      }),
    });
    const emailService = createEmailServiceMock();
    const turnstileService = createTurnstileServiceMock();
    const service = createService({
      authRepository,
      emailService,
      turnstileService,
    });

    const result = await service.register({
      email: "new@mpm.test",
      firstName: "Ada",
      lastName: "Lovelace",
      password: "clear-password",
      turnstileToken: "turnstile-token",
    });

    expect(turnstileService.verify).toHaveBeenCalledWith("turnstile-token");
    expect(bcrypt.hash).toHaveBeenCalledWith("clear-password", 10);
    expect(authRepository.createUser).toHaveBeenCalledWith({
      email: "new@mpm.test",
      firstName: "Ada",
      lastName: "Lovelace",
      passwordHash: "hashed-password",
    } satisfies CreateAuthUserInput);
    expect(authRepository.saveEmailVerificationToken).toHaveBeenCalledWith({
      expiresAt: new Date("2026-01-16T10:30:00.000Z"),
      tokenHash: expect.any(String),
      userId: 7,
    });
    expect(emailService.sendEmailVerificationEmail).toHaveBeenCalledWith({
      email: "new@mpm.test",
      firstName: "Ada",
      verificationUrl: "https://mpm.test/verify-email?token=" + "ab".repeat(32),
    });
    expect(emailService.sendAccountCreatedEmail).toHaveBeenCalledWith({
      email: "new@mpm.test",
      firstName: "Ada",
    });
    expect(result).toEqual({
      message:
        "Account created successfully. Please verify your email before logging in.",
    });
    expect("token" in result).toBe(false);
  });

  it("rejects an already used email", async () => {
    const authRepository = createAuthRepositoryMock({
      userByEmail: createAuthUserRow(),
    });
    const service = createService({ authRepository });

    await expect(
      service.register({
        email: "client@mpm.test",
        password: "clear-password",
        turnstileToken: "turnstile-token",
      })
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(authRepository.createUser).not.toHaveBeenCalled();
  });
});

describe("AuthService login", () => {
  beforeEach(() => {
    vi.mocked(jwt.sign).mockReturnValue("signed-jwt-token");
  });

  it("rejects unknown email", async () => {
    const service = createService({
      authRepository: createAuthRepositoryMock({ userByEmail: null }),
    });

    await expect(
      service.login({ email: "missing@mpm.test", password: "password" })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects wrong password", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false);
    const service = createService({
      authRepository: createAuthRepositoryMock({
        userByEmail: createAuthUserRow(),
      }),
    });

    await expect(
      service.login({ email: "client@mpm.test", password: "wrong-password" })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects unverified email", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    const service = createService({
      authRepository: createAuthRepositoryMock({
        userByEmail: createAuthUserRow({ email_verified_at: null }),
      }),
    });

    await expect(
      service.login({ email: "client@mpm.test", password: "password" })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("returns public user and token for verified users", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    const verifiedAt = new Date("2026-01-15T10:30:00.000Z");
    const service = createService({
      authRepository: createAuthRepositoryMock({
        userByEmail: createAuthUserRow({ email_verified_at: verifiedAt }),
      }),
    });

    const result = await service.login({
      email: "client@mpm.test",
      password: "password",
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      { role: "user", userId: 7 },
      "unit-test-jwt-secret",
      { expiresIn: "7d" }
    );
    expect(result).toEqual({
      token: "signed-jwt-token",
      user: {
        addressLine1: null,
        addressLine2: null,
        city: null,
        country: "France",
        email: "client@mpm.test",
        emailVerifiedAt: verifiedAt,
        firstName: "Ada",
        id: 7,
        lastName: "Lovelace",
        phone: null,
        postalCode: null,
        role: "user",
      },
    });
  });
});

describe("AuthService verifyEmail", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:30:00.000Z"));
  });

  it("rejects invalid or expired verification tokens", async () => {
    const invalidService = createService({
      authRepository: createAuthRepositoryMock({ emailVerificationUser: null }),
    });
    const expiredService = createService({
      authRepository: createAuthRepositoryMock({
        emailVerificationUser: createEmailVerificationUserRow({
          email_verification_expires_at: new Date("2026-01-01T00:00:00.000Z"),
        }),
      }),
    });

    await expect(invalidService.verifyEmail({ token: "invalid" })).rejects.toBeInstanceOf(
      BadRequestError
    );
    await expect(expiredService.verifyEmail({ token: "expired" })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("marks a valid verification token as verified and lets repository clear token fields", async () => {
    const authRepository = createAuthRepositoryMock({
      emailVerificationUser: createEmailVerificationUserRow(),
    });
    const service = createService({ authRepository });

    await service.verifyEmail({ token: "valid-token" });

    expect(authRepository.findUserByEmailVerificationTokenHash).toHaveBeenCalledWith(
      expect.any(String)
    );
    expect(authRepository.markEmailAsVerified).toHaveBeenCalledWith(7);
  });
});

describe("AuthService forgotPassword", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:30:00.000Z"));
    mockCryptoRandomBytes("cd".repeat(32));
  });

  it("does not reveal whether an email exists", async () => {
    const authRepository = createAuthRepositoryMock({ userByEmail: null });
    const emailService = createEmailServiceMock();
    const service = createService({ authRepository, emailService });

    await expect(
      service.forgotPassword({ email: "missing@mpm.test" })
    ).resolves.toBeUndefined();
    expect(authRepository.savePasswordResetToken).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("creates reset token and sends reset email when user exists", async () => {
    const authRepository = createAuthRepositoryMock({
      userByEmail: createAuthUserRow(),
    });
    const emailService = createEmailServiceMock();
    const service = createService({ authRepository, emailService });

    await service.forgotPassword({ email: "client@mpm.test" });

    expect(authRepository.savePasswordResetToken).toHaveBeenCalledWith({
      expiresAt: new Date("2026-01-15T11:30:00.000Z"),
      tokenHash: expect.any(String),
      userId: 7,
    });
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith({
      email: "client@mpm.test",
      firstName: "Ada",
      resetUrl: "https://mpm.test/reset-password?token=" + "cd".repeat(32),
    });
  });
});

describe("AuthService resetPassword", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:30:00.000Z"));
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-new-password");
  });

  it("rejects invalid or expired reset tokens", async () => {
    const invalidService = createService({
      authRepository: createAuthRepositoryMock({ passwordResetUser: null }),
    });
    const expiredService = createService({
      authRepository: createAuthRepositoryMock({
        passwordResetUser: createPasswordResetUserRow({
          password_reset_expires_at: new Date("2026-01-01T00:00:00.000Z"),
        }),
      }),
    });

    await expect(
      invalidService.resetPassword({ password: "new-password", token: "invalid" })
    ).rejects.toBeInstanceOf(BadRequestError);
    await expect(
      expiredService.resetPassword({ password: "new-password", token: "expired" })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("hashes new password and lets repository clear reset token fields", async () => {
    const authRepository = createAuthRepositoryMock({
      passwordResetUser: createPasswordResetUserRow(),
    });
    const service = createService({ authRepository });

    await service.resetPassword({
      password: "new-password",
      token: "valid-reset-token",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("new-password", 10);
    expect(authRepository.updatePasswordAndClearResetToken).toHaveBeenCalledWith({
      passwordHash: "hashed-new-password",
      userId: 7,
    });
  });
});
