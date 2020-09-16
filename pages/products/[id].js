export async function getServerSideProps(ctx) {
    // Esto ocurre fuera del live cycle de un component
    // Esto es server side antes de que llegue al cliente
    const { id } = ctx.params;
    return {
        props: { id },
    };
}

// Aqui es cuando ya llego al cliente

export default class Product extends React.Component {
    render() {
        const { id } = this.props;
        return <p>Product id: {id}</p>;
    }
}
