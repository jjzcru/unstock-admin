import FileServices from '@data/services/FileServices';

describe.skip('FileServices', () => {
    let fileServices: FileServices;
    beforeAll(() => {
        fileServices = new FileServices();
    });
    describe('#uploadImages', () => {
        it.skip('Should upload an image', async () => {
            const filePath = process.env.TEST_UPLOAD_FILE_PATH;
            const key = process.env.TEST_UPLOAD_FILE_KEY;
            const bucket = process.env.TEST_UPLOAD_FILE_BUCKET;
            const response = await fileServices.uploadImages({
                filePath,
                key,
                bucket,
            });
            expect(response.url).toEqual(key);
        });
    });
});
