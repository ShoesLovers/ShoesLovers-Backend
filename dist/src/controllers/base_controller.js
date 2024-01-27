"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class BaseController {
    constructor(model) {
        this.model = model;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("getAllUsers");
            try {
                if (req.query.name) {
                    const user = yield this.model.find({ name: req.query.name });
                    res.send(user);
                }
                else {
                    const user = yield this.model.find();
                    res.send(user);
                }
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("getUserById:" + req.params.id);
            try {
                const user = yield this.model.findById(req.params.id);
                res.send(user);
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
    }
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("postUser:" + req.body);
            try {
                yield this.model.create(req.body);
                res.send("OK");
            }
            catch (err) {
                console.log(err);
                res.status(500).send("fail: " + err.message);
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("deleteUser");
            res.send("Test delete user!");
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("updateUser");
            res.send("Test update user!");
        });
    }
}
module.exports = BaseController;
//# sourceMappingURL=base_controller.js.map