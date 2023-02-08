import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-widh.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  findMany(query: FindManyOptions<Wish>) {
    return this.wishesRepository.find(query);
  }

  async create(owner: User, createWishDto: CreateWishDto): Promise<Wish> {
    delete owner.password;
    delete owner.email;
    const newWish = this.wishesRepository.create({
      ...createWishDto,
      owner: owner,
    });
    return this.wishesRepository.save(newWish);
  }

  async findOne(query: FindOneOptions<Wish>): Promise<Wish> {
    return this.wishesRepository.findOne(query);
  }

  async updateOne(updateWishDto: UpdateWishDto, id: string) {
    await this.wishesRepository.update(id, updateWishDto);
  }

  async getWishById(id: number) {
    const wish = await this.wishesRepository.findOne({
      where: [{ id: id }],
      relations: {
        owner: true,
        offers: {
          item: true,
          user: { offers: true, wishes: true, wishlists: true },
        },
      },
    });
    if (!wish) {
      throw new NotFoundException();
    }
    return wish;
  }

  removeById(id: number) {
    return this.wishesRepository.delete({ id });
  }

  async delete(id: number) {
    const wish = await this.findOne({
      where: { id: id },
      relations: {
        owner: true,
        offers: {
          item: true,
          user: { offers: true, wishes: true, wishlists: true },
        },
      },
    });
    if (!wish) {
      throw new NotFoundException();
    }
    await this.removeById(id);
    return wish;
  }
}
