import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Neo4jService } from 'nest-neo4j';
import { Client } from './clients.interface';
import { v4 as uuid } from 'uuid';
import { Neo4jHelper } from '../../common/helpers/neo4j.helper';

@Injectable()
export class ClientsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  private NOT_FOUND_EXCEPTION_MESSAGE = 'client not found';

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const createClientQuery = `
    CREATE (c: Clients {id: $id, name: $name, phone: $phone, email: $email, cpf: $cpf})
    RETURN c
    `;

    const client: Client = {
      id: uuid(),
      ...createClientDto,
    };

    const session = this.neo4jService.getWriteSession();
    const response = await session.run(createClientQuery, client);
    await session.close();

    return Neo4jHelper.formatResponse<Client>(response)[0];
  }

  async findAll(): Promise<Client[]> {
    const findAllClientsQuery = `
    MATCH (c: Clients)
    RETURN c
    `;

    const session = this.neo4jService.getReadSession();
    const response = await session.run(findAllClientsQuery);

    return Neo4jHelper.formatResponse<Client>(response);
  }

  async findOne(id: string): Promise<Client> {
    const findOneClientQuery = `
    MATCH (c: Clients {id: $id})
    RETURN c
    LIMIT 1
    `;

    const session = this.neo4jService.getReadSession();
    const response = await session.run(findOneClientQuery, { id });

    const client = Neo4jHelper.formatResponse<Client>(response)[0];

    this.checkClient(client);

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const currentClient = await this.findOne(id);

    const updateClientQuery = `
    MATCH (c: Clients {id: $id}) 
    SET c.name = $name, c.phone = $phone, c.email = $email, c.cpf = $cpf 
    RETURN c
    `;

    const newClient: Client = {
      ...currentClient,
      ...updateClientDto,
    };

    const session = this.neo4jService.getWriteSession();
    const response = await session.run(updateClientQuery, newClient);
    await session.close();

    return Neo4jHelper.formatResponse<Client>(response)[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const deleteClientQuery = `
    MATCH (c: Clients {id: $id})
    DELETE c
    `;

    const session = this.neo4jService.getWriteSession();
    await session.run(deleteClientQuery, { id });
    await session.close();
  }

  private checkClient(client?: Client) {
    if (!client) {
      throw new NotFoundException(this.NOT_FOUND_EXCEPTION_MESSAGE);
    }
  }
}
