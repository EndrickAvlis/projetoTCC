import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

export default class VoluntarioService extends BaseService {
    constructor(){
        super(prisma.voluntario);
    }
}