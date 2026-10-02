import { Customer } from './models/customer.model';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
export declare class CustomersService {
    private readonly customerModel;
    constructor(customerModel: typeof Customer);
    create(organizationId: string, dto: CreateCustomerDto): Promise<Customer>;
    findAll(organizationId: string, query: QueryCustomerDto): Promise<{
        data: Customer[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Customer>;
    update(organizationId: string, id: string, dto: UpdateCustomerDto): Promise<Customer>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
