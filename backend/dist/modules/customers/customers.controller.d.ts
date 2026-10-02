import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(user: UserPayload, dto: CreateCustomerDto): Promise<import("./models/customer.model").Customer>;
    findAll(user: UserPayload, query: QueryCustomerDto): Promise<{
        data: import("./models/customer.model").Customer[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/customer.model").Customer>;
    update(user: UserPayload, id: string, dto: UpdateCustomerDto): Promise<import("./models/customer.model").Customer>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
