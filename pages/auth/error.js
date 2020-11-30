import { Button, Text, Link } from '@geist-ui/react';

export default function Error() {
    return (
        <div>
            <div>
                <Text h2>Error de autenticacion</Text>
            </div>
            <div>
                <Link href="/">
                    {' '}
                    <Button shadow type="secondary">
                        Regresar
                    </Button>
                </Link>
            </div>
        </div>
    );
}
