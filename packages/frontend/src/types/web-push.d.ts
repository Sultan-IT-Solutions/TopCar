declare module 'web-push' {
    type PushSubscription = {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    };

    type VapidDetails = {
        subject: string;
        publicKey: string;
        privateKey: string;
    };

    type SendResult = {
        statusCode?: number;
        body?: string;
        headers?: Record<string, string>;
    };

    const webpush: {
        setVapidDetails(
            subject: string,
            publicKey: string,
            privateKey: string,
        ): void;
        generateVAPIDKeys(): {
            publicKey: string;
            privateKey: string;
        };
        sendNotification(
            subscription: PushSubscription,
            payload?: string,
            options?: Partial<VapidDetails> & Record<string, unknown>,
        ): Promise<SendResult>;
    };

    export default webpush;
}
