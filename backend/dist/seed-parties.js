"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const sequelize_1 = require("@nestjs/sequelize");
const customer_model_1 = require("./modules/customers/models/customer.model");
const organization_model_1 = require("./modules/organizations/models/organization.model");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const orgModel = app.get((0, sequelize_1.getModelToken)(organization_model_1.Organization));
    const customerModel = app.get((0, sequelize_1.getModelToken)(customer_model_1.Customer));
    const org = await orgModel.findOne({ where: { code: 'FAST_TRK' } });
    if (!org) {
        console.error('FastTrack org not found. Run seed-company.ts first.');
        process.exit(1);
    }
    const parties = [
        {
            name: 'Tata Steel Ltd',
            code: 'TATA-001',
            type: 'SHIPPER',
            gstin: '27AADCT2803F1ZV',
            pan: 'AADCT2803F',
            email: 'logistics@tatasteel.com',
            phone: '9876500001',
            addressLine1: 'Bombay House, 24 Homi Mody Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            status: 'ACTIVE',
        },
        {
            name: 'Reliance Industries Ltd',
            code: 'RIL-001',
            type: 'BOTH',
            gstin: '27AAACR4849R1Z8',
            pan: 'AAACR4849R',
            email: 'freight@ril.com',
            phone: '9876500002',
            addressLine1: 'Maker Chambers IV, Nariman Point',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400021',
            status: 'ACTIVE',
        },
        {
            name: 'Maruti Suzuki India Ltd',
            code: 'MSIL-001',
            type: 'CONSIGNEE',
            gstin: '06AAACM3025E1ZV',
            pan: 'AAACM3025E',
            email: 'logistics@maruti.co.in',
            phone: '9876500003',
            addressLine1: 'Plot No. 1, Nelson Mandela Road',
            city: 'Gurugram',
            state: 'Haryana',
            pincode: '122015',
            status: 'ACTIVE',
        },
        {
            name: 'Hindustan Unilever Ltd',
            code: 'HUL-001',
            type: 'BOTH',
            gstin: '27AAACH4130A1ZQ',
            pan: 'AAACH4130A',
            email: 'supply@hul.co.in',
            phone: '9876500004',
            addressLine1: 'Unilever House, B.D. Sawant Marg',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400099',
            status: 'ACTIVE',
        },
        {
            name: 'ITC Limited',
            code: 'ITC-001',
            type: 'SHIPPER',
            gstin: '19AAACI1681G1ZK',
            pan: 'AAACI1681G',
            email: 'logistics@itc.in',
            phone: '9876500005',
            addressLine1: 'Virginia House, 37 Jawaharlal Nehru Road',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700071',
            status: 'ACTIVE',
        },
        {
            name: 'Bajaj Auto Ltd',
            code: 'BAL-001',
            type: 'CONSIGNEE',
            gstin: '27AAACB4006A1ZX',
            pan: 'AAACB4006A',
            email: 'dispatch@bajajauto.com',
            phone: '9876500006',
            addressLine1: 'Mumbai-Pune Road, Akurdi',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411035',
            status: 'ACTIVE',
        },
        {
            name: 'Sun Pharma Industries',
            code: 'SPI-001',
            type: 'SHIPPER',
            gstin: '24AAACS7878R1Z6',
            pan: 'AAACS7878R',
            email: 'logistics@sunpharma.com',
            phone: '9876500007',
            addressLine1: 'SPARC, Tandalja',
            city: 'Vadodara',
            state: 'Gujarat',
            pincode: '390020',
            status: 'ACTIVE',
        },
        {
            name: 'Infosys BPM Ltd',
            code: 'INF-001',
            type: 'BOTH',
            gstin: '29AAACI1681G1ZG',
            pan: 'AAACI1681G',
            email: 'supply@infosys.com',
            phone: '9876500008',
            addressLine1: 'Electronics City, Phase 1',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560100',
            status: 'INACTIVE',
        },
    ];
    let created = 0;
    for (const p of parties) {
        const exists = await customerModel.findOne({ where: { code: p.code, organizationId: org.id } });
        if (!exists) {
            await customerModel.create({ ...p, organizationId: org.id });
            created++;
            console.log(`✅ Created party: ${p.name}`);
        }
        else {
            console.log(`⏭️  Skipped (exists): ${p.name}`);
        }
    }
    console.log(`\n✔ Done! ${created} parties inserted.`);
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed-parties.js.map