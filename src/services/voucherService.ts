import { Voucher, IVoucherDocument } from '../models/Voucher';
import { IVoucher } from '../types';

export class VoucherService {
  private generateVoucherCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createVoucher(data: Partial<IVoucher>): Promise<IVoucherDocument> {
    const code = data.code || this.generateVoucherCode();
    const existing = await Voucher.findOne({ code: code.toUpperCase() });
    if (existing) {
      throw new Error('Voucher code already exists');
    }

    const voucher = new Voucher({
      ...data,
      code: code.toUpperCase(),
      usedCount: 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return await voucher.save();
  }


  async getVouchers(filters?: { isActive?: boolean }): Promise<IVoucherDocument[]> {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    return await Voucher.find(query).sort({ createdAt: -1 });
  }

  async getVoucherByCode(code: string): Promise<IVoucherDocument | null> {
    return await Voucher.findOne({ code: code.toUpperCase() });
  }

  async getVoucherById(id: string): Promise<IVoucherDocument | null> {
    return await Voucher.findById(id);
  }

  async updateVoucher(
    id: string,
    data: Partial<IVoucher>
  ): Promise<IVoucherDocument | null> {
    if (data.code) {
      const existing = await Voucher.findOne({
        code: data.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new Error('Voucher code already exists');
      }
      data.code = data.code.toUpperCase();
    }

    return await Voucher.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteVoucher(id: string): Promise<boolean> {
    const result = await Voucher.findByIdAndDelete(id);
    return !!result;
  }

  async validateVoucher(
    code: string,
    orderSubtotal: number
  ): Promise<{ valid: boolean; voucher: IVoucherDocument | null; error?: string }> {
    const voucher = await this.getVoucherByCode(code);
    
    if (!voucher) {
      return { valid: false, voucher: null, error: 'Voucher not found' };
    }

    if (!voucher.isActive) {
      return { valid: false, voucher, error: 'Voucher is not active' };
    }

    const now = new Date();
    if (voucher.expirationDate < now) {
      return { valid: false, voucher, error: 'Voucher has expired' };
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return { valid: false, voucher, error: 'Voucher usage limit exceeded' };
    }

    if (voucher.minimumOrderValue && orderSubtotal < voucher.minimumOrderValue) {
      return {
        valid: false,
        voucher,
        error: `Minimum order value of ${voucher.minimumOrderValue} required`,
      };
    }

    return { valid: true, voucher };
  }


  async incrementUsage(code: string): Promise<void> {
    await Voucher.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  }
}

