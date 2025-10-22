import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole, UserStatus, Gender } from '@prisma/client';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  ChangePasswordDto,
  ResetPasswordDto,
  ChangeStatusDto,
  AssignBranchesDto,
  SetDefaultBranchDto,
} from './dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    changePassword: jest.fn(),
    resetPassword: jest.fn(),
    changeStatus: jest.fn(),
    assignBranches: jest.fn(),
    removeBranch: jest.fn(),
    getUserBranches: jest.fn(),
    setDefaultBranch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.DOCTOR,
        gender: Gender.MALE,
        password: 'Password123!',
      };

      const expectedResult = {
        id: '123',
        email: createDto.email,
        fullName: createDto.fullName,
        role: createDto.role,
        gender: createDto.gender,
        status: UserStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query: UserQueryDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        data: [
          {
            id: '123',
            email: 'test@example.com',
            fullName: 'Test User',
            role: UserRole.DOCTOR,
            gender: Gender.MALE,
            status: UserStatus.ACTIVE,
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

      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a user with branches', async () => {
      const userId = '123';
      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.DOCTOR,
        gender: Gender.MALE,
        status: UserStatus.ACTIVE,
        branches: [],
        totalBranches: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(userId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '123';
      const updateDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };

      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Updated Name',
        role: UserRole.DOCTOR,
        gender: Gender.MALE,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(userId, updateDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const userId = '123';
      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.DOCTOR,
        gender: Gender.MALE,
        status: UserStatus.DELETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(userId);

      expect(result.status).toBe(UserStatus.DELETED);
      expect(service.remove).toHaveBeenCalledWith(userId);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const userId = '123';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      const expectedResult = {
        message: 'Contraseña actualizada exitosamente',
      };

      mockUsersService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(userId, changePasswordDto);

      expect(result).toEqual(expectedResult);
      expect(service.changePassword).toHaveBeenCalledWith(
        userId,
        changePasswordDto,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const userId = '123';
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'NewPassword123!',
      };

      const expectedResult = {
        message: 'Contraseña reseteada exitosamente',
      };

      mockUsersService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(userId, resetPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(service.resetPassword).toHaveBeenCalledWith(
        userId,
        resetPasswordDto,
      );
    });
  });

  describe('changeStatus', () => {
    it('should change user status', async () => {
      const userId = '123';
      const changeStatusDto: ChangeStatusDto = {
        status: UserStatus.INACTIVE,
      };

      const expectedResult = {
        id: userId,
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.changeStatus.mockResolvedValue(expectedResult);

      const result = await controller.changeStatus(userId, changeStatusDto);

      expect(result.status).toBe(UserStatus.INACTIVE);
      expect(service.changeStatus).toHaveBeenCalledWith(userId, changeStatusDto);
    });
  });

  describe('assignBranches', () => {
    it('should assign branches to a user', async () => {
      const userId = '123';
      const assignBranchesDto: AssignBranchesDto = {
        branchIds: ['branch1', 'branch2'],
      };

      const expectedResult = {
        message: 'Sucursales asignadas exitosamente',
        assigned: 2,
      };

      mockUsersService.assignBranches.mockResolvedValue(expectedResult);

      const result = await controller.assignBranches(userId, assignBranchesDto);

      expect(result.assigned).toBe(2);
      expect(service.assignBranches).toHaveBeenCalledWith(
        userId,
        assignBranchesDto,
      );
    });
  });

  describe('removeBranch', () => {
    it('should remove a branch from a user', async () => {
      const userId = '123';
      const branchId = 'branch1';

      const expectedResult = {
        message: 'Sucursal desasignada exitosamente',
      };

      mockUsersService.removeBranch.mockResolvedValue(expectedResult);

      const result = await controller.removeBranch(userId, branchId);

      expect(result).toEqual(expectedResult);
      expect(service.removeBranch).toHaveBeenCalledWith(userId, branchId);
    });
  });

  describe('getUserBranches', () => {
    it('should return user branches', async () => {
      const userId = '123';
      const page = 1;
      const limit = 10;

      const expectedResult = {
        data: [
          {
            id: 'branch1',
            name: 'Branch 1',
            code: 'B1',
            city: 'Lima',
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

      mockUsersService.getUserBranches.mockResolvedValue(expectedResult);

      const result = await controller.getUserBranches(userId, page, limit);

      expect(result).toEqual(expectedResult);
      expect(service.getUserBranches).toHaveBeenCalledWith(userId, page, limit);
    });
  });

  describe('setDefaultBranch', () => {
    it('should set default branch for user', async () => {
      const userId = '123';
      const setDefaultBranchDto: SetDefaultBranchDto = {
        branchId: 'branch1',
      };

      const expectedResult = {
        id: userId,
        defaultBranchId: 'branch1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.setDefaultBranch.mockResolvedValue(expectedResult);

      const result = await controller.setDefaultBranch(
        userId,
        setDefaultBranchDto,
      );

      expect(result.defaultBranchId).toBe('branch1');
      expect(service.setDefaultBranch).toHaveBeenCalledWith(
        userId,
        setDefaultBranchDto,
      );
    });
  });
});
