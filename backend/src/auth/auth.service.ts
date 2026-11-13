import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { asRecord, badRequest, text } from '../common/input';
import { hashPassword, verifyPassword } from './password';
import { tr } from '../common/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

const PUBLIC_USER = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  language: true,
  createdAt: true,
} as const;

function passwordErrors(password: string, isNew = false): string[] {
  const label = isNew
    ? tr('Le nouveau mot de passe', 'The new password')
    : tr('Le mot de passe', 'The password');
  if (password.length < PASSWORD_MIN)
    return [
      tr(
        `${label} doit contenir au moins ${PASSWORD_MIN} caractères`,
        `${label} must contain at least ${PASSWORD_MIN} characters`,
      ),
    ];
  if (password.length > PASSWORD_MAX)
    return [
      tr(
        `${label} est trop long (${PASSWORD_MAX} caractères maximum)`,
        `${label} is too long (${PASSWORD_MAX} characters maximum)`,
      ),
    ];
  return [];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(body: unknown) {
    const b = asRecord(body);
    const email = text(b.email).toLowerCase();
    const password = typeof b.password === 'string' ? b.password : '';
    const firstName = text(b.firstName);
    const lastName = text(b.lastName);
    const phone = text(b.phone) || null;
    const language = b.language === 'EN' ? 'EN' : 'FR';

    const errors: string[] = [];
    if (!EMAIL_RE.test(email))
      errors.push(tr('Adresse email invalide', 'Invalid email address'));
    errors.push(...passwordErrors(password));
    if (!firstName)
      errors.push(tr('Le prénom est requis', 'First name is required'));
    if (!lastName)
      errors.push(tr('Le nom est requis', 'Last name is required'));
    if (errors.length) throw badRequest(...errors);

    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException(
        tr(
          'Un compte existe déjà avec cet email',
          'An account already exists with this email',
        ),
      );

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        firstName,
        lastName,
        phone,
        language,
      },
      select: PUBLIC_USER,
    });

    return this.session(user);
  }

  async login(body: unknown) {
    const b = asRecord(body);
    const email = text(b.email).toLowerCase();
    const password = typeof b.password === 'string' ? b.password : '';

    const found = await this.prisma.user.findUnique({
      where: { email },
      select: { ...PUBLIC_USER, passwordHash: true },
    });
    const invalid = new UnauthorizedException(
      tr('Email ou mot de passe incorrect', 'Incorrect email or password'),
    );
    if (!found) throw invalid;

    const { passwordHash, ...user } = found;
    if (!(await verifyPassword(password, passwordHash))) throw invalid;
    return this.session(user);
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER,
    });
    if (!user)
      throw new UnauthorizedException(
        tr('Compte introuvable', 'Account not found'),
      );
    return user;
  }

  async updateProfile(userId: number, body: unknown) {
    const b = asRecord(body);
    const firstName = text(b.firstName);
    const lastName = text(b.lastName);
    const phone = text(b.phone);
    const currentPassword =
      typeof b.currentPassword === 'string' ? b.currentPassword : '';
    const newPassword = typeof b.newPassword === 'string' ? b.newPassword : '';

    const errors: string[] = [];
    if (b.firstName !== undefined && !firstName)
      errors.push(
        tr('Le prénom ne peut pas être vide', 'First name cannot be empty'),
      );
    if (b.lastName !== undefined && !lastName)
      errors.push(
        tr('Le nom ne peut pas être vide', 'Last name cannot be empty'),
      );
    if (newPassword) {
      errors.push(...passwordErrors(newPassword, true));
      if (!currentPassword)
        errors.push(
          tr(
            'Le mot de passe actuel est requis pour définir un nouveau mot de passe',
            'The current password is required to set a new password',
          ),
        );
    }
    if (errors.length) throw badRequest(...errors);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user)
      throw new UnauthorizedException(
        tr('Compte introuvable', 'Account not found'),
      );

    const data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      passwordHash?: string;
    } = {};
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (b.phone !== undefined) data.phone = phone || null;

    if (newPassword) {
      if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        throw badRequest(
          tr(
            'Le mot de passe actuel est incorrect',
            'The current password is incorrect',
          ),
        );
      }
      data.passwordHash = await hashPassword(newPassword);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: PUBLIC_USER,
    });
  }

  private async session<U extends { id: number }>(user: U) {
    const accessToken = await this.jwt.signAsync({ sub: user.id });
    return { accessToken, user };
  }
}
