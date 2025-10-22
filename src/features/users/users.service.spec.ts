import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, UserStatus, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    branch: {
      findUnique: jest.fn(),
    },
    userBranch: {
      create: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.DOCTOR,
        gender: Gender.MALE,
        password: 'Password123!',
      };

      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const expectedUser = {
        id: '123',
        ...createDto,
        password: hashedPassword,
        status: UserStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        specialization: null,
        defaultBranch: null,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(result.email).toBe(createDto.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto = {
        email: 'existing@example.com',
        fullName: 'Test User',
        role: UserRole.DOCTOR,
        gender: Gender.MALE,
        password: 'Password123!',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: '456',
        email: createDto.email,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user with branches', async () => {
      const userId = '123';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.DOCTOR,
        gender: Gender.MALE,
        status: UserStatus.ACTIVE,
        userBranches: [
          {
            branch: {
              id: 'branch1',
              name: 'Branch 1',
              code: 'B1',
              city: 'Lima',
            },
          },
        ],
        specialization: null,
        defaultBranch: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId);

      expect(result.id).toBe(userId);
      expect(result.branches).toHaveLength(1);
      expect(result.totalBranches).toBe(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change password if current password is correct', async () => {
      const userId = '123';
      const changePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      const user = {
        id: userId,
        password: 'hashedOldPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.changePassword(userId, changePasswordDto);

      expect(result.message).toBe('Contraseña actualizada exitosamente');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        user.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        changePasswordDto.newPassword,
        10,
      );
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const userId = '123';
      const changePasswordDto = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('assignBranches', () => {
    it('should assign multiple branches to a user', async () => {
      const userId = '123';
      const branchIds = ['branch1', 'branch2'];
      const assignBranchesDto = { branchIds };

      const user = {
        id: userId,
        userBranches: [],
        specialization: null,
        defaultBranch: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.branch.findUnique.mockResolvedValue({ id: 'branch1' });
      mockPrismaService.userBranch.createMany.mockResolvedValue({ count: 2 });

      const result = await service.assignBranches(userId, assignBranchesDto);

      expect(result.assigned).toBe(2);
      expect(result.message).toBe('Sucursales asignadas exitosamente');
    });

    it('should throw NotFoundException if branch does not exist', async () => {
      const userId = '123';
      const branchIds = ['nonexistent'];
      const assignBranchesDto = { branchIds };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        userBranches: [],
      });
      mockPrismaService.branch.findUnique.mockResolvedValue(null);

      await expect(
        service.assignBranches(userId, assignBranchesDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setDefaultBranch', () => {
    it('should set default branch if user is assigned to it', async () => {
      const userId = '123';
      const branchId = 'branch1';
      const setDefaultBranchDto = { branchId };

      const user = {
        id: userId,
        userBranches: [],
        specialization: null,
        defaultBranch: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.branch.findUnique.mockResolvedValue({ id: branchId });
      mockPrismaService.userBranch.findUnique.mockResolvedValue({
        userId,
        branchId,
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...user,
        defaultBranchId: branchId,
      });

      const result = await service.setDefaultBranch(userId, setDefaultBranchDto);

      expect(result.defaultBranchId).toBe(branchId);
    });

    it('should throw BadRequestException if user is not assigned to branch', async () => {
      const userId = '123';
      const branchId = 'branch1';
      const setDefaultBranchDto = { branchId };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        userBranches: [],
      });
      mockPrismaService.branch.findUnique.mockResolvedValue({ id: branchId });
      mockPrismaService.userBranch.findUnique.mockResolvedValue(null);

      await expect(
        service.setDefaultBranch(userId, setDefaultBranchDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
