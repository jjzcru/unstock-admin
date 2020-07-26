import {
	AddProduct,
	AddProductParams,
	GetProducts,
	GetProductByID,
	DeleteProduct,
} from '../../../domain/interactors/ProductsUseCases';
import { ProductRepository } from '../../../domain/repository/ProductRepository';
import { TestProductRepository } from './repository/TestProductRepository';

describe('ProductUseCases', () => {
	let productRepository: ProductRepository;
	let id: string;
	let StoreID: string;
	beforeAll(() => {
		StoreID = '63fe241d-1699-4b2b-b271-caa61a35883d';
		productRepository = new TestProductRepository();
	});
	describe('AddProduct', () => {
		it('Should create a new product', async () => {
			const params: AddProductParams = {
				name: 'Test',
				store_id: StoreID,
				body: 'New product description',
				price: 20.0,
				quantity: 10,
				tags: ['example'],
				category: 'General',
				sku: 'NP000001',
				barcode: '3030303030',
				inventory_policy: 'allow'
			};
			const useCase = new AddProduct(params, productRepository);
			const product = await useCase.execute();
			id = product.id;

			expect(product.id).toBeTruthy();
			expect(product.id).toBe('1');
			expect(product.store_id).toBe(params.store_id);
			expect(product.name).toBe(params.name);
			expect(product.body).toBe(params.body);
			expect(product.tags).toEqual(params.tags);
			expect(product.category).toBe(params.category);
			expect(product.variants.length).toBe(1);
			expect(product.options.length).toBe(1);

			const variant = product.variants[0];
			expect(variant.price).toBe(params.price);
			expect(variant.quantity).toBe(params.quantity);
			expect(variant.sku).toBe(params.sku);
			expect(variant.barcode).toBe(params.barcode);
		});
	});
	describe('GetProducts', () => {
		it('Should get all the products', async () => {
			const useCase = new GetProducts(productRepository);
			const products = await useCase.execute();
			expect(products).toHaveLength(1);
		});
	});
	describe('GetProductByID', () => {
		it('Should get a product by its id', async () => {
			const useCase = new GetProductByID(id, productRepository);
			const product = await useCase.execute();
			expect(product).toBeTruthy();
			expect(product.id).toBe(id);
		});
		it('Should return null because the id do not exist', async () => {
			const useCase = new GetProductByID(`${id}-`, productRepository);
			const product = await useCase.execute();
			expect(product).toBeFalsy();
		});
	});
	describe('DeleteProduct', () => {
		it('Should delete a product by its id', async () => {
			const totalOfProducts = (
				await new GetProducts(productRepository).execute()
			).length;

			const useCase = new DeleteProduct(id, productRepository);
			const product = await useCase.execute();

			const newTotalOfProducts = (
				await new GetProducts(productRepository).execute()
			).length;

			expect(product).toBeTruthy();
			expect(product.id).toBe(id);
			expect(newTotalOfProducts).toBeLessThan(totalOfProducts);
		});
		it('Should return null because the id do not exist', async () => {
			const useCase = new DeleteProduct(`${id}-`, productRepository);
			const product = await useCase.execute();
			expect(product).toBeFalsy();
		});
	});
});
