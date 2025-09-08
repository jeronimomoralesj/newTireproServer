import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { IncomeService } from '../income/income.service';

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly incomeService: IncomeService
  ) {}

  async create(dto: CreateTripDto) {
  console.log('=== TRIP CREATION START ===');
  console.log('1. Received DTO:', JSON.stringify(dto, null, 2));

  try {
    return await this.prisma.$transaction(async (tx) => {
      // Serialize DTO -> plain JSON
      const trip = await tx.trip.create({
        data: {
          title: dto.title,
          date: new Date(dto.date),
          company: dto.company,
          paymentType: dto.paymentType,
          amount: dto.amount,
          paymentStructure: dto.paymentStructure ? JSON.parse(JSON.stringify(dto.paymentStructure)) : undefined,
          startCoords: dto.startCoords ? JSON.parse(JSON.stringify(dto.startCoords)) : undefined,
          endCoords: dto.endCoords ? JSON.parse(JSON.stringify(dto.endCoords)) : undefined,
          startLocation: dto.startLocation,
          endLocation: dto.endLocation,
          userId: dto.userId,
          companyId: dto.companyId,
        },
      });

      console.log('Trip created successfully:', trip);

      // 💰 Income creation logic stays the same
      if (dto.paymentType === 'full' && dto.amount && dto.amount > 0) {
        const incomeData = {
          tripId: trip.id,
          amount: dto.amount,
          title: `Full Payment: ${dto.title}`,
          description: `Full payment received for trip: ${dto.title}`,
          date: dto.date,
          companyPaying: dto.company,
          type: 'full_payment',
          userId: dto.userId,
          companyId: dto.companyId,
        };

        await this.incomeService.create(incomeData, tx);
        console.log('Full payment income created');
      } else if (dto.paymentType === 'installments' && dto.paymentStructure?.installments) {
        for (let i = 0; i < dto.paymentStructure.installments.length; i++) {
          const installment = dto.paymentStructure.installments[i];
          if (installment.amount > 0) {
            const incomeData = {
              tripId: trip.id,
              amount: installment.amount,
              title: `Installment ${i + 1}: ${dto.title}`,
              description: `Installment ${i + 1} for trip: ${dto.title}`,
              date: installment.date,
              companyPaying: dto.company,
              type: 'installment',
              userId: dto.userId,
              companyId: dto.companyId,
            };

            await this.incomeService.create(incomeData, tx);
            console.log(`Installment ${i + 1} income created`);
          }
        }
      }

      return trip;
    });
  } catch (error) {
    console.error('=== TRANSACTION ERROR ===', error);
    throw error;
  }
}

  async findAll() {
    return this.prisma.trip.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }
    return trip;
  }

async update(id: string, updateTripDto: UpdateTripDto) {
  await this.findOne(id);
  return this.prisma.trip.update({
    where: { id },
    data: {
      ...(updateTripDto.title && { title: updateTripDto.title }),
      ...(updateTripDto.date && { date: new Date(updateTripDto.date) }),
      ...(updateTripDto.company && { company: updateTripDto.company }),
      ...(updateTripDto.paymentType && { paymentType: updateTripDto.paymentType }),
      ...(updateTripDto.amount !== undefined && { amount: updateTripDto.amount }),
      ...(updateTripDto.paymentStructure && { 
        paymentStructure: JSON.parse(JSON.stringify(updateTripDto.paymentStructure)) 
      }),
      ...(updateTripDto.startCoords && { 
        startCoords: JSON.parse(JSON.stringify(updateTripDto.startCoords)) 
      }),
      ...(updateTripDto.endCoords && { 
        endCoords: JSON.parse(JSON.stringify(updateTripDto.endCoords)) 
      }),
      ...(updateTripDto.startLocation && { startLocation: updateTripDto.startLocation }),
      ...(updateTripDto.endLocation && { endLocation: updateTripDto.endLocation }),
      ...(updateTripDto.userId && { userId: updateTripDto.userId }),
      ...(updateTripDto.companyId && { companyId: updateTripDto.companyId }),
    },
  });
}

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.trip.delete({ where: { id } });
  }
}