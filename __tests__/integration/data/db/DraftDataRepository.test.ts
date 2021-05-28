import { runQuery } from '@data/db/db';
import DraftDataRepository from '@data/db/DraftDataRepository';
import { Draft } from '@domain/model/Draft';
import {
    DraftParams,
    DraftRepository,
    DraftOrderItemParams,
} from '@domain/repository/DraftRepository';

describe.only('DraftDataRepository', () => {
    let draftRepository: DraftRepository;
    const storeId: string = '04c4315e-c73f-49a6-acbf-cf91a07996e3';
    let draftId: string;

    beforeAll(async () => {
        draftRepository = new DraftDataRepository();
    });

    it('Should create a new draft', async () => {
        const params: DraftParams = {
            storeId: '04c4315e-c73f-49a6-acbf-cf91a07996e3',
            address: null,
            subtotal: 1.0,
            tax: 0.07,
            total: 1.07,
            currency: 'PAB',
            shippingType: 'delivery',
            status: 'open',
            message: '',
            pickupLocation: null,
            paymentMethod: null,
            shippingOption: null,
            costumer: null,
            shippingLocation: null,
        };

        const draft = await draftRepository.createDraft(params);
        const {
            id,

            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            items,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
        } = draft;

        console.log(draft);
        expect(id).not.toBeUndefined();

        draftId = id;
    });

    it('Should add items to the created draft', async () => {
        const params: DraftOrderItemParams[] = [
            {
                draftId,
                variantId: '87b6b51b-a509-48a6-a870-f48c6375f62b',
                price: 10.0,
                sku: '123123',
                quantity: 4,
            },
        ];
        const items = [];
        // for (let index = 0; index < params.length; index++) {
        //     const draftItem = await draftRepository.addDraftItem(
        //         storeId,
        //         draftId,
        //         params[index]
        //     );
        //     items.push(draftItem);
        // }

        console.log(items);
        //  expect(draftItem.id).not.toBeUndefined();
    });

    it('Should cancel a draft', async () => {
        const cancelDraft = await draftRepository.cancelDraft(storeId, draftId);
        console.log(cancelDraft);
        expect(cancelDraft.status).toEqual('cancelled');
    });

    // it('Should archive a draft', async () => {
    //     const cancelDraft = await draftRepository.archiveDraft(
    //         storeId,
    //         draftId
    //     );
    //     console.log(cancelDraft);
    //     expect(cancelDraft.status).toEqual('archived');
    // });

    // it('Should mark draft as paid', async () => {
    //     const cancelDraft = await draftRepository.paidDraft(
    //         storeId,
    //         draftId
    //     );
    //     expect(cancelDraft.status).toEqual('paid');
    // });

    // FALTA
    // MODIFICAR LOS ITEMS
    // CREAR ORDEN
    // BORRAR ORDEN
    // BORRAR ITEMS
    // BORRAR ITEMS
    // BORRAR DRAFT
});
