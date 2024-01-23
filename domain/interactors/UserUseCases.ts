import { UseCase } from './UseCase';
import { throwError } from '@errors';

import { User } from '../model/User';
import { Store, StoreEmail } from '../model/Store';

import { UserRepository } from '../repository/UserRepository';
import { StoreRepository } from '../repository/StoreRepository';
import UserDataRepository from '@data/db/UserDataRepository';
import StoreDataRepository from '@data/db/StoreDataRepository';
import { AuthorizationRequest } from '@domain/model/AuthorizationRequest';

import { EmailService } from '../service/EmailService';
import { EmailTemplateService } from '../service/EmailTemplateService';

import { EmailDataService } from '@data/services/EmailDataService';
import { EmailTemplateDataService } from '@data/services/EmailTemplateDataService';

export class GetAuthRequest implements UseCase {
    private email: string;
    private domain: string;

    private repository: UserRepository;
    private storeRepository: StoreRepository;
    private userRepository: UserRepository;

    private lang: string;
    private emailService: EmailService;
    private emailTemplateService: EmailTemplateService;
    private store: Store;
    private storeEmail: StoreEmail;

    constructor(
        params: {
            email: string;
            domain: string;
            lang?: string;
        },
        emailsService: EmailService = new EmailDataService(),
        emailTemplateService: EmailTemplateService = new EmailTemplateDataService(),
        repository: UserRepository = new UserDataRepository(),
        storeRepository: StoreRepository = new StoreDataRepository(),
        userRepository: UserRepository = new UserDataRepository()
    ) {
        this.email = params.email;
        this.domain = params.domain;
        this.emailService = emailsService;
        this.emailTemplateService = emailTemplateService;
        this.repository = repository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }
    async execute(): Promise<AuthorizationRequest> {
        this.store = await this.storeRepository.getStoreByDomain(this.domain);
        if (!this.store) {
            throwError('INVALID_STORE');
        }
        const { id } = this.store;

        const user = await this.userRepository.getUserByEmail(this.email, id);
        if (!user) {
            throwError('COSTUMER_NOT_FOUND');
        }

        this.storeEmail = await this.storeRepository.getEmail(id);

        const authRequest = await this.repository.getAuthRequest({
            storeId: id,
            email: this.email,
            type: 'admin',
        });

        console.log(`Authorization Code: ${authRequest.code}`);
        console.log(authRequest.code);

        const { code } = authRequest;
        const subject = 'Codigo de activacion';
        const body = await this.getEmailBody(code);

        /*await this.emailService.sendEmail({
            email: this.email,
            subject,
            body,
        });*/

        return authRequest;
    }

    async getEmailBody(code: number): Promise<string> {
        const { name } = this.store;
        //  const { theme } = this.storeEmail;

        const body = await this.emailTemplateService.getAuthTemplate({
            lang: this.lang,
            name,
            code,
            theme: null,
        });

        return body;
    }
}

export class ValidateAuthRequest implements UseCase {
    private email: string;
    private code: number;
    private domain: string;
    private storeId: string;
    private store: any;
    private userRepository: UserRepository;
    private user: User;
    private storeRepository: StoreRepository;

    constructor(
        params: {
            email: string;
            domain: string;
            code: number;
        },
        userRepository: UserRepository = new UserDataRepository(),
        storeRepository: StoreRepository = new StoreDataRepository()
    ) {
        this.email = params.email;
        this.domain = params.domain;
        this.code = params.code;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
    }
    async execute(): Promise<User> {
        const { id } = await this.storeRepository.getStoreByDomain(this.domain);
        this.storeId = id;
        if (!(await this.isValidCode())) {
            throw new Error('INVALID_AUTH_CODE');
        }
        this.user = await this.userRepository.getUserByEmail(
            this.email,
            this.storeId
        );
        const { name } = await this.storeRepository.getStoreById(
            this.user.storeId
        );
        this.user.storeName = name;
        return this.user;
    }

    async isValidCode(): Promise<boolean> {
        return this.userRepository.validateAuthRequest({
            storeId: this.storeId,
            email: this.email,
            type: 'admin',
            code: this.code,
        });
    }
}
