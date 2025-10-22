import { Test, TestingModule } from '@nestjs/testing';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { BranchStatus } from '@prisma/client';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchQueryDto } from './dto/branch-query.dto';
import { AssignUserDto } from './dto/assign-user.dto';

describe('BranchesController', () => {
  let controller: BranchesController;
  let service: BranchesService;

  const mockBranchesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    assignUser: jest.fn(),
    unassignUser: jest.fn(),
    findUsersByBranch: jest.fn(),
    findAvailableUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchesController],
      providers: [
        {
          provide: BranchesService,
          useValue: mockBranchesService,
        },
      ],
    }).compile();

    controller = module.get<BranchesController>(BranchesController);
    service = module.get<BranchesService>(BranchesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a branch', async () => {
      const createDto: CreateBranchDto = {
        name: 'Sucursal Central',
        code: 'SUC-001',
        address: 'Av. Principal 123',
      };

      const expectedResult = {
        id: '123',
        ...createDto,
        status: BranchStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBranchesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated branches', async () => {
      const query: BranchQueryDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        data: [
          {
            id: '123',
            name: 'Sucursal Central',
            status: BranchStatus.ACTIVE,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockBranchesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a branch by id', async () => {
      const branchId = '123';
      const expectedResult = {
        id: branchId,
        name: 'Sucursal Central',
        status: BranchStatus.ACTIVE,
      };

      mockBranchesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(branchId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(branchId);
    });
  });

  describe('update', () => {
    it('should update a branch', async () => {
      const branchId = '123';
      const updateDto: UpdateBranchDto = {
        name: 'Sucursal Central Actualizada',
      };

      const expectedResult = {
        id: branchId,
        name: 'Sucursal Central Actualizada',
        status: BranchStatus.ACTIVE,
      };

      mockBranchesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(branchId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(branchId, updateDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a branch', async () => {
      const branchId = '123';
      const expectedResult = {
        id: branchId,
        name: 'Sucursal Central',
        status: BranchStatus.DELETED,
      };

      mockBranchesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(branchId);

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(branchId);
    });
  });

  describe('assignUser', () => {
    it('should assign a user to a branch', async () => {
      const branchId = '123';
      const assignUserDto: AssignUserDto = {
        userId: '456',
      };

      mockBranchesService.assignUser.mockResolvedValue(undefined);

      const result = await controller.assignUser(branchId, assignUserDto);

      expect(result).toEqual({ message: 'Usuario asignado exitosamente' });
      expect(service.assignUser).toHaveBeenCalledWith(
        branchId,
        assignUserDto.userId,
      );
    });
  });

  describe('unassignUser', () => {
    it('should unassign a user from a branch', async () => {
      const branchId = '123';
      const userId = '456';

      mockBranchesService.unassignUser.mockResolvedValue(undefined);

      const result = await controller.unassignUser(branchId, userId);

      expect(result).toEqual({ message: 'Usuario desasignado exitosamente' });
      expect(service.unassignUser).toHaveBeenCalledWith(branchId, userId);
    });
  });

  describe('findUsersByBranch', () => {
    it('should return paginated users for a branch', async () => {
      const branchId = '123';
      const page = 1;
      const limit = 10;

      const expectedResult = {
        data: [
          {
            id: '456',
            fullName: 'Juan Pérez',
            email: 'juan@stl.com',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockBranchesService.findUsersByBranch.mockResolvedValue(expectedResult);

      const result = await controller.findUsersByBranch(branchId, page, limit);

      expect(result).toEqual(expectedResult);
      expect(service.findUsersByBranch).toHaveBeenCalledWith(
        branchId,
        page,
        limit,
      );
    });
  });

  describe('findAvailableUsers', () => {
    it('should return available users for assignment', async () => {
      const branchId = '123';
      const page = 1;
      const limit = 10;

      const expectedResult = {
        data: [
          {
            id: '789',
            fullName: 'María López',
            email: 'maria@stl.com',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockBranchesService.findAvailableUsers.mockResolvedValue(expectedResult);

      const result = await controller.findAvailableUsers(branchId, page, limit);

      expect(result).toEqual(expectedResult);
      expect(service.findAvailableUsers).toHaveBeenCalledWith(
        branchId,
        page,
        limit,
      );
    });
  });
});
