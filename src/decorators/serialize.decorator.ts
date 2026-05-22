import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
import { ClassConstructor } from 'class-transformer';

export const SERIALIZE_DTO = 'serialize_dto';

export function Serialize(dto: ClassConstructor<any>) {
  return applyDecorators(
    SetMetadata(SERIALIZE_DTO, dto),
    UseInterceptors(SerializeInterceptor),
  );
}
