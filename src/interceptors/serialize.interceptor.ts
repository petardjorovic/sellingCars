import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { SERIALIZE_DTO } from '../decorators/serialize.decorator';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    //* Run something before a request is handled
    //* by request handler
    // console.log('I am running before the handler', context);
    const dto = this.reflector.getAllAndOverride(SERIALIZE_DTO, [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      map((data) => {
        if (!dto) {
          return data;
        }
        return plainToInstance(dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
