import { VoucherService } from '../voucherService';
import { Voucher } from '../../models/Voucher';
import { DiscountType } from '../../types';

jest.mock('../../models/Voucher');

describe('VoucherService', () => {
  let voucherService: VoucherService;
  const mockVoucher = {
    _id: 'voucher-id',
    code: 'TESTCODE',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    expirationDate: new Date('2025-12-31'),
    usageLimit: 100,
    usedCount: 0,
    minimumOrderValue: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  beforeEach(() => {
    voucherService = new VoucherService();
    jest.clearAllMocks();
  });

  describe('createVoucher', () => {
    it('should create a voucher with provided code', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(null);
      (Voucher as any).mockImplementation((data: any) => ({
        ...mockVoucher,
        ...data,
        save: jest.fn().mockResolvedValue({ ...mockVoucher, ...data }),
      }));

      const data = {
        code: 'NEWCODE',
        discountType: DiscountType.FIXED,
        discountValue: 20,
        expirationDate: new Date('2025-12-31'),
        usageLimit: 50,
      };

      const result = await voucherService.createVoucher(data);

      expect(Voucher.findOne).toHaveBeenCalledWith({ code: 'NEWCODE' });
      expect(result.code).toBe('NEWCODE');
      expect(result.discountType).toBe(DiscountType.FIXED);
    });

    it('should generate a code if not provided', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(null);
      (Voucher as any).mockImplementation((data: any) => ({
        ...mockVoucher,
        code: data.code || 'GENERATED',
        save: jest.fn().mockResolvedValue({ ...mockVoucher, code: data.code || 'GENERATED' }),
      }));

      const data = {
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
        expirationDate: new Date('2025-12-31'),
        usageLimit: 100,
      };

      const result = await voucherService.createVoucher(data);

      expect(result.code).toBeDefined();
      expect(result.usedCount).toBe(0);
      expect(result.isActive).toBe(true);
    });

    it('should throw error if code already exists', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(mockVoucher);

      const data = {
        code: 'TESTCODE',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        expirationDate: new Date('2025-12-31'),
        usageLimit: 100,
      };

      await expect(voucherService.createVoucher(data)).rejects.toThrow(
        'Voucher code already exists'
      );
    });
  });

  describe('getVouchers', () => {
    it('should return all vouchers when no filter provided', async () => {
      (Voucher.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockVoucher]),
      });

      const result = await voucherService.getVouchers();

      expect(Voucher.find).toHaveBeenCalledWith({});
      expect(result).toEqual([mockVoucher]);
    });

    it('should filter by isActive when provided', async () => {
      (Voucher.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockVoucher]),
      });

      await voucherService.getVouchers({ isActive: true });

      expect(Voucher.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('getVoucherByCode', () => {
    it('should return voucher by code', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(mockVoucher);

      const result = await voucherService.getVoucherByCode('testcode');

      expect(Voucher.findOne).toHaveBeenCalledWith({ code: 'TESTCODE' });
      expect(result).toEqual(mockVoucher);
    });

    it('should return null if voucher not found', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(null);

      const result = await voucherService.getVoucherByCode('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getVoucherById', () => {
    it('should return voucher by id', async () => {
      (Voucher.findById as jest.Mock).mockResolvedValue(mockVoucher);

      const result = await voucherService.getVoucherById('voucher-id');

      expect(Voucher.findById).toHaveBeenCalledWith('voucher-id');
      expect(result).toEqual(mockVoucher);
    });
  });

  describe('updateVoucher', () => {
    it('should update voucher successfully', async () => {
      const updatedVoucher = { ...mockVoucher, discountValue: 25 };
      (Voucher.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedVoucher);
      (Voucher.findOne as jest.Mock).mockResolvedValue(null);

      const result = await voucherService.updateVoucher('voucher-id', {
        discountValue: 25,
      });

      expect(result).toEqual(updatedVoucher);
    });

    it('should throw error if new code already exists', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(mockVoucher);

      await expect(
        voucherService.updateVoucher('voucher-id', { code: 'EXISTING' })
      ).rejects.toThrow('Voucher code already exists');
    });
  });

  describe('deleteVoucher', () => {
    it('should delete voucher and return true', async () => {
      (Voucher.findByIdAndDelete as jest.Mock).mockResolvedValue(mockVoucher);

      const result = await voucherService.deleteVoucher('voucher-id');

      expect(result).toBe(true);
      expect(Voucher.findByIdAndDelete).toHaveBeenCalledWith('voucher-id');
    });

    it('should return false if voucher not found', async () => {
      (Voucher.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await voucherService.deleteVoucher('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('validateVoucher', () => {
    it('should return valid for a valid voucher', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(mockVoucher);

      const result = await voucherService.validateVoucher('TESTCODE', 100);

      expect(result.valid).toBe(true);
      expect(result.voucher).toEqual(mockVoucher);
    });

    it('should return invalid if voucher not found', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(null);

      const result = await voucherService.validateVoucher('INVALID', 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Voucher not found');
    });

    it('should return invalid if voucher is not active', async () => {
      const inactiveVoucher = { ...mockVoucher, isActive: false };
      (Voucher.findOne as jest.Mock).mockResolvedValue(inactiveVoucher);

      const result = await voucherService.validateVoucher('TESTCODE', 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Voucher is not active');
    });

    it('should return invalid if voucher has expired', async () => {
      const expiredVoucher = {
        ...mockVoucher,
        expirationDate: new Date('2020-01-01'),
      };
      (Voucher.findOne as jest.Mock).mockResolvedValue(expiredVoucher);

      const result = await voucherService.validateVoucher('TESTCODE', 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Voucher has expired');
    });

    it('should return invalid if usage limit exceeded', async () => {
      const limitExceededVoucher = {
        ...mockVoucher,
        usedCount: 100,
        usageLimit: 100,
      };
      (Voucher.findOne as jest.Mock).mockResolvedValue(limitExceededVoucher);

      const result = await voucherService.validateVoucher('TESTCODE', 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Voucher usage limit exceeded');
    });

    it('should return invalid if order value is below minimum', async () => {
      (Voucher.findOne as jest.Mock).mockResolvedValue(mockVoucher);

      const result = await voucherService.validateVoucher('TESTCODE', 30);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum order value');
    });
  });

  describe('incrementUsage', () => {
    it('should increment voucher usage count', async () => {
      (Voucher.findOneAndUpdate as jest.Mock).mockResolvedValue(mockVoucher);

      await voucherService.incrementUsage('testcode');

      expect(Voucher.findOneAndUpdate).toHaveBeenCalledWith(
        { code: 'TESTCODE' },
        { $inc: { usedCount: 1 } }
      );
    });
  });
});

