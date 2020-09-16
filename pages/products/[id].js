import { useRouter } from 'next/router';

const Product = () => {
    const router = useRouter();
    const { id } = router.query;

    return <p>Este es el id del producto: {id}</p>;
};

export default Product;
