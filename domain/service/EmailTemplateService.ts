export interface EmailTemplateService {
	getAuthTemplate(params: AuthTemplateParams): Promise<string>;
}

export interface AuthTemplateParams {
	lang: string;
	name: string;
	code: number;
	theme: any;
}
