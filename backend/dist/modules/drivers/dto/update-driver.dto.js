"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDriverDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_driver_dto_1 = require("./create-driver.dto");
class UpdateDriverDto extends (0, swagger_1.PartialType)(create_driver_dto_1.CreateDriverDto) {
}
exports.UpdateDriverDto = UpdateDriverDto;
//# sourceMappingURL=update-driver.dto.js.map