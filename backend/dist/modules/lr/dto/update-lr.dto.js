"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLrDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_lr_dto_1 = require("./create-lr.dto");
class UpdateLrDto extends (0, swagger_1.PartialType)(create_lr_dto_1.CreateLrDto) {
}
exports.UpdateLrDto = UpdateLrDto;
//# sourceMappingURL=update-lr.dto.js.map