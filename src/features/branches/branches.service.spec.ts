import { Test, TestingModule } from '@nestjs/testing';
import { BranchesService } from './branches.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BranchStatus } from '@prisma/client';

describe('BranchesService', () => {
  let service: BranchesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    branch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    userBranch: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a branch successfully', async () => {
      const createDto = {
        name: 'Sucursal Central',
        code: 'SUC-001',
        address: 'Av. Principal 123',
      };

      const expectedBranch = {
        id: '123',
        ...createDto,
        status: BranchStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.branch.findFirst.mockResolvedValue(null);
      mockPrismaService.branch.create.mockResolvedValue(expectedBranch);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedBranch);
      expect(mockPrismaService.branch.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if code already exists', async () => {
      const createDto = {
        name: 'Sucursal Central',
        code: 'SUC-001',
      };

      mockPrismaService.branch.findFirst.mockResolvedValue({
        id: '456',
        code: 'SUC-001',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a branch by id', async () => {
      const expectedBranch = {
        id: '123',
        name: 'Sucursal Central',
        status: BranchStatus.ACTIVE,
      };

      mockPrismaService.branch.findUnique.mockResolvedValue(expectedBranch);

      const result = await service.findOne('123');

      expect(result).toEqual(expectedBranch);
      expect(mockPrismaService.branch.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should throw NotFoundException if branch not found', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a branch successfully', async () => {
      const updateDto = {
        name: 'Sucursal Central Actualizada',
      };

      const existingBranch = {
        id: '123',
        name: 'Sucursal Central',
        status: BranchStatus.ACTIVE,
      };

      const updatedBranch = {
        ...existingBranch,
        ...updateDto,
      };

      mockPrismaService.branch.findUnique.mockResolvedValue(existingBranch);
      mockPrismaService.branch.update.mockResolvedValue(updatedBranch);

      const result = await service.update('123', updateDto);

      expect(result).toEqual(updatedBranch);
      expect(mockPrismaService.branch.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a branch', async () => {
      const existingBranch = {
        id: '123',
        name: 'Sucursal Central',
        status: BranchStatus.ACTIVE,
      };

      const deletedBranch = {
        ...existingBranch,
        status: BranchStatus.DELETED,
      };

      mockPrismaService.branch.findUnique.mockResolvedValue(existingBranch);
      mockPrismaService.branch.update.mockResolvedValue(deletedBranch);

      const result = await service.remove('123');

      expect(result.status).toBe(BranchStatus.DELETED);
      expect(mockPrismaService.branch.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { status: BranchStatus.DELETED },
      });
    });
  });

  describe('assignUser', () => {
    it('should assign a user to a branch', async () => {
      const branchId = '123';
      const userId = '456';

      const branch = { id: branchId, name: 'Sucursal Central' };
      const user = { id: userId, fullName: 'Juan Pérez' };

      mockPrismaService.branch.findUnique.mockResolvedValue(branch);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.userBranch.findUnique.mockResolvedValue(null);
      mockPrismaService.userBranch.create.mockResolvedValue({});

      await service.assignUser(branchId, userId);

      expect(mockPrismaService.userBranch.create).toHaveBeenCalledWith({
        data: {
          userId,
          branchId,
        },
      });
    });

    it('should throw ConflictException if user is already assigned', async () => {
      const branchId = '123';
      const userId = '456';

      mockPrismaService.branch.findUnique.mockResolvedValue({ id: branchId });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.userBranch.findUnique.mockResolvedValue({
        id: '789',
        userId,
        branchId,
      });

      await expect(service.assignUser(branchId, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('unassignUser', () => {
    it('should unassign a user from a branch', async () => {
      const branchId = '123';
      const userId = '456';

      mockPrismaService.branch.findUnique.mockResolvedValue({ id: branchId });
      mockPrismaService.userBranch.findUnique.mockResolvedValue({
        id: '789',
        userId,
        branchId,
      });
      mockPrismaService.userBranch.delete.mockResolvedValue({});

      await service.unassignUser(branchId, userId);

      expect(mockPrismaService.userBranch.delete).toHaveBeenCalledWith({
        where: {
          userId_branchId: {
            userId,
            branchId,
          },
        },
      });
    });

    it('should throw NotFoundException if assignment does not exist', async () => {
      const branchId = '123';
      const userId = '456';

      mockPrismaService.branch.findUnique.mockResolvedValue({ id: branchId });
      mockPrismaService.userBranch.findUnique.mockResolvedValue(null);

      await expect(service.unassignUser(branchId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
