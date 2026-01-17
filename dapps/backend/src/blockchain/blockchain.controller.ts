import { Body, Controller, Get, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { GetEventDto } from './dto/get-event.dto';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('value')
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  // GET /blockchain/events
  @Post('events')
  async getEvents(@Body() body: GetEventDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.blockchainService.getValueUpdatedEvents(
      body.fromBlock, 
      body.toBlock );
  }
}
