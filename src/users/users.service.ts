import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashService } from 'src/hash/hash.service';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private hashServise: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username } = createUserDto;

    const existUser = await this.usersRepository.find({
      where: [{ email: email }, { username: username }],
    });

    if (existUser.length !== 0) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }

    const hash = await this.hashServise.hash(createUserDto.password);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hash,
    });

    return this.usersRepository.save(newUser);
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    return this.usersRepository.findOne(query);
  }

  async findByUsername(username: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user;
  }

  findMany(query: string) {
    return this.usersRepository.find({
      where: [{ email: query }, { username: query }],
    });
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashServise.hash(
        updateUserDto.password,
      );
    }
    return this.usersRepository.update({ id }, updateUserDto);
  }

  async removeOne(id: number) {
    return this.usersRepository.delete({ id });
  }
}
