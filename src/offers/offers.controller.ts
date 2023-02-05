import { Body, Controller, Header, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/types/types';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  @Header('Content-Type', 'application/json')
  create(@Body() createOfferDto: CreateOfferDto, @Req() req: RequestWithUser) {
    return this.offersService.create(req.user, createOfferDto);
  }
}
