# NestJS + Prisma integration in Turborepo

The `schema.prisma` file inside `/packages/database/prisma` is brilliant for schema definitions and updates. And the `index.ts` file inside it `export * from '@prisma/client`, so it can be used in other places. However, this package could not be used with the NestJS application because it kept throwing `Unexpected token 'export'` error. Tried many places, but couldn’t find a proper solution that worked. So, created the following workaround for it.

1. Install `prisma` as a `devDependency` on the NestJS application.
2. Install `@prisma/client` as a `dependency` on the NestJS application.
3. Add a script to generate the `PrismaClient` using the `schema.prisma` file inside `/packages/database/prisma`.
    
    ```json
    {
      "scripts": {
        "prisma:generate": "prisma generate --schema=../../packages/database/prisma/schema.prisma"
      }
    }
    ```
    
4. Add the database  URL into the .env file inside the NestJS application.
    
    ```json

    DATABASE_URL="postgresql://user:password@host:5432/postgres"

    ```
    
5. Run `prisma:generate` script after schema changes.
6. Create `PrismaService` in the NestJS application.
    
    ```tsx
    import { Injectable, OnModuleInit } from '@nestjs/common';
    import { PrismaClient } from '@prisma/client';
    
    @Injectable()
    export class PrismaService extends PrismaClient implements OnModuleInit {
      async onModuleInit() {
        await this.$connect();
      }
    }
    ```
    
7. Import `PrismaService` as a provider inside the module.
    
    ```tsx
    import { Module } from '@nestjs/common';
    import { AppController } from './app.controller';
    import { AppService } from './app.service';
    import { PrismaService } from './prisma.service';
    
    @Module({
      imports: [],
      controllers: [AppController],
      providers: [AppService, PrismaService],
    })
    export class AppModule {}
    ```
    
8. Use the `PrismaService` where needed.
    
    ```tsx
    import { Injectable } from '@nestjs/common';
    import { PrismaService } from './prisma.service';
    import { User } from '@prisma/client';
    
    @Injectable()
    export class AppService {
      constructor(public readonly prisma: PrismaService) {}
    
      getHello(): string {
        return 'Hello World!';
      }
    
      async getUsers(): Promise<User[]> {
        const users = await this.prisma.user.findMany();
        return users;
      }
    }
    ```
    

## Advantages

- Schema definitions and updates are tracked inside the repository.
- Schema definitions are decoupled from the API repository.
- PrismaClient that is exported from the `database` package can be reused.

## Limitations

- NestJS application requires defining `PrismaService`.
