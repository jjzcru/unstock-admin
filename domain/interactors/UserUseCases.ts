import { UseCase } from './UseCase';
import { throwError } from '@errors';

import { User } from '../model/User';
import { EmailService } from '../service/EmailService';
import { EmailDataService } from '../../data/services/EmailDataService';

import { UserRepository } from '../repository/UserRepository';
import { StoreRepository } from '../repository/StoreRepository';
import UserDataRepository from '@data/db/UserDataRepository';
import StoreDataRepository from '@data/db/StoreDataRepository';
import { AuthorizationRequest } from '@domain/model/AuthorizationRequest';

export class GetAuthRequest implements UseCase {
    private email: string;
    private domain: string;
    private emailService: EmailService;
    private repository: UserRepository;
    private storeRepository: StoreRepository;
    private userRepository: UserRepository;

    constructor(
        params: {
            email: string;
            domain: string;
        },
        emailsService: EmailService = new EmailDataService(),
        repository: UserRepository = new UserDataRepository(),
        storeRepository: StoreRepository = new StoreDataRepository(),
        userRepository: UserRepository = new UserDataRepository()
    ) {
        this.email = params.email;
        this.domain = params.domain;
        this.emailService = emailsService;
        this.repository = repository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }
    async execute(): Promise<AuthorizationRequest> {
        console.log('Domain: ' + this.domain);
        console.log('Email: ' + this.email);

        const user = await this.userRepository.getUserByEmail(this.email);
        if (!user) {
            throwError('COSTUMER_NOT_FOUND');
        }

        const store = await this.storeRepository.getStoreByDomain(this.domain);
        if (!store) {
            throwError('INVALID_STORE');
        }

        const id = store.id;
        const authRequest = await this.repository.getAuthRequest({
            storeId: id,
            email: this.email,
            type: 'admin',
        });

        console.log(authRequest.code);

        const emailTitle = 'Codigo de activacion';

        // TODO Esto va a romper en la implementacion

        /*await this.emailService.sendEmail({
            email: this.email,
            subject: emailTitle,
            body: this.generateEmailMessage({
                code: authRequest.code,
                title: emailTitle,
            }),
        });*/

        return authRequest;
    }

    generateEmailMessage(params: { code: number; title: string }): string {
        const { title, code } = params;
        return `<!DOCTYPE html>
		<html>

		<head>
			<meta charset='UTF-8' />
			<title>${title}</title>
		</head>

		<body>
			<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
				<tr>
					<td align='center' valign='top'>
						<table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
							<tr style='background-color:#99ccff;'>
								<td align='center' valign='top'>
									<table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
										<tr style='font-size: 1.5rem'>
											<td align='center' valign='top' style='color:#337ab7;'>
												<h3>${title}</h3>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							<tr style='background-color:#74a9d8;'>
								<td align='center' valign='top'>
									<table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailReply'>
										<tr style='font-size: 1.2rem'>
											<td align='center' valign='top'> <span style='color:#286090; font-weight:bold;'>
												${code}
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>

		</html>`;
    }
}

export class ValidateAuthRequest implements UseCase {
    private email: string;
    private code: number;
    private domain: string;
    private storeId: string;
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
