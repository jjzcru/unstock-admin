import { GetProductByID, DeleteProduct } from '../../../domain/interactors/ProductsUseCases';

export default async (req, res) => {
	switch (req.method) {
		case 'GET':
			await getProduct(req, res);
			break;
		case 'DELETE':
			await deleteProduct(req, res);
			break;
		default:
			res.status(404).send({ error: 'Not found' });
	}
};

async function getProduct(req, res) {
	const {
		query: { id },
	} = req;

	try {
		if(!isValidUUID(id)) {
			res.status(400).send({error: 'Invalid id'});
			return;
		}

		const useCase = new GetProductByID(id);
		const product = await useCase.execute();
		if(!!product) {
			res.send({ product });
			return;
		}
		res.status(404).send({error: 'Product not found'});
		
	} catch (e) {
		res.status(500).send({ error: e.message });
	}
}

async function deleteProduct(req, res){
	const {
		query: { id },
	} = req;

	try {
		if(!isValidUUID(id)) {
			res.status(400).send({error: 'Invalid id'});
			return;
		}

		const useCase = new DeleteProduct(id);
		const product = await useCase.execute();
		if(!!product) {
			res.send({ product });
			return;
		}
		res.status(404).send({error: 'Product not found'});
		
	} catch (e) {
		res.status(500).send({ error: e.message });
	}
}

function isValidUUID(id: string) {
	if(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
		return true;
	}
	return false;
}